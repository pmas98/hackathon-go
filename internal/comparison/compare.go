package comparison

import (
	"hackathon-go/internal/models"
)

// CompareProducts takes two slices of products (from the API and a CSV) and compares them.
func CompareProducts(apiProducts, csvProducts []models.Product) models.ComparisonResult {
	apiMap := make(map[int]models.Product)
	for _, p := range apiProducts {
		apiMap[p.ID] = p
	}

	csvMap := make(map[int]models.Product)
	for _, p := range csvProducts {
		csvMap[p.ID] = p
	}

	var result models.ComparisonResult
	result.Errors = []models.ErrorDetail{}

	for id, csvProduct := range csvMap {
		if apiProduct, ok := apiMap[id]; ok {
			// Product exists in both, check for mismatches
			mismatches := compareFields(apiProduct, csvProduct)
			if len(mismatches) > 0 {
				result.Summary.Mismatched++
				result.Errors = append(result.Errors, models.ErrorDetail{
					Type:  "mismatch",
					APIID: id,
					// CSVLine needs to be passed in or handled differently, placeholder for now
					Fields: mismatches,
				})
			} else {
				result.Summary.Matched++
			}
			// Remove from apiMap to find those missing in CSV later
			delete(apiMap, id)
		} else {
			// Product exists in CSV but not in API
			result.Summary.MissingInAPI++
			result.Errors = append(result.Errors, models.ErrorDetail{
				Type:  "missing_in_api",
				APIID: id,
			})
		}
	}

	// Any remaining products in apiMap are missing in the CSV
	for id, apiProduct := range apiMap {
		result.Summary.MissingInCSV++
		result.Errors = append(result.Errors, models.ErrorDetail{
			Type:  "missing_in_csv",
			APIID: id,
			Nome:  apiProduct.Nome,
		})
	}

	result.Summary.TotalAPIItems = len(apiProducts)
	result.Summary.TotalCSVItems = len(csvProducts)

	return result
}

func compareFields(api, csv models.Product) map[string]models.MismatchDetail {
	fields := make(map[string]models.MismatchDetail)

	if api.Nome != csv.Nome {
		fields["nome"] = models.MismatchDetail{APIValue: api.Nome, CSVValue: csv.Nome}
	}
	if api.Categoria != csv.Categoria {
		fields["categoria"] = models.MismatchDetail{APIValue: api.Categoria, CSVValue: csv.Categoria}
	}
	if api.Preco != csv.Preco {
		fields["preco"] = models.MismatchDetail{APIValue: api.Preco, CSVValue: csv.Preco}
	}
	if api.Estoque != csv.Estoque {
		fields["estoque"] = models.MismatchDetail{APIValue: api.Estoque, CSVValue: csv.Estoque}
	}
	if api.Fornecedor != csv.Fornecedor {
		fields["fornecedor"] = models.MismatchDetail{APIValue: api.Fornecedor, CSVValue: csv.Fornecedor}
	}

	return fields
}
