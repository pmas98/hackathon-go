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

// HandleGetJobStatus retrieves the current status of a specific job.
func (h *JobsHandler) HandleGetJobStatus(c *gin.Context) {
	jobID := c.Param("job_id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id is required"})
		return
	}

	// Get job status from Redis
	status, err := h.Redis.GetJobStatus(jobID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found or expired"})
		return
	}

	// Get job progress from Redis
	progress, err := h.Redis.GetJobProgress(jobID)
	if err != nil {
		progress = 0 // Default to 0 if progress not found
	}

	// Check if job has results (completed)
	hasResults, _ := h.Redis.HasJobResults(jobID)

	c.JSON(http.StatusOK, gin.H{
		"job_id":       jobID,
		"status":       status,
		"progress":     progress,
		"has_results":  hasResults,
		"is_completed": hasResults,
	})
}
