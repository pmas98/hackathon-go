package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"hackathon-go/internal/ws"
)

// WebSocketHandler manages websocket connections for job progress updates.
type WebSocketHandler struct{}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for hackathon purposes. In production, restrict this.
		return true
	},
}

// HandleWebSocket upgrades the HTTP connection to a WebSocket and streams
// progress messages for the provided job_id path param.
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	jobID := c.Param("job_id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id is required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Printf("[ERROR] [%s] WebSocket handler: Failed to upgrade connection for job %s: %v\n",
			time.Now().Format("15:04:05.000"), jobID, err)
		return // upgrade error already handled by gin
	}
	defer conn.Close()

	fmt.Printf("[DEBUG] [%s] WebSocket handler: Connection upgraded for job %s\n",
		time.Now().Format("15:04:05.000"), jobID)

	progressCh := ws.HubInstance.Register(jobID)
	defer ws.HubInstance.Unregister(jobID, progressCh)

	// Send initial message so client knows the connection is established.
	initialMsg := gin.H{"type": "status", "status": "connected", "job_id": jobID}
	fmt.Printf("[DEBUG] [%s] WebSocket handler: Sending initial connection message for job %s: %+v\n",
		time.Now().Format("15:04:05.000"), jobID, initialMsg)
	_ = conn.WriteJSON(initialMsg)

	// Listen until the channel is closed or websocket errors.
	for {
		select {
		case msg, ok := <-progressCh:
			if !ok {
				// channel closed – job finished or server shutting down
				fmt.Printf("[DEBUG] [%s] WebSocket handler: Channel closed for job %s, sending finished status\n",
					time.Now().Format("15:04:05.000"), jobID)
				_ = conn.WriteJSON(gin.H{"type": "status", "status": "finished"})
				return
			}

			fmt.Printf("[DEBUG] [%s] WebSocket handler: Received message for job %s: %s\n",
				time.Now().Format("15:04:05.000"), jobID, msg)

			// Try to parse the message as JSON to detect progress updates.
			var progressPayload map[string]float64
			if err := json.Unmarshal([]byte(msg), &progressPayload); err == nil {
				if progress, ok := progressPayload["progress"]; ok {
					progressMsg := gin.H{"type": "progress", "progress": progress}
					fmt.Printf("[DEBUG] [%s] WebSocket handler: Sending progress update to frontend for job %s: %.4f\n",
						time.Now().Format("15:04:05.000"), jobID, progress)
					if err := conn.WriteJSON(progressMsg); err != nil {
						fmt.Printf("[ERROR] [%s] WebSocket handler: Failed to send progress to frontend for job %s: %v\n",
							time.Now().Format("15:04:05.000"), jobID, err)
						return
					}
					continue
				}
			}

			// Fallback: treat as plain status string.
			statusMsg := gin.H{"type": "status", "status": msg}
			fmt.Printf("[DEBUG] [%s] WebSocket handler: Sending status message to frontend for job %s: %s\n",
				time.Now().Format("15:04:05.000"), jobID, msg)
			if err := conn.WriteJSON(statusMsg); err != nil {
				fmt.Printf("[ERROR] [%s] WebSocket handler: Failed to send status to frontend for job %s: %v\n",
					time.Now().Format("15:04:05.000"), jobID, err)
				return
			}
		}
	}
}
