package handler

import (
	"encoding/csv"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"

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
	Timing     TimingInfo           `json:"timing"`
}

// PaginationInfo represents the pagination details.
type PaginationInfo struct {
	CurrentPage int `json:"current_page"`
	PageSize    int `json:"page_size"`
	TotalPages  int `json:"total_pages"`
	TotalItems  int `json:"total_items"`
}

// TimingInfo represents the timing details of the processing.
type TimingInfo struct {
	StartedAt   int64 `json:"started_at"`   // Unix timestamp when processing started
	CompletedAt int64 `json:"completed_at"` // Unix timestamp when processing completed
	DurationMs  int64 `json:"duration_ms"`  // Total processing time in milliseconds
}

// HandleGetResult is the Gin handler function for the results endpoint.
// Query parameters:
// - page: page number for pagination (default: 1)
// - limit: number of items per page (default: 100)
// - filter: filter by specific field (nome, categoria, preco, estoque, fornecedor)
// - type: filter by error type (mismatch, missing_in_api, missing_in_csv)
// - value: filter by specific value in the field (case-insensitive substring match)
//
// Examples:
// - GET /results/123?filter=nome - Get all mismatches in the nome field
// - GET /results/123?filter=categoria&value=electronics - Get categoria mismatches containing "electronics"
// - GET /results/123?type=mismatch&filter=preco - Get only mismatches in the preco field
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

	// Get filter parameters
	filterField := c.Query("filter")      // Filter by specific field (nome, categoria, preco, estoque, fornecedor)
	filterType := c.Query("type")        // Filter by error type (mismatch, missing_in_api, missing_in_csv)
	filterValue := c.Query("value")      // Filter by specific value in the field

	result, err := h.Redis.GetResult(jobID)
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found or expired"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve results"})
		return
	}

	// Apply filter if specified
	var filteredErrors []models.ErrorDetail
	if filterField != "" || filterType != "" || filterValue != "" {
		filteredErrors = h.applyFilters(result.Errors, filterField, filterType, filterValue)
		fmt.Printf("[DEBUG] Filtering results: field='%s', type='%s', value='%s'\n", 
			filterField, filterType, filterValue)
		fmt.Printf("[DEBUG] Original errors: %d, Filtered errors: %d\n", len(result.Errors), len(filteredErrors))
	} else {
		filteredErrors = result.Errors
	}

	totalItems := len(filteredErrors)
	totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))

	start := (page - 1) * pageSize
	end := start + pageSize

	if start > totalItems {
		start = totalItems
	}
	if end > totalItems {
		end = totalItems
	}

	paginatedErrors := filteredErrors[start:end]

	c.JSON(http.StatusOK, PaginatedResults{
		Summary: result.Summary,
		Errors:  paginatedErrors,
		Pagination: PaginationInfo{
			CurrentPage: page,
			PageSize:    pageSize,
			TotalPages:  totalPages,
			TotalItems:  totalItems,
		},
		Timing: TimingInfo{
			StartedAt:   result.StartedAt,
			CompletedAt: result.CompletedAt,
			DurationMs:  result.DurationMs,
		},
	})
}

// applyFilters applies multiple filters to the errors list
func (h *ResultsHandler) applyFilters(errors []models.ErrorDetail, filterField, filterType, filterValue string) []models.ErrorDetail {
	var filtered []models.ErrorDetail
	
	for _, err := range errors {
		// Check if this error passes all filters
		if h.matchesFilters(err, filterField, filterType, filterValue) {
			filtered = append(filtered, err)
		}
	}
	
	return filtered
}

