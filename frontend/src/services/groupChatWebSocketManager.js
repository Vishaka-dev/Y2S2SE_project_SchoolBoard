/**
 * WebSocket Manager for Group Chat
 * Handles WebSocket connections and message flow
 */

class GroupChatWebSocketManager {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Set();
    this.connectionHandlers = new Set();
    this.errorHandlers = new Set();
    this.groupId = null;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isIntentionallyClosed = false;
  }

  /**
   * Connect to WebSocket
   * @param {number} groupId - Group ID
   * @param {number} userId - Current user ID
   * @param {string} accessToken - JWT token
   */
  connect(groupId, userId, accessToken) {
    this.groupId = groupId;
    this.userId = userId;
    this.isIntentionallyClosed = false;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/group/${groupId}?token=${accessToken}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected for group', groupId);
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyError('Connection error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyConnection(false);

        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            this.connect(groupId, userId, accessToken);
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.notifyError('Failed to establish connection');
    }
  }

  /**
   * Send a message through WebSocket
   * @param {object} message - Message object
   */
  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Register message handler
   * @param {function} handler - Handler function
   */
  onMessage(handler) {
    this.messageHandlers.add(handler);
  }

  /**
   * Register connection status handler
   * @param {function} handler - Handler function
   */
  onConnectionChange(handler) {
    this.connectionHandlers.add(handler);
  }

  /**
   * Register error handler
   * @param {function} handler - Handler function
   */
  onError(handler) {
    this.errorHandlers.add(handler);
  }

  /**
   * Remove message handler
   * @param {function} handler - Handler function
   */
  offMessage(handler) {
    this.messageHandlers.delete(handler);
  }

  /**
   * Remove connection handler
   * @param {function} handler - Handler function
   */
  offConnectionChange(handler) {
    this.connectionHandlers.delete(handler);
  }

  /**
   * Remove error handler
   * @param {function} handler - Handler function
   */
  offError(handler) {
    this.errorHandlers.delete(handler);
  }

  /**
   * Notify message handlers
   * @param {object} data - Message data
   */
  private notifyMessage(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Notify connection handlers
   * @param {boolean} isConnected - Connection status
   */
  private notifyConnection(isConnected) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Notify error handlers
   * @param {string} error - Error message
   */
  private notifyError(error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('Error in error handler:', error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.connectionHandlers.clear();
    this.errorHandlers.clear();
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const wsManager = new GroupChatWebSocketManager();

export default wsManager;
