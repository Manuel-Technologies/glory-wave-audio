import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.functions.invoke('stream-management', {
        body: { title },
        method: 'POST'
      });

      if (error) throw error;

      const newStream = data.stream;
      setState(prev => ({
        ...prev,
        currentStream: newStream,
        streams: [newStream, ...prev.streams],
        isLoading: false
      }));

      return newStream;
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
      const { data, error } = await supabase.functions.invoke('stream-management', {
        method: 'GET'
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        streams: data.streams,
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
      const { data, error } = await supabase.functions.invoke('stream-management', {
        body: updates,
        method: 'PUT'
      });

      if (error) throw error;

      const updatedStream = data.stream;
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
  }, []);

  const endStream = useCallback(async (streamId: string) => {
    try {
      const { error } = await supabase.functions.invoke('stream-management', {
        method: 'DELETE'
      });

      if (error) throw error;

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