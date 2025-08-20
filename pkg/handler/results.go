package handler

import (
	"encoding/csv"
	"fmt"
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
