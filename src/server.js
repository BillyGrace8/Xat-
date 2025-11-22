const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      res.writeHead(500);
      return res.end("Error al carregar el chat");
    }
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(html);
  });
});

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
  console.log("Cliente conectado");

  ws.on("message", msg => {
    const text = msg.toString();
    // reenviar a tots els clients
    wss.clients.forEach(c => {
      if (c.readyState === WebSocket.OPEN) c.send(text);
    });
  });

  ws.on("close", () => console.log("Cliente desconectado"));
});

// Port flexible per hosting (Render, Railway, etc.)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en http://0.0.0.0:${PORT}`);
});
