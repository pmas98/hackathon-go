package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"

	"hackathon-go/internal/models"
)

const (
	apiURL = "https://hackathon-produtos-api.onrender.com/api/produtos"
	limit  = 1000
)

// FetchProducts retrieves the product list from the external API, handling pagination concurrently.
// FetchProducts retrieves the product list from the external API, handling pagination concurrently.
func FetchProducts() ([]models.Product, error) {
	fmt.Println("[DEBUG] Starting FetchProducts...")

	firstPageURL := fmt.Sprintf("%s?page=1&limit=%d", apiURL, limit)
	fmt.Printf("[DEBUG] Fetching first page: %s\n", firstPageURL)

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

	fmt.Printf("[DEBUG] First page fetched: %d products\n", len(firstApiResponse.Data))

	allProducts := firstApiResponse.Data

	if firstApiResponse.Pagination == nil || !firstApiResponse.Pagination.HasNextPage {
		fmt.Println("[DEBUG] No additional pages to fetch.")
		return allProducts, nil
	}

	totalPages := firstApiResponse.Pagination.TotalPages
	fmt.Printf("[DEBUG] Total pages to fetch: %d\n", totalPages)

	if totalPages <= 1 {
		return allProducts, nil
	}

	productsChan := make(chan []models.Product, totalPages-1)
	errChan := make(chan error, totalPages-1)
	var wg sync.WaitGroup

	for page := 2; page <= totalPages; page++ {
		wg.Add(1)
		go func(p int) {
			defer wg.Done()

			pageURL := fmt.Sprintf("%s?page=%d&limit=%d", apiURL, p, limit)
			fmt.Printf("[DEBUG] Fetching page %d: %s\n", p, pageURL)

			pageResp, err := http.Get(pageURL)
			if err != nil {
				errChan <- fmt.Errorf("failed to fetch page %d from API: %w", p, err)
				fmt.Printf("[ERROR] Failed to fetch page %d: %v\n", p, err)
				return
			}
			defer pageResp.Body.Close()

			if pageResp.StatusCode != http.StatusOK {
				errChan <- fmt.Errorf("api returned non-200 status code for page %d: %d", p, pageResp.StatusCode)
				fmt.Printf("[ERROR] Non-200 status code for page %d: %d\n", p, pageResp.StatusCode)
				return
			}

			pageBody, err := io.ReadAll(pageResp.Body)
			if err != nil {
				errChan <- fmt.Errorf("failed to read response body for page %d: %w", p, err)
				fmt.Printf("[ERROR] Failed to read body for page %d: %v\n", p, err)
				return
			}

			var pageApiResponse models.APIResponse
			if err := json.Unmarshal(pageBody, &pageApiResponse); err != nil {
				errChan <- fmt.Errorf("failed to unmarshal api response for page %d: %w", p, err)
				fmt.Printf("[ERROR] Failed to unmarshal page %d: %v\n", p, err)
				return
			}

			fmt.Printf("[DEBUG] Page %d fetched: %d products\n", p, len(pageApiResponse.Data))
			productsChan <- pageApiResponse.Data
		}(page)
	}

	wg.Wait()
	close(productsChan)
	close(errChan)

	if len(errChan) > 0 {
		err := <-errChan
		fmt.Printf("[ERROR] Error occurred while fetching pages: %v\n", err)
		return nil, err
	}

	for products := range productsChan {
		allProducts = append(allProducts, products...)
	}

	fmt.Printf("[DEBUG] Total products fetched: %d\n", len(allProducts))
	fmt.Println("[DEBUG] Finished FetchProducts.")
	return allProducts, nil
}
