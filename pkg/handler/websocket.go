package handler

import (
	"encoding/json"
	"net/http"

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
		return // upgrade error already handled by gin
	}
	defer conn.Close()

	progressCh := ws.HubInstance.Register(jobID)
	defer ws.HubInstance.Unregister(jobID, progressCh)

	// Send initial message so client knows the connection is established.
	_ = conn.WriteJSON(gin.H{"type": "status", "status": "connected", "job_id": jobID})

	// Listen until the channel is closed or websocket errors.
	for {
		select {
		case msg, ok := <-progressCh:
			if !ok {
				// channel closed – job finished or server shutting down
				_ = conn.WriteJSON(gin.H{"type": "status", "status": "finished"})
				return
			}

			// Try to parse the message as JSON to detect progress updates.
			var progressPayload map[string]float64
			if err := json.Unmarshal([]byte(msg), &progressPayload); err == nil {
				if progress, ok := progressPayload["progress"]; ok {
					if err := conn.WriteJSON(gin.H{"type": "progress", "progress": progress}); err != nil {
						return
					}
					continue
				}
			}

			// Fallback: treat as plain status string.
			if err := conn.WriteJSON(gin.H{"type": "status", "status": msg}); err != nil {
				return
			}
		}
	}
}
