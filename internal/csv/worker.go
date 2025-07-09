package csv

import (
	"fmt"
	"hackathon-go/internal/models"
	"strconv"
	"sync"
)

const (
	colID = iota
	colNome
	colCategoria
	colPreco
	colEstoque
	colFornecedor
	totalCols
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
	if len(record) < totalCols {
		return models.Product{}, fmt.Errorf("invalid record at line %d: expected %d fields, got %d", line, totalCols, len(record))
	}

	id, err := strconv.Atoi(record[colID])
	if err != nil {
		return models.Product{}, fmt.Errorf("invalid id at line %d: %w", line, err)
	}

	preco, err := strconv.ParseFloat(record[colPreco], 64)
	if err != nil {
		return models.Product{}, fmt.Errorf("invalid preco at line %d: %w", line, err)
	}

	estoque, err := strconv.Atoi(record[colEstoque])
	if err != nil {
		return models.Product{}, fmt.Errorf("invalid estoque at line %d: %w", line, err)
	}

	product := models.Product{
		ID:         id,
		Nome:       record[colNome],
		Categoria:  record[colCategoria],
		Preco:      preco,
		Estoque:    estoque,
		Fornecedor: record[colFornecedor],
	}
	return product, nil
}