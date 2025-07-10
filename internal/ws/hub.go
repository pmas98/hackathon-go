package ws

import "sync"

type Hub struct {
	mu          sync.RWMutex
	subscribers map[string][]chan string // jobID -> channels
}

func NewHub() *Hub {
	return &Hub{
		subscribers: make(map[string][]chan string),
	}
}

func (h *Hub) Register(jobID string) chan string {
	ch := make(chan string, 16)
	h.mu.Lock()
	h.subscribers[jobID] = append(h.subscribers[jobID], ch)
	h.mu.Unlock()
	return ch
}

func (h *Hub) Unregister(jobID string, ch chan string) {
	h.mu.Lock()
	subs := h.subscribers[jobID]
	for i, c := range subs {
		if c == ch {
			// Remove this channel from slice
			subs[i] = subs[len(subs)-1]
			subs = subs[:len(subs)-1]
			break
		}
	}
	if len(subs) == 0 {
		delete(h.subscribers, jobID)
	} else {
		h.subscribers[jobID] = subs
	}
	h.mu.Unlock()
	close(ch)
}

// Send broadcasts a message to all subscribers of the given jobID.
// If there are no subscribers, the message is silently dropped.
func (h *Hub) Send(jobID, msg string) {
	h.mu.RLock()
	subs := h.subscribers[jobID]
	h.mu.RUnlock()

	for _, ch := range subs {
		// Non-blocking send – drop message if buffer is full.
		select {
		case ch <- msg:
		default:
		}
	}
}

// Global in-process hub instance.
var HubInstance = NewHub()
