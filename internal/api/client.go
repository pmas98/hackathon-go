package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"hackathon-go/internal/models"
)

const apiURL = "https://hackathon-produtos-api.onrender.com/api/produtos"

// FetchProducts retrieves the product list from the external API.
func FetchProducts() ([]models.Product, error) {
	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data from API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api returned non-200 status code: %d", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var apiResponse models.APIResponse
	if err := json.Unmarshal(body, &apiResponse); err != nil {
		return nil, fmt.Errorf("failed to unmarshal api response: %w", err)
	}

	return apiResponse.Data, nil
}
