import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  console.log(`Stream management API: ${method} ${path}`);

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.session = () => ({ access_token: authHeader.replace('Bearer ', '') } as any);
    }

    // Route handling
    if (path === '/stream-management' && method === 'POST') {
      // Create new stream
      const { title } = await req.json();
      const streamUrl = `stream-${Date.now()}`;

      const { data, error } = await supabase
        .from('streams')
        .insert({
          title,
          stream_url: streamUrl,
          broadcaster_id: 'anonymous', // Will be replaced with actual user ID when auth is implemented
          is_active: true,
          listener_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating stream:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create stream' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ stream: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/stream-management' && method === 'GET') {
      // Get active streams
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching streams:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch streams' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ streams: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.startsWith('/stream-management/') && method === 'PUT') {
      // Update stream (e.g., increment listener count)
      const streamId = path.split('/')[2];
      const updates = await req.json();

      const { data, error } = await supabase
        .from('streams')
        .update(updates)
        .eq('id', streamId)
        .select()
        .single();

      if (error) {
        console.error('Error updating stream:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update stream' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ stream: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.startsWith('/stream-management/') && method === 'DELETE') {
      // End stream
      const streamId = path.split('/')[2];

      const { error } = await supabase
        .from('streams')
        .update({ is_active: false })
        .eq('id', streamId);

      if (error) {
        console.error('Error ending stream:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to end stream' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Stream ended successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stream management error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});