import { useState, useCallback } from 'react';

interface Stream {
  id: string;
  title: string;
  stream_url: string;
  broadcaster_id: string;
  is_active: boolean;
  listener_count: number;
  created_at: string;
  updated_at: string;
}

interface StreamingAPIState {
  streams: Stream[];
  currentStream: Stream | null;
  isLoading: boolean;
  error: string | null;
}

export const useStreamingAPI = () => {
  const [state, setState] = useState<StreamingAPIState>({
    streams: [],
    currentStream: null,
    isLoading: false,
    error: null
  });

  const createStream = useCallback(async (title: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock stream creation
      const mockStream: Stream = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        stream_url: `wss://mock-stream-${Math.random().toString(36).substr(2, 5)}.com`,
        broadcaster_id: 'mock-user-id',
        is_active: true,
        listener_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock: Created stream', mockStream);
      
      setState(prev => ({
        ...prev,
        currentStream: mockStream,
        streams: [mockStream, ...prev.streams],
        isLoading: false
      }));

      return mockStream;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create stream',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const fetchStreams = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Mock fetch streams
      const mockStreams: Stream[] = [
        {
          id: 'mock-stream-1',
          title: 'Morning Service',
          stream_url: 'wss://mock-stream-1.com',
          broadcaster_id: 'mock-user-id',
          is_active: true,
          listener_count: 42,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setState(prev => ({
        ...prev,
        streams: mockStreams,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch streams',
        isLoading: false
      }));
    }
  }, []);

  const updateStream = useCallback(async (streamId: string, updates: Partial<Stream>) => {
    try {
      console.log('Mock: Updating stream', streamId, updates);
      
      const updatedStream = { ...state.currentStream, ...updates } as Stream;
      
      setState(prev => ({
        ...prev,
        streams: prev.streams.map(s => s.id === streamId ? updatedStream : s),
        currentStream: prev.currentStream?.id === streamId ? updatedStream : prev.currentStream
      }));

      return updatedStream;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update stream'
      }));
      throw error;
    }
  }, [state.currentStream]);

  const endStream = useCallback(async (streamId: string) => {
    try {
      console.log('Mock: Ending stream', streamId);

      setState(prev => ({
        ...prev,
        streams: prev.streams.filter(s => s.id !== streamId),
        currentStream: prev.currentStream?.id === streamId ? null : prev.currentStream
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end stream'
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    createStream,
    fetchStreams,
    updateStream,
    endStream
  };
};