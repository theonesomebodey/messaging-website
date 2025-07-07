const express = require('express');
const http = require('http'); // Node.js built-in HTTP module
const { Server } = require('socket.io'); // Socket.IO server class

const app = express();
const server = http.createServer(app); // Create an HTTP server from your Express app

// Initialize Socket.IO server and attach it to the HTTP server
// The `cors` option is crucial for allowing your frontend (likely on a different port/domain) to connect.
const io = new Server(server, {
    cors: {
        origin: "*", // Allows connections from any origin (for development).
                    // In production, replace "*" with your frontend's domain (e.g., "http://yourfrontend.com").
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // 1. Handling 'chat message' event from clients
    socket.on('chat message', (msg) => {
        console.log(`Message from ${socket.id}: ${msg}`);
        // 2. Broadcast the message to all connected clients (including the sender)
        io.emit('chat message', msg); // `io.emit` sends to ALL connected clients
                                    // `socket.broadcast.emit` sends to all *except* the sender
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    // Optional: Handle a 'typing' event
    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('typing', { userId: socket.id, isTyping });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} in your browser.`);
}); 
