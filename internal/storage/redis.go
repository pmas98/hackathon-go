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
