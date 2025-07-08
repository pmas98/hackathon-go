package handler

import (
	"net/http"

	"hackathon-go/internal/storage"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

// ResultsHandler handles the retrieval of comparison results.
type ResultsHandler struct {
	Redis *storage.RedisClient
}

// HandleGetResult is the Gin handler function for the results endpoint.
func (h *ResultsHandler) HandleGetResult(c *gin.Context) {
	jobID := c.Param("job_id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id is required"})
		return
	}

	result, err := h.Redis.GetResult(jobID)
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found or expired"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve results"})
		return
	}

	c.JSON(http.StatusOK, result)
}
