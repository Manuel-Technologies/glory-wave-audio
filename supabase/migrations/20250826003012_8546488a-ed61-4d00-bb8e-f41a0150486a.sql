-- Create streams table for active audio streams
CREATE TABLE public.streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcaster_id UUID NOT NULL,
  title TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  listener_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

-- Create policies for stream access
CREATE POLICY "Anyone can view active streams" 
ON public.streams 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Broadcasters can manage their own streams" 
ON public.streams 
FOR ALL 
USING (broadcaster_id = auth.uid());

-- Create WebRTC signaling table for peer connections
CREATE TABLE public.webrtc_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on signaling table
ALTER TABLE public.webrtc_signals ENABLE ROW LEVEL SECURITY;

-- Policies for WebRTC signaling
CREATE POLICY "Users can send signals" 
ON public.webrtc_signals 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view signals meant for them" 
ON public.webrtc_signals 
FOR SELECT 
USING (receiver_id = auth.uid() OR receiver_id IS NULL);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on streams
CREATE TRIGGER update_streams_updated_at
BEFORE UPDATE ON public.streams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for streams and signaling
ALTER TABLE public.streams REPLICA IDENTITY FULL;
ALTER TABLE public.webrtc_signals REPLICA IDENTITY FULL;