const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");


const app = express();
app.use(cors()); // enable CORS for your app
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  verifyClient: (info, callback) => {
    // allow all connections
    callback(true);
  },
});

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.send("Welcome to the WebSocket server!");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
