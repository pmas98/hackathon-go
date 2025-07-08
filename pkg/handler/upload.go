package handler

import (
	"net/http"
	"time"

	"hackathon-go/internal/api"
	"hackathon-go/internal/comparison"
	"hackathon-go/internal/csv"
	"hackathon-go/internal/storage"

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

	csvProducts, err := csv.ParseProducts(f)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse CSV: " + err.Error()})
		return
	}

	jobID := uuid.New().String()
	c.JSON(http.StatusOK, gin.H{"job_id": jobID})

	// Run comparison in a goroutine to not block the request
	go func() {
		apiProducts, err := api.FetchProducts()
		if err != nil {
			// In a real-world scenario, you'd have a better way to handle this error,
			// maybe by updating the job status in Redis to "failed".
			return
		}

		result := comparison.CompareProducts(apiProducts, csvProducts)
		h.Redis.SaveResult(jobID, &result, time.Hour*24)
	}()
}
