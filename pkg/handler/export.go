package handler

import (
	"fmt"
	"net/http"

	"hackathon-go/internal/storage"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

// ExportHandler handles the exporting of comparison results.
type ExportHandler struct {
	Redis *storage.RedisClient
}

// HandleExport is the Gin handler function for the export endpoint.
func (h *ExportHandler) HandleExport(c *gin.Context) {
	jobID := c.Param("job_id")
	format := c.DefaultQuery("format", "json") // Default to json

	result, err := h.Redis.GetResult(jobID)
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found or expired"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve results"})
		return
	}

	if format == "json" {
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s.json", jobID))
		c.JSON(http.StatusOK, result)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported format"})
	}
}
