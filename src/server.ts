import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  console.log("hello from server");
  res.status(200);
  res.json({ message: "hello" });
  broadcastEvent("I am under development");
  res.end();
});

type SSEClient = {
  id: number;
  res: express.response;
};

let clients: Array<SSEClient> = [];

let nextClientID = 1;

app.get("/bot", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const clientId = nextClientID++;

  const newClient: SSEClient = { id: clientId, res };

  clients.push(newClient);

  // Welcome message
  res.write(`data: ${JSON.stringify({ type: "connected", id: clientId })}\n\n`);

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
});

app.post("/bot", (req, res) => {
  console.log("hello", req.body);

  broadcastEvent({
    type: "bot_message",
    message: "I am still under development :(",
  });

  res.json({ message: "success" });
});

function broadcastEvent(data: unknown) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  clients.forEach((client) => {
    client.res.write(payload);
  });
}

export default app;
