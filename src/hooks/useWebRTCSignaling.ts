import { useEffect, useRef, useCallback, useState } from 'react';

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
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!streamId) return;

    console.log('Mock: Connecting to WebRTC signaling for stream:', streamId);
    
    // Simulate connection after 1 second
    setTimeout(() => {
      setIsConnected(true);
      console.log('Mock: WebRTC signaling connected');
    }, 1000);
  }, [streamId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    console.log('Mock: Disconnecting from WebRTC signaling for stream:', streamId);
    setIsConnected(false);
  }, [streamId]);

  const sendMessage = useCallback((message: SignalingMessage) => {
    console.log('Mock: Sending signaling message:', message.type);
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
    isConnected,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    disconnect
  };
};