package main

import (
	"log"
	"os"

	"hackathon-go/internal/storage"
	"hackathon-go/pkg/handler"

	"github.com/gin-gonic/gin"
)

func main() {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	redisClient, err := storage.NewRedisClient(redisAddr)
	if err != nil {
		log.Fatalf("failed to connect to redis: %v", err)
	}

	uploadHandler := &handler.UploadHandler{Redis: redisClient}
	resultsHandler := &handler.ResultsHandler{Redis: redisClient}
	jobsHandler := &handler.JobsHandler{Redis: redisClient}
	wsHandler := &handler.WebSocketHandler{}

	router := gin.Default()
	
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})
	
	router.POST("/upload", uploadHandler.HandleUpload)
	router.GET("/results/:job_id", resultsHandler.HandleGetResult)
	router.GET("/results/:job_id/export", resultsHandler.HandleExportResult)
	router.GET("/jobs", jobsHandler.HandleGetJobs)
	router.GET("/jobs/:job_id/status", jobsHandler.HandleGetJobStatus)
	router.GET("/ws/:job_id", wsHandler.HandleWebSocket)

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
