package csv

import (
	"encoding/csv"
	"fmt"
	"io"
	"runtime"
	"sync"

	"hackathon-go/internal/models"
)

// ParseProducts reads a CSV file and converts it into a slice of Product structs.
func ParseProducts(file io.Reader) ([]models.Product, error) {
	reader := csv.NewReader(file)
	// Assuming the CSV has a header, which we'll skip
	if _, err := reader.Read(); err != nil {
		return nil, fmt.Errorf("failed to read csv header: %w", err)
	}

	jobs := make(chan job, 100)
	results := make(chan result, 100)

	numWorkers := runtime.NumCPU()
	var wg sync.WaitGroup

	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go worker(&wg, jobs, results)
	}

	var readErr error
	var readWg sync.WaitGroup
	readWg.Add(1)
	go func() {
		defer close(jobs)
		defer readWg.Done()
		line := 1
		for {
			line++
			record, err := reader.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				readErr = fmt.Errorf("failed to read csv record at line %d: %w", line, err)
				return
			}
			jobs <- job{record: record, line: line}
		}
	}()

	go func() {
		wg.Wait()
		close(results)
	}()

	var products []models.Product
	for res := range results {
		if res.err != nil {
			// Drain the jobs channel to allow the reader goroutine to finish
			go func() {
				for range jobs {
				}
			}()
			readWg.Wait()
			return nil, res.err
		}
		products = append(products, res.product)
	}

	readWg.Wait()
	if readErr != nil {
		return nil, readErr
	}

	return products, nil
}
