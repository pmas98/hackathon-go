package handler

import (
	"encoding/json"
	"fmt"
	"hackathon-go/internal/api"
	"hackathon-go/internal/comparison"
	"hackathon-go/internal/csv"
	"hackathon-go/internal/models"
	"hackathon-go/internal/storage"
	"hackathon-go/internal/ws"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UploadHandler handles the CSV upload and comparison initiation.
type UploadHandler struct {
	Redis *storage.RedisClient
}

// sendProgress sends both status and progress updates via WebSocket
func (h *UploadHandler) sendProgress(jobID, status string, progressPercent float64) {
	// Send status update
	ws.HubInstance.Send(jobID, status)

	// Send progress update as JSON
	progressMsg := map[string]float64{"progress": progressPercent}
	if progressJSON, err := json.Marshal(progressMsg); err == nil {
		ws.HubInstance.Send(jobID, string(progressJSON))
	}

	// Store only status in Redis for job status API
	h.Redis.SetJobStatus(jobID, status)
}

// HandleUpload is the Gin handler function for the upload endpoint.
func (h *UploadHandler) HandleUpload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file upload failed"})
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not open file"})
		return
	}
	defer f.Close()

	// Generate job ID early so we can stream progress immediately
	jobID := uuid.New().String()

	// Initialize progress to 0% for this new job
	h.sendProgress(jobID, "initializing", 0.0)

	c.JSON(http.StatusOK, gin.H{"job_id": jobID})

	// Capture start time for processing
	startTime := time.Now()

	// Inform websocket clients that job has been created
	h.sendProgress(jobID, "job_created", 0.1111)
	h.sendProgress(jobID, "parsing_csv", 0.2222)

	csvProducts, err := csv.ParseProducts(f)
	if err != nil {
		h.sendProgress(jobID, "error_parsing_csv", 0)
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse CSV: " + err.Error()})
		return
	}
	h.sendProgress(jobID, "csv_parsed", 0.3333)

	// Run comparison in a goroutine to not block the request
	go func() {
		// Step 1: Check if API products are cached to adjust progress accordingly
		isCached := false
		if _, err := h.Redis.GetAPIProducts(); err == nil {
			isCached = true
			fmt.Println("[DEBUG] API products are cached, using fast progress")
		}

		// Fetch API products with appropriate progress updates
		var apiProducts []models.Product
		var err error

		if isCached {
			// For cached data, use faster progress steps
			h.sendProgress(jobID, "fetching_api_products", 0.4444)
			apiProducts, err = api.FetchProducts(jobID, h.Redis)
			if err != nil {
				h.sendProgress(jobID, "error_fetching_api_products", 0)
				fmt.Println("Error fetching products from API:", err)
				return
			}
			h.sendProgress(jobID, "api_products_fetched", 0.5555)
		} else {
			// For non-cached data, let FetchProducts handle detailed progress during API fetching
			h.sendProgress(jobID, "fetching_api_products", 0.4444)
			apiProducts, err = api.FetchProducts(jobID, h.Redis)
			if err != nil {
				h.sendProgress(jobID, "error_fetching_api_products", 0)
				fmt.Println("Error fetching products from API:", err)
				return
			}
			// After successful fetch, continue with our progress flow
			h.sendProgress(jobID, "api_products_fetched", 0.5555)
		}

		// Step 2: Compare products
		h.sendProgress(jobID, "comparing_products", 0.6666)
		result := comparison.CompareProducts(apiProducts, csvProducts)

		// Calculate processing duration
		endTime := time.Now()
		duration := endTime.Sub(startTime)

		// Add timing information to result
		result.StartedAt = startTime.Unix()
		result.CompletedAt = endTime.Unix()
		result.DurationMs = duration.Milliseconds()

		h.sendProgress(jobID, "comparison_done", 0.7777)

		// Step 3: Store results
		h.Redis.SaveResult(jobID, &result, time.Hour*24)
		h.sendProgress(jobID, "saved_results", 0.8888)
		h.sendProgress(jobID, "finished", 1.0)

		fmt.Printf("Comparison done in %v\n", duration)
	}()
}
