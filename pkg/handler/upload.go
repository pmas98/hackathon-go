package handler

import (
	"encoding/json"
	"fmt"
	"hackathon-go/internal/api"
	"hackathon-go/internal/comparison"
	"hackathon-go/internal/csv"
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

	// Store progress in Redis for API calls
	h.Redis.SetJobStatus(jobID, status)
	h.Redis.SetJobProgress(jobID, int(progressPercent))
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
	c.JSON(http.StatusOK, gin.H{"job_id": jobID})

	// Capture start time for processing
	startTime := time.Now()

	// Inform websocket clients that job has been created
	h.sendProgress(jobID, "job_created", 11.11)
	h.sendProgress(jobID, "parsing_csv", 22.22)

	csvProducts, err := csv.ParseProducts(f)
	if err != nil {
		h.sendProgress(jobID, "error_parsing_csv", 0)
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse CSV: " + err.Error()})
		return
	}
	h.sendProgress(jobID, "csv_parsed", 33.33)

	// Run comparison in a goroutine to not block the request
	go func() {
		// Step 1: Try to get API products from cache first
		h.sendProgress(jobID, "checking_cache", 44.44)

		apiProducts, err := h.Redis.GetAPIProducts()
		if err != nil || len(apiProducts) == 0 {
			// Cache is empty or expired, fetch from API
			h.sendProgress(jobID, "fetching_api_products", 44.44)

			apiProducts, err = api.FetchProducts(jobID)
			if err != nil {
				h.sendProgress(jobID, "error_fetching_api_products", 0)
				return
			}

			// Save the fetched products to cache with 5-minute TTL
			if cacheErr := h.Redis.SaveAPIProducts(apiProducts); cacheErr != nil {
				fmt.Printf("Warning: Failed to save API products to cache: %v\n", cacheErr)
			}

			h.sendProgress(jobID, "api_products_fetched_and_cached", 55.55)
		} else {
			// Use cached products
			h.sendProgress(jobID, "using_cached_api_products", 55.55)
		}

		// Step 2: Compare products
		h.sendProgress(jobID, "comparing_products", 66.66)
		result := comparison.CompareProducts(apiProducts, csvProducts)

		// Calculate processing duration
		endTime := time.Now()
		duration := endTime.Sub(startTime)

		// Add timing information to result
		result.StartedAt = startTime.Unix()
		result.CompletedAt = endTime.Unix()
		result.DurationMs = duration.Milliseconds()

		h.sendProgress(jobID, "comparison_done", 77.77)

		// Step 3: Store results
		h.Redis.SaveResult(jobID, &result, time.Hour*24)
		h.sendProgress(jobID, "saved_results", 88.88)
		h.sendProgress(jobID, "finished", 100.0)

		fmt.Printf("Comparison done in %v\n", duration)
	}()
}
