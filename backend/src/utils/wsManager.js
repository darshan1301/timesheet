const WebSocket = require("ws");
const jwt = require("jsonwebtoken");

const clients = new Map();
let wss = null;

function setupWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection...");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        const { token } = data;

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            ws.send(
              JSON.stringify({
                error: "Token not verified, please login again.",
              })
            );
            ws.close();
            return;
          }

          // Attach decoded user to ws connection
          ws.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
          };

          // Store the connection against userId (using decoded userId)
          clients.set(decoded.userId, ws);

          ws.send(
            JSON.stringify({
              message: "WebSocket Authenticated",
            })
          );
        });
      } catch (err) {
        console.error("Invalid message format:", message);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
        ws.close();
      }
    });
    ws.on("close", () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`WebSocket closed for user ${ws.userId}`);
      }
    });
  });
}

function getClients() {
  return clients;
}

module.exports = {
  setupWebSocketServer,
  getClients,
};
