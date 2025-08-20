package comparison

import (
	"hackathon-go/internal/models"
	"sync"
)

// CompareProducts takes two slices of products (from the API and a CSV) and compares them concurrently.
func CompareProducts(apiProducts, csvProducts []models.Product) models.ComparisonResult {
	apiMap := make(map[int]models.Product, len(apiProducts))
	for _, p := range apiProducts {
		apiMap[p.ID] = p
	}

	csvMap := make(map[int]models.Product, len(csvProducts))
	for _, p := range csvProducts {
		csvMap[p.ID] = p
	}

	var result models.ComparisonResult
	result.Errors = []models.ErrorDetail{}
	
	// Initialize the Categories map
	result.Summary.Categories = make(map[string]int)
	result.Summary.Categories["nome"] = 0
	result.Summary.Categories["categoria"] = 0
	result.Summary.Categories["preco"] = 0
	result.Summary.Categories["estoque"] = 0
	result.Summary.Categories["fornecedor"] = 0

	errorChan := make(chan models.ErrorDetail, len(csvMap)+len(apiProducts))
	matchedChan := make(chan bool, len(csvProducts))

	var wg sync.WaitGroup

	// Compare products present in the CSV against the API products
	for id, csvProduct := range csvMap {
		wg.Add(1)
		go func(id int, csvProduct models.Product) {
			defer wg.Done()
			if apiProduct, ok := apiMap[id]; ok {
				// Product exists in both, check for mismatches
				mismatches := compareFields(apiProduct, csvProduct)
				if len(mismatches) > 0 {
					errorChan <- models.ErrorDetail{
						Type:   "mismatch",
						APIID:  id,
						Fields: mismatches,
					}
				} else {
					matchedChan <- true
				}
			} else {
				// Product exists in CSV but not in API
				errorChan <- models.ErrorDetail{
					Type:  "missing_in_api",
					APIID: id,
				}
			}
		}(id, csvProduct)
	}

	// Find products missing in the CSV
	for id, apiProduct := range apiMap {
		wg.Add(1)
		go func(id int, apiProduct models.Product) {
			defer wg.Done()
			if _, ok := csvMap[id]; !ok {
				// Product exists in API but not in CSV
				errorChan <- models.ErrorDetail{
					Type:  "missing_in_csv",
					APIID: id,
					Nome:  apiProduct.Nome,
				}
			}
		}(id, apiProduct)
	}

	// A separate goroutine to wait for all comparisons to finish and then close the channels
	go func() {
		wg.Wait()
		close(errorChan)
		close(matchedChan)
	}()

	// Collect results
	for errDetail := range errorChan {
		result.Errors = append(result.Errors, errDetail)
		switch errDetail.Type {
		case "mismatch":
			result.Summary.Mismatched++
			// Count mismatches by category
			for fieldName := range errDetail.Fields {
				result.Summary.Categories[fieldName]++
			}
		case "missing_in_api":
			result.Summary.MissingInAPI++
		case "missing_in_csv":
			result.Summary.MissingInCSV++
		}
	}

	for range matchedChan {
		result.Summary.Matched++
	}

	result.Summary.TotalAPIItems = len(apiProducts)
	result.Summary.TotalCSVItems = len(csvProducts)

	return result
}

func compareFields(api, csv models.Product) map[string]models.MismatchDetail {
	fields := make(map[string]models.MismatchDetail)

	fieldComparisons := map[string]struct {
		apiValue interface{}
		csvValue interface{}
	}{
		"nome":       {apiValue: api.Nome, csvValue: csv.Nome},
		"categoria":  {apiValue: api.Categoria, csvValue: csv.Categoria},
		"preco":      {apiValue: api.Preco, csvValue: csv.Preco},
		"estoque":    {apiValue: api.Estoque, csvValue: csv.Estoque},
		"fornecedor": {apiValue: api.Fornecedor, csvValue: csv.Fornecedor},
	}

	for fieldName, values := range fieldComparisons {
		if values.apiValue != values.csvValue {
			fields[fieldName] = models.MismatchDetail{
				APIValue: values.apiValue,
				CSVValue: values.csvValue,
			}
		}
	}

	return fields
}
