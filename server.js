const WebSocket = require("ws");
const uuid = require("uuid");

const wss = new WebSocket.Server({ port: 8080 });

let subscribers = new Set();

function subscribe() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subscriberId = uuid.v4();
      subscribers.add(subscriberId);
      const message = {
        type: "Subscribe",
        status: "Subscribed",
        updatedAt: Date.now(),
        subscriberId,
      };
      resolve(message);
    }, 4000);
  });
}

function unsubscribe() {
  return new Promise((resolve) => {
    setTimeout(() => {
      subscribers.clear();
      const message = {
        type: "Unsubscribe",
        status: "Unsubscribed",
        updatedAt: Date.now(),
      };
      resolve(message);
    }, 8000);
  });
}

function countSubscribers() {
  const message = {
    type: "CountSubscribers",
    count: subscribers.size,
    updatedAt: Date.now(),
  };
  return message;
}

function error() {
  const message = {
    type: "Error",
    error: "Requested method not implemented",
    updatedAt: Date.now(),
  };
  return message;
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      ws.send(
        JSON.stringify({
          type: "Error",
          error: "Bad formatted payload, non JSON",
          updatedAt: Date.now(),
        })
      );
      return;
    }

    let response;
    switch (data.type) {
      case "Subscribe":
        response = await subscribe();
        break;
      case "Unsubscribe":
        response = await unsubscribe();
        break;
      case "CountSubscribers":
        response = countSubscribers();
        break;
      default:
        response = error();
        break;
    }

    ws.send(JSON.stringify(response));
  });

  const intervalId = setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "Heartbeat",
        updatedAt: Date.now(),
      })
    );
  }, 1000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });
});
