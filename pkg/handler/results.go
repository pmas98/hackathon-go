package handler

import (
	"math"
	"net/http"
	"strconv"

	"hackathon-go/internal/models"
	"hackathon-go/internal/storage"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

// ResultsHandler handles the retrieval of comparison results.
type ResultsHandler struct {
	Redis *storage.RedisClient
}

// PaginatedResults represents the paginated results response.
type PaginatedResults struct {
	Summary    models.Summary       `json:"summary"`
	Errors     []models.ErrorDetail `json:"errors"`
	Pagination PaginationInfo       `json:"pagination"`
}

// PaginationInfo represents the pagination details.
type PaginationInfo struct {
	CurrentPage int `json:"current_page"`
	PageSize    int `json:"page_size"`
	TotalPages  int `json:"total_pages"`
	TotalItems  int `json:"total_items"`
}

// HandleGetResult is the Gin handler function for the results endpoint.
func (h *ResultsHandler) HandleGetResult(c *gin.Context) {
	jobID := c.Param("job_id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id is required"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("limit", "100"))
	if err != nil || pageSize < 1 {
		pageSize = 100
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

	totalItems := len(result.Errors)
	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))

	start := (page - 1) * pageSize
	end := start + pageSize

	if start > totalItems {
		start = totalItems
	}
	if end > totalItems {
		end = totalItems
	}

	paginatedErrors := result.Errors[start:end]

	c.JSON(http.StatusOK, PaginatedResults{
		Summary: result.Summary,
		Errors:  paginatedErrors,
		Pagination: PaginationInfo{
			CurrentPage: page,
			PageSize:    pageSize,
			TotalPages:  totalPages,
			TotalItems:  totalItems,
		},
	})
}
