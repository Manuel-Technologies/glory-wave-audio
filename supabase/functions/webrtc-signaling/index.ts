import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-stream' | 'leave-stream';
  streamId: string;
  senderId: string;
  receiverId?: string;
  data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('WebRTC signaling connection established');

  socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  socket.onmessage = async (event) => {
    try {
      const message: SignalMessage = JSON.parse(event.data);
      console.log('Received signaling message:', message.type, 'for stream:', message.streamId);

      switch (message.type) {
        case 'join-stream': {
          // Listener joining a stream - get existing offers for this stream
          const { data: signals, error } = await supabase
            .from('webrtc_signals')
            .select('*')
            .eq('stream_id', message.streamId)
            .eq('signal_type', 'offer')
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) {
            console.error('Error fetching offers:', error);
            return;
          }

          // Send existing offers to the new listener
          signals?.forEach(signal => {
            socket.send(JSON.stringify({
              type: 'offer',
              streamId: signal.stream_id,
              senderId: signal.sender_id,
              data: signal.signal_data
            }));
          });
          break;
        }

        case 'offer':
        case 'answer':
        case 'ice-candidate': {
          // Store signaling data in database
          const { error } = await supabase
            .from('webrtc_signals')
            .insert({
              stream_id: message.streamId,
              sender_id: message.senderId,
              receiver_id: message.receiverId,
              signal_type: message.type,
              signal_data: message.data
            });

          if (error) {
            console.error('Error storing signal:', error);
            return;
          }

          // Broadcast to other connected clients (simplified for demo)
          // In production, you'd maintain a map of connected sockets per stream
          console.log(`Signal ${message.type} stored for stream ${message.streamId}`);
          break;
        }

        case 'leave-stream': {
          // Clean up signals for this user/stream
          const { error } = await supabase
            .from('webrtc_signals')
            .delete()
            .eq('stream_id', message.streamId)
            .eq('sender_id', message.senderId);

          if (error) {
            console.error('Error cleaning up signals:', error);
          }
          
          console.log(`User ${message.senderId} left stream ${message.streamId}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error processing signaling message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return response;
});