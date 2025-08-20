package models

// Product defines the structure for product data from the API.
type Product struct {
	ID         int     `json:"id"`
	Nome       string  `json:"nome"`
	Categoria  string  `json:"categoria"`
	Preco      float64 `json:"preco"`
	Estoque    int     `json:"estoque"`
	Fornecedor string  `json:"fornecedor"`
}

// Pagination defines the structure for pagination info from the API.
type Pagination struct {
	CurrentPage     int  `json:"current_page"`
	ItemsPerPage    int  `json:"items_per_page"`
	TotalItems      int  `json:"total_items"`
	TotalPages      int  `json:"total_pages"`
	HasNextPage     bool `json:"has_next_page"`
	HasPreviousPage bool `json:"has_previous_page"`
}

// APIResponse is the structure of the top-level response from the product API.
type APIResponse struct {
	Data       []Product   `json:"data"`
	Pagination *Pagination `json:"pagination,omitempty"`
}

// Summary holds a summary of the comparison between API and CSV data.
type Summary struct {
	TotalAPIItems int                    `json:"total_api_items"`
	TotalCSVItems int                    `json:"total_csv_items"`
	Matched       int                    `json:"matched"`
	Mismatched    int                    `json:"mismatched"`
	MissingInCSV  int                    `json:"missing_in_csv"`
	MissingInAPI  int                    `json:"missing_in_api"`
	Categories    map[string]int         `json:"categories"`
}

// MismatchDetail stores the differing values for a field.
type MismatchDetail struct {
	APIValue interface{} `json:"api"`
	CSVValue interface{} `json:"csv"`
}

// ErrorDetail describes a single discrepancy found during comparison.
type ErrorDetail struct {
	Type    string                    `json:"type"`
	CSVLine int                       `json:"csv_line,omitempty"`
	APIID   int                       `json:"api_id"`
	Nome    string                    `json:"nome,omitempty"`
	Fields  map[string]MismatchDetail `json:"fields,omitempty"`
}

// ComparisonResult represents the full report of a comparison task.
type ComparisonResult struct {
	Summary Summary       `json:"summary"`
	Errors  []ErrorDetail `json:"errors"`
}
