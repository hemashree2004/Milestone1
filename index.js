const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const fs = require('fs');
const { WebSocketServer } = require('ws');

const app = express();
app.use(bodyParser.json());

const wss = new WebSocketServer({ noServer: true });

let events = []; // In-memory storage for events
const completedEventsFile = './completed_events.json';

// Ensure the completed events file exists
if (!fs.existsSync(completedEventsFile)) {
    fs.writeFileSync(completedEventsFile, JSON.stringify([]));
}

// WebSocket Connection Handler
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established.');
    ws.on('message', (message) => {
        console.log('Received:', message);
    });
});

// Broadcast messages to all connected WebSocket clients
const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });
};

// Helper function to validate event data
const validateEvent = (event) => {
    const { title, description, time } = event;
    if (!title || !description || !time) {
        return 'Title, description, and time are required.';
    }
    if (isNaN(Date.parse(time))) {
        return 'Invalid time format. Use ISO 8601 (e.g., 2024-12-03T15:30:00Z).';
    }
    return null;
};

// Endpoint to add a new event
app.post('/events', (req, res) => {
    const validationError = validateEvent(req.body);
    if (validationError) {
        return res.status(400).json({ status: 'error', error: validationError });
    }

    const event = req.body;
    events.push(event);
    events.sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time

    // Check for overlaps
    const overlappingEvent = events.find(
        (e) => e !== event && new Date(e.time).getTime() === new Date(event.time).getTime()
    );
    if (overlappingEvent) {
        broadcast({
            type: 'overlap',
            message: `Event "${event.title}" overlaps with "${overlappingEvent.title}"`,
        });
    }

    res.json({ status: 'success', data: event });
});

// Endpoint to fetch all upcoming events
app.get('/events', (req, res) => {
    const now = new Date();
    const upcomingEvents = events.filter((event) => new Date(event.time) > now);
    res.json({ status: 'success', data: upcomingEvents });
});

// CRON job to notify 5 minutes before an event starts
cron.schedule('* * * * *', () => {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    events.forEach((event) => {
        const eventTime = new Date(event.time);
        if (eventTime > now && eventTime <= fiveMinutesFromNow) {
            broadcast({
                type: 'notification',
                message: `Event "${event.title}" starts in 5 minutes!`,
            });
        }

        // Log completed events
        if (eventTime <= now) {
            const completedEvent = events.shift(); // Remove from array
            const completedEvents = JSON.parse(fs.readFileSync(completedEventsFile));
            completedEvents.push(completedEvent);
            fs.writeFileSync(completedEventsFile, JSON.stringify(completedEvents, null, 2));
        }
    });
});

// Start the HTTP server
const server = app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// Upgrade HTTP server for WebSocket connections
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});