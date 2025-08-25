package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"

	"hackathon-go/internal/models"
	"hackathon-go/internal/ws"
)

const (
	apiURL = "https://hackathon-produtos-api.onrender.com/api/produtos"
	limit  = 1000
)

// FetchProducts retrieves the product list from the external API, handling pagination concurrently.
// It streams progress updates via the websocket hub using the provided jobID.
func FetchProducts(jobID string) ([]models.Product, error) {

	firstPageURL := fmt.Sprintf("%s?page=1&limit=%d", apiURL, limit)

	resp, err := http.Get(firstPageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch first page from API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api returned non-200 status code for first page: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body for first page: %w", err)
	}

	var firstApiResponse models.APIResponse
	if err := json.Unmarshal(body, &firstApiResponse); err != nil {
		return nil, fmt.Errorf("failed to unmarshal api response for first page: %w", err)
	}

	allProducts := firstApiResponse.Data

	if firstApiResponse.Pagination == nil || !firstApiResponse.Pagination.HasNextPage {
		// Send 100% progress for single page
		finalMsg, _ := json.Marshal(map[string]float64{"progress": 100.0})
		ws.HubInstance.Send(jobID, string(finalMsg))
		return allProducts, nil
	}

	totalPages := firstApiResponse.Pagination.TotalPages

	// Calculate initial progress after first page (first page = 1/totalPages)
	initialProgress := (float64(1) / float64(totalPages)) * 100.0

	// Send initial progress update
	initialProgressJSON, _ := json.Marshal(map[string]float64{"progress": initialProgress})
	ws.HubInstance.Send(jobID, string(initialProgressJSON))

	if totalPages <= 1 {
		finalMsg, _ := json.Marshal(map[string]float64{"progress": 100.0})
		ws.HubInstance.Send(jobID, string(finalMsg))
		return allProducts, nil
	}

	productsChan := make(chan []models.Product, totalPages-1)
	errChan := make(chan error, totalPages-1)
	var wg sync.WaitGroup

	// Track pages fetched and send progress updates
	var fetched int32 = 1 // First page already fetched

	for page := 2; page <= totalPages; page++ {
		wg.Add(1)
		go func(p int) {
			defer wg.Done()

			pageURL := fmt.Sprintf("%s?page=%d&limit=%d", apiURL, p, limit)

			pageResp, err := http.Get(pageURL)
			if err != nil {
				errChan <- fmt.Errorf("failed to fetch page %d from API: %w", p, err)
				return
			}
			defer pageResp.Body.Close()

			if pageResp.StatusCode != http.StatusOK {
				errChan <- fmt.Errorf("api returned non-200 status code for page %d: %d", p, pageResp.StatusCode)
				return
			}

			pageBody, err := io.ReadAll(pageResp.Body)
			if err != nil {
				errChan <- fmt.Errorf("failed to read response body for page %d: %w", p, err)
				return
			}

			var pageApiResponse models.APIResponse
			if err := json.Unmarshal(pageBody, &pageApiResponse); err != nil {
				errChan <- fmt.Errorf("failed to unmarshal api response for page %d: %w", p, err)
				return
			}

			// Increment fetched counter and send progress update
			newVal := atomic.AddInt32(&fetched, 1)
			progressRatio := (float64(newVal) / float64(totalPages)) * 100.0

			progressMsg, _ := json.Marshal(map[string]float64{"progress": progressRatio})
			ws.HubInstance.Send(jobID, string(progressMsg))

			productsChan <- pageApiResponse.Data
		}(page)
	}

	wg.Wait()
	close(productsChan)
	close(errChan)

	if len(errChan) > 0 {
		err := <-errChan
		return nil, err
	}

	for products := range productsChan {
		allProducts = append(allProducts, products...)
	}

	// Ensure final progress is 100%
	finalMsg, _ := json.Marshal(map[string]float64{"progress": 100.0})
	ws.HubInstance.Send(jobID, string(finalMsg))

	return allProducts, nil
}