// matchesFilters checks if an error matches all the specified filters
func (h *ResultsHandler) matchesFilters(err models.ErrorDetail, filterField, filterType, filterValue string) bool {
	// Filter by error type
	if filterType != "" && err.Type != filterType {
		return false
	}
	
	// Filter by specific field
	if filterField != "" {
		if err.Fields == nil {
			return false // No fields means no mismatches
		}
		if _, exists := err.Fields[filterField]; !exists {
			return false // Field doesn't exist in this error
		}
		
		// If we also have a value filter, check the field values
		if filterValue != "" {
			field := err.Fields[filterField]
			apiValue := fmt.Sprint(field.APIValue)
			csvValue := fmt.Sprint(field.CSVValue)
			
			// Check if either API value or CSV value contains the filter value (case-insensitive)
			if !strings.Contains(strings.ToLower(apiValue), strings.ToLower(filterValue)) &&
			   !strings.Contains(strings.ToLower(csvValue), strings.ToLower(filterValue)) {
				return false
			}
		}
	}
	
	return true
}

// HandleExportResult exports the full comparison result stored in Redis as JSON or CSV.
// Query params:
// - format: "json" (default) or "csv"
func (h *ResultsHandler) HandleExportResult(c *gin.Context) {
	jobID := c.Param("job_id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id is required"})
		return
	}

	format := c.DefaultQuery("format", "json")

	result, err := h.Redis.GetResult(jobID)
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found or expired"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve results"})
		return
	}

	switch format {
	case "csv":
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"result-%s.csv\"", jobID))
		c.Header("Content-Type", "text/csv")

		writer := csv.NewWriter(c.Writer)
		defer writer.Flush()

		// Header
		header := []string{
			"type", "api_id", "csv_line", "nome",
			"nome_api", "nome_csv",
			"categoria_api", "categoria_csv",
			"preco_api", "preco_csv",
			"estoque_api", "estoque_csv",
			"fornecedor_api", "fornecedor_csv",
			"started_at", "completed_at", "duration_ms",
		}
		if err := writer.Write(header); err != nil {
			c.Status(http.StatusInternalServerError)
			return
		}

		// Rows for each error
		for _, e := range result.Errors {
			// Default values
			var (
				nomeAPI, nomeCSV             string
				categoriaAPI, categoriaCSV   string
				precoAPI, precoCSV           string
				estoqueAPI, estoqueCSV       string
				fornecedorAPI, fornecedorCSV string
			)

			if e.Fields != nil {
				if d, ok := e.Fields["nome"]; ok {
					nomeAPI = fmt.Sprint(d.APIValue)
					nomeCSV = fmt.Sprint(d.CSVValue)
				}
				if d, ok := e.Fields["categoria"]; ok {
					categoriaAPI = fmt.Sprint(d.APIValue)
					categoriaCSV = fmt.Sprint(d.CSVValue)
				}
				if d, ok := e.Fields["preco"]; ok {
					precoAPI = fmt.Sprint(d.APIValue)
					precoCSV = fmt.Sprint(d.CSVValue)
				}
				if d, ok := e.Fields["estoque"]; ok {
					estoqueAPI = fmt.Sprint(d.APIValue)
					estoqueCSV = fmt.Sprint(d.CSVValue)
				}
				if d, ok := e.Fields["fornecedor"]; ok {
					fornecedorAPI = fmt.Sprint(d.APIValue)
					fornecedorCSV = fmt.Sprint(d.CSVValue)
				}
			}

			row := []string{
				e.Type,
				fmt.Sprint(e.APIID),
				fmt.Sprint(e.CSVLine),
				e.Nome,
				nomeAPI, nomeCSV,
				categoriaAPI, categoriaCSV,
				precoAPI, precoCSV,
				estoqueAPI, estoqueCSV,
				fornecedorAPI, fornecedorCSV,
				fmt.Sprint(result.StartedAt),
				fmt.Sprint(result.CompletedAt),
				fmt.Sprint(result.DurationMs),
			}
			if err := writer.Write(row); err != nil {
				c.Status(http.StatusInternalServerError)
				return
			}
		}

		c.Status(http.StatusOK)
		return

	case "json":
		fallthrough
	default:
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"result-%s.json\"", jobID))
		c.JSON(http.StatusOK, result)
		return
	}
}
