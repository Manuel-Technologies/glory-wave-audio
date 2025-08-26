import { useEffect, useRef, useCallback } from 'react';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-stream' | 'leave-stream';
  streamId: string;
  senderId: string;
  receiverId?: string;
  data?: any;
}

interface UseWebRTCSignalingProps {
  streamId: string | null;
  userId: string;
  onOffer?: (offer: RTCSessionDescriptionInit, senderId: string) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit, senderId: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, senderId: string) => void;
}

export const useWebRTCSignaling = ({
  streamId,
  userId,
  onOffer,
  onAnswer,
  onIceCandidate
}: UseWebRTCSignalingProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!streamId) return;

    // Use the full URL to the WebRTC signaling Edge Function
    const wsUrl = `wss://hnicczmbnjmctsnzyiip.functions.supabase.co/functions/v1/webrtc-signaling`;
    console.log('Connecting to WebRTC signaling server:', wsUrl);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebRTC signaling connected');
      // Join the stream
      sendMessage({
        type: 'join-stream',
        streamId,
        senderId: userId
      });
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);
        console.log('Received signaling message:', message.type);

        switch (message.type) {
          case 'offer':
            onOffer?.(message.data, message.senderId);
            break;
          case 'answer':
            onAnswer?.(message.data, message.senderId);
            break;
          case 'ice-candidate':
            onIceCandidate?.(message.data, message.senderId);
            break;
        }
      } catch (error) {
        console.error('Error parsing signaling message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebRTC signaling disconnected');
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (streamId) {
          connect();
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebRTC signaling error:', error);
    };
  }, [streamId, userId, onOffer, onAnswer, onIceCandidate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current && streamId) {
      // Leave the stream
      sendMessage({
        type: 'leave-stream',
        streamId,
        senderId: userId
      });

      wsRef.current.close();
      wsRef.current = null;
    }
  }, [streamId, userId]);

  const sendMessage = useCallback((message: SignalingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendOffer = useCallback((offer: RTCSessionDescriptionInit, receiverId?: string) => {
    if (!streamId) return;
    
    sendMessage({
      type: 'offer',
      streamId,
      senderId: userId,
      receiverId,
      data: offer
    });
  }, [streamId, userId, sendMessage]);

  const sendAnswer = useCallback((answer: RTCSessionDescriptionInit, receiverId: string) => {
    if (!streamId) return;
    
    sendMessage({
      type: 'answer',
      streamId,
      senderId: userId,
      receiverId,
      data: answer
    });
  }, [streamId, userId, sendMessage]);

  const sendIceCandidate = useCallback((candidate: RTCIceCandidateInit, receiverId?: string) => {
    if (!streamId) return;
    
    sendMessage({
      type: 'ice-candidate',
      streamId,
      senderId: userId,
      receiverId,
      data: candidate
    });
  }, [streamId, userId, sendMessage]);

  useEffect(() => {
    if (streamId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [streamId, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    disconnect
  };
};