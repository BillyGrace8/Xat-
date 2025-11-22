const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

const server = http.createServer((req, res) => {
  let file = req.url === "/" ? "index.html" : req.url.substring(1);
  const filePath = path.join(__dirname, file);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("No trobat");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });
const rooms = {}; // rooms["sala1"] = Set of ws clients

wss.on("connection", (ws, req) => {
  const sala = url.parse(req.url, true).query.sala || "general";

  if (!rooms[sala]) rooms[sala] = new Set();
  rooms[sala].add(ws);

  ws.on("message", msg => {
    rooms[sala].forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  });

  ws.on("close", () => rooms[sala].delete(ws));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor en http://0.0.0.0:${PORT}`));
