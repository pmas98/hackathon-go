package csv

import (
	"fmt"
	"strconv"
	"sync"

	"hackathon-go/internal/models"
)

type job struct {
	record []string
	line   int
}

type result struct {
	product models.Product
	err     error
}

func worker(wg *sync.WaitGroup, jobs <-chan job, results chan<- result) {
	defer wg.Done()
	for j := range jobs {
		product, err := parseRecord(j.record, j.line)
		results <- result{product: product, err: err}
	}
}

func parseRecord(record []string, line int) (models.Product, error) {
	if len(record) < 6 {
		return models.Product{}, fmt.Errorf("invalid record at line %d: expected 6 fields, got %d", line, len(record))
	}

	id, err := strconv.Atoi(record[0])
	if err != nil {
		return models.Product{}, fmt.Errorf("invalid id at line %d: %w", line, err)
	}

	preco, err := strconv.ParseFloat(record[3], 64)
	if err != nil {
		return models.Product{}, fmt.Errorf("invalid preco at line %d: %w", line, err)
	}

	estoque, err := strconv.Atoi(record[4])
	if err != nil {
		return models.Product{}, fmt.Errorf("invalid estoque at line %d: %w", line, err)
	}

	product := models.Product{
		ID:         id,
		Nome:       record[1],
		Categoria:  record[2],
		Preco:      preco,
		Estoque:    estoque,
		Fornecedor: record[5],
	}
	return product, nil
}
