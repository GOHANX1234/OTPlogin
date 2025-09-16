import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface WebSocketMessage {
  type: string;
  isActive?: boolean;
  message?: string;
}

export function useWebSocket() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!isAuthenticated || !user || user.role !== 'reseller') {
      return;
    }

    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          resellerId: user.id
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          switch (data.type) {
            case 'auth_success':
              console.log('WebSocket authentication successful');
              break;
              
            case 'status_change':
              if (data.isActive === false) {
                // Account suspended - show alert and logout
                toast({
                  title: "Account Suspended",
                  description: data.message || "YOUR ACCOUNT HAS BEEN SUSPENDED BY ADMIN, CONTACT ADMIN FOR MORE DETAILS.",
                  variant: "destructive",
                  duration: 0, // Don't auto-dismiss
                });
                
                // Automatically logout the user
                setTimeout(() => {
                  logout();
                }, 2000);
              } else {
                // Account reactivated
                toast({
                  title: "Account Reactivated",
                  description: data.message || "Your account has been reactivated by the admin.",
                  variant: "default",
                });
                
                // Refresh the page to update the UI
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'reseller') {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  return {
    isConnected,
    connect,
    disconnect
  };
}