package csv

import (
	"encoding/csv"
	"fmt"
	"io"
	"strconv"

	"hackathon-go/internal/models"
)

// ParseProducts reads a CSV file and converts it into a slice of Product structs.
func ParseProducts(file io.Reader) ([]models.Product, error) {
	reader := csv.NewReader(file)
	// Assuming the CSV has a header, which we'll skip
	if _, err := reader.Read(); err != nil {
		return nil, fmt.Errorf("failed to read csv header: %w", err)
	}

	var products []models.Product
	line := 1
	for {
		line++
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read csv record at line %d: %w", line, err)
		}

		if len(record) < 6 {
			return nil, fmt.Errorf("invalid record at line %d: expected 6 fields, got %d", line, len(record))
		}

		id, err := strconv.Atoi(record[0])
		if err != nil {
			return nil, fmt.Errorf("invalid id at line %d: %w", line, err)
		}

		preco, err := strconv.ParseFloat(record[3], 64)
		if err != nil {
			return nil, fmt.Errorf("invalid preco at line %d: %w", line, err)
		}

		estoque, err := strconv.Atoi(record[4])
		if err != nil {
			return nil, fmt.Errorf("invalid estoque at line %d: %w", line, err)
		}

		product := models.Product{
			ID:         id,
			Nome:       record[1],
			Categoria:  record[2],
			Preco:      preco,
			Estoque:    estoque,
			Fornecedor: record[5],
		}
		products = append(products, product)
	}

	return products, nil
}
