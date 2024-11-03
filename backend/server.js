const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let wsClient = null;
const responseResolvers = new Map();

wss.on('connection', (ws) => {
    if (wsClient) {
        console.log('Client already connected, closing new connection');
        ws.close();
        return;
    }

    console.log('Client connected via WebSocket');
    wsClient = ws;

    ws.on('message', (message) => {
        try {
            const parsedRequest = JSON.parse(message);
            const { id, response } = parsedRequest;
            console.log('Received response from client:', { id, response });

            if (responseResolvers.has(id)) {
                const resolve = responseResolvers.get(id);
                resolve(response);
                responseResolvers.delete(id);
            }
        } catch (err) {
            console.error('Invalid request format from client:', message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        wsClient = null;
        responseResolvers.forEach((resolve) => resolve(null));
        responseResolvers.clear();
    });
});

function sendRequestToClientWithId(request) {
    return new Promise((resolve, reject) => {
        if (!wsClient || wsClient.readyState !== WebSocket.OPEN) {
            return reject('No client connected');
        }

        const id = uuidv4();
        responseResolvers.set(id, resolve);

        const requestWithId = JSON.stringify({ id, request });
        console.log('Sending request to client:', { id, request });

        wsClient.send(requestWithId, (err) => {
            if (err) {
                responseResolvers.delete(id);
                reject('Error sending request to client');
            }
        });
    });
}

app.post('/sendRequest', async (req, res) => {
    const jsonPayload = req.body;

    if (!jsonPayload) {
        return res.status(400).json({ error: 'No JSON payload provided' });
    }

    try {
        const clientResponse = await sendRequestToClientWithId(jsonPayload);
        
        if (clientResponse === null) {
            return res.status(500).json({ error: 'Client disconnected or response timed out' });
        }
        
        res.status(200).json({ response: clientResponse });
    } catch (error) {
        res.status(500).json({ error });
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
