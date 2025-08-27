# GloryWave Deployment & Backend Implementation Guide

## Frontend Deployment on Vercel

### 1. Prepare the Project
```bash
# Clone your project from GitHub
git clone <your-repo-url>
cd glorywave

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

Or use Vercel dashboard:
1. Visit [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Backend Implementation with Node.js

### Architecture Overview
You'll need to implement 3 main components:

1. **WebRTC Signaling Server** (WebSocket)
2. **Stream Management API** (REST)
3. **Database** (PostgreSQL/MongoDB)

### 1. WebRTC Signaling Server (Socket.io)

```javascript
// server/signaling.js
const io = require('socket.io')(server, {
  cors: { origin: "https://your-frontend.vercel.app" }
});

const activeStreams = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a stream room
  socket.on('join-stream', (streamId) => {
    socket.join(streamId);
    
    if (!activeStreams.has(streamId)) {
      activeStreams.set(streamId, new Set());
    }
    activeStreams.get(streamId).add(socket.id);
    
    // Notify others in the room
    socket.to(streamId).emit('peer-joined', socket.id);
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.streamId).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.streamId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  socket.on('disconnect', () => {
    // Clean up active streams
    activeStreams.forEach((clients, streamId) => {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        socket.to(streamId).emit('peer-left', socket.id);
      }
    });
  });
});
```

### 2. Stream Management API (Express.js)

```javascript
// server/api.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(express.json());
app.use(cors({ origin: "https://your-frontend.vercel.app" }));

// Create stream
app.post('/api/streams', async (req, res) => {
  try {
    const { title, broadcaster_id } = req.body;
    const result = await db.query(
      'INSERT INTO streams (title, broadcaster_id, is_active) VALUES ($1, $2, $3) RETURNING *',
      [title, broadcaster_id, true]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stream
app.get('/api/streams/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM streams WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stream
app.put('/api/streams/:id', async (req, res) => {
  try {
    const { title, is_active } = req.body;
    const result = await db.query(
      'UPDATE streams SET title = $1, is_active = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete stream
app.delete('/api/streams/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM streams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Database Schema (PostgreSQL)

```sql
-- Create streams table
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  broadcaster_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webrtc_signals table (optional, for logging)
CREATE TABLE webrtc_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id),
  signal_type TEXT NOT NULL,
  signal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Frontend Configuration

Update your frontend hooks to call your backend:

```javascript
// src/hooks/useStreamingAPI.ts
const API_BASE_URL = 'https://your-backend.herokuapp.com/api';

const createStream = async (title: string) => {
  const response = await fetch(`${API_BASE_URL}/streams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, broadcaster_id: 'user-id' })
  });
  return response.json();
};
```

```javascript
// src/hooks/useWebRTCSignaling.ts
import io from 'socket.io-client';

const socket = io('https://your-backend.herokuapp.com');

const sendSignal = (message) => {
  socket.emit(message.type, message);
};
```

### 5. Deployment Options

#### Option A: Heroku
```bash
# Create Heroku app
heroku create glorywave-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

#### Option B: Railway
1. Connect GitHub repo to Railway
2. Add PostgreSQL service
3. Set environment variables

#### Option C: DigitalOcean App Platform
1. Create new app
2. Connect GitHub repo
3. Add managed database

### 6. Environment Variables

Backend (.env):
```
DATABASE_URL=postgresql://username:password@host:port/database
PORT=3000
CORS_ORIGIN=https://your-frontend.vercel.app
```

Frontend (vercel.json):
```json
{
  "env": {
    "VITE_API_URL": "https://your-backend.herokuapp.com",
    "VITE_WS_URL": "https://your-backend.herokuapp.com"
  }
}
```

### 7. Required Dependencies

Backend package.json:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0"
  }
}
```

### 8. Testing WebRTC Connection

Use this test script to verify WebRTC functionality:

```javascript
// Test WebRTC peer connection
const createPeerConnection = () => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      // Send to signaling server
      socket.emit('ice-candidate', event.candidate);
    }
  };
  
  return pc;
};
```

This setup provides a complete real-time audio streaming platform with WebRTC peer-to-peer connections and proper signaling infrastructure.