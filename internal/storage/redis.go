package storage

import (
	"context"
	"encoding/json"
	"time"

	"hackathon-go/internal/models"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

// RedisClient is a wrapper for the Redis client.
type RedisClient struct {
	Client *redis.Client
}

// NewRedisClient creates and returns a new Redis client.
func NewRedisClient(addr string) (*RedisClient, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	if _, err := rdb.Ping(ctx).Result(); err != nil {
		return nil, err
	}

	return &RedisClient{Client: rdb}, nil
}

// SaveResult saves a comparison result to Redis with a given job ID.
func (r *RedisClient) SaveResult(jobID string, result *models.ComparisonResult, expiration time.Duration) error {
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}
	return r.Client.Set(ctx, jobID, data, expiration).Err()
}

// GetResult retrieves a comparison result from Redis by job ID.
func (r *RedisClient) GetResult(jobID string) (*models.ComparisonResult, error) {
	data, err := r.Client.Get(ctx, jobID).Bytes()
	if err != nil {
		return nil, err
	}

	var result models.ComparisonResult
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// GetAllJobIDs retrieves all job IDs (keys) from Redis.
func (r *RedisClient) GetAllJobIDs() ([]string, error) {
	return r.Client.Keys(ctx, "*").Result()
}

// GetJobStatus retrieves the current status of a job from Redis.
func (r *RedisClient) GetJobStatus(jobID string) (string, error) {
	// Try to get status from a specific key first
	status, err := r.Client.Get(ctx, jobID+":status").Result()
	if err == nil {
		return status, nil
	}

	// If no status key, check if job has results (completed)
	_, err = r.GetResult(jobID)
	if err == nil {
		return "Processamento finalizado", nil
	}

	// Default status if job exists but no specific status
	return "Job criado", nil
}

// HasJobResults checks if a job has completed results.
func (r *RedisClient) HasJobResults(jobID string) (bool, error) {
	_, err := r.GetResult(jobID)
	if err != nil {
		return false, nil // Job not found or no results
	}
	return true, nil // Job has results
}

// SetJobStatus sets the current status of a job in Redis.
func (r *RedisClient) SetJobStatus(jobID, status string) error {
	return r.Client.Set(ctx, jobID+":status", status, time.Hour*24).Err()
}

// SaveAPIProducts saves the API products to Redis with a 5-minute TTL
func (r *RedisClient) SaveAPIProducts(products []models.Product) error {
	data, err := json.Marshal(products)
	if err != nil {
		return err
	}
	return r.Client.Set(ctx, "api_products_cache", data, 5*time.Minute).Err()
}

// GetAPIProducts retrieves cached API products from Redis
func (r *RedisClient) GetAPIProducts() ([]models.Product, error) {
	data, err := r.Client.Get(ctx, "api_products_cache").Bytes()
	if err != nil {
		return nil, err
	}

	var products []models.Product
	if err := json.Unmarshal(data, &products); err != nil {
		return nil, err
	}
	return products, nil
}
