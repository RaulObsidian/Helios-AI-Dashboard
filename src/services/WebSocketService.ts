// src/services/WebSocketService.ts

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Record<string, Array<(data: any) => void>> = {};
    private connectionUrl: string | null = null;

    connect(url: string) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }
        
        this.connectionUrl = url;
        console.log(`[WebSocketService] Connecting to ${url}...`);
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => console.log("[WebSocketService] Connected.");
        
        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type && this.listeners[message.type]) {
                    this.listeners[message.type].forEach(callback => callback(message.data));
                }
            } catch (e) {
                console.error("[WebSocketService] Error parsing message:", e);
            }
        };
        
        this.socket.onclose = (event) => {
            console.log(`[WebSocketService] Disconnected (Code: ${event.code}). Attempting to reconnect...`);
            setTimeout(() => this.connect(this.connectionUrl!), 5000);
        };

        this.socket.onerror = (error) => {
            console.error("[WebSocketService] Error:", error);
        };
    }

    subscribe(eventType: string, callback: (data: any) => void) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        if (!this.listeners[eventType].includes(callback)) {
            this.listeners[eventType].push(callback);
        }
    }

    unsubscribe(eventType: string, callback: (data: any) => void) {
        if (this.listeners[eventType]) {
            this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
        }
    }
}

export const webSocketService = new WebSocketService();
