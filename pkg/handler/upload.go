package handler

import (
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

	// Inform websocket clients that job has been created
	ws.HubInstance.Send(jobID, "job_created")
	ws.HubInstance.Send(jobID, "parsing_csv")

	csvProducts, err := csv.ParseProducts(f)
	if err != nil {
		ws.HubInstance.Send(jobID, "error_parsing_csv")
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse CSV: " + err.Error()})
		return
	}
	ws.HubInstance.Send(jobID, "csv_parsed")

	// Run comparison in a goroutine to not block the request
	go func() {
		// Step 1: Fetch API products
		ws.HubInstance.Send(jobID, "fetching_api_products")
		apiProducts, err := api.FetchProducts()
		if err != nil {
			ws.HubInstance.Send(jobID, "error_fetching_api_products")
			fmt.Println("Error fetching products from API:", err)
			return
		}
		ws.HubInstance.Send(jobID, "api_products_fetched")

		// Step 2: Compare products
		ws.HubInstance.Send(jobID, "comparing_products")
		result := comparison.CompareProducts(apiProducts, csvProducts)
		ws.HubInstance.Send(jobID, "comparison_done")

		// Step 3: Store results
		h.Redis.SaveResult(jobID, &result, time.Hour*24)
		ws.HubInstance.Send(jobID, "saved_results")
		ws.HubInstance.Send(jobID, "finished")

		fmt.Println("Comparison done")
	}()
}
