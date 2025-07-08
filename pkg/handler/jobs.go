package handler

import (
	"net/http"

	"hackathon-go/internal/storage"

	"github.com/gin-gonic/gin"
)

// JobsHandler handles requests for job listings.
type JobsHandler struct {
	Redis *storage.RedisClient
}

// HandleGetJobs retrieves all job IDs and returns them as a JSON response.
func (h *JobsHandler) HandleGetJobs(c *gin.Context) {
	jobIDs, err := h.Redis.GetAllJobIDs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve job IDs"})
		return
	}

	if jobIDs == nil {
		jobIDs = []string{}
	}

	c.JSON(http.StatusOK, gin.H{"job_ids": jobIDs})
}
