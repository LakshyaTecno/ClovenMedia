const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to server");

  // Subscribe to the server
  const subscribeMessage = { type: "Subscribe" };
  ws.send(JSON.stringify(subscribeMessage));

  // Unsubscribe from the server after 5 seconds
  setTimeout(() => {
    const unsubscribeMessage = { type: "Unsubscribe" };
    ws.send(JSON.stringify(unsubscribeMessage));
  }, 5000);

  // Request the number of subscribers after 10 seconds
  setTimeout(() => {
    const countSubscribersMessage = { type: "CountSubscribers" };
    ws.send(JSON.stringify(countSubscribersMessage));
  }, 10000);
});

ws.on("message", (message) => {
  let data;
  try {
    data = JSON.parse(message);
  } catch (e) {
    console.error("Bad formatted payload, non JSON");
    return;
  }

  switch (data.type) {
    case "Subscribe":
      console.log("Subscribed:", data.status, new Date(data.updatedAt));
      break;
    case "Unsubscribe":
      console.log("Unsubscribed:", data.status, new Date(data.updatedAt));
      break;
    case "CountSubscribers":
      console.log(
        "Number of subscribers:",
        data.count,
        new Date(data.updatedAt)
      );
      break;
    case "Error":
      console.error("Error:", data.error, new Date(data.updatedAt));
      break;
    case "Heartbeat":
      console.log("Heartbeat", new Date(data.updatedAt));
      break;
    default:
      console.error("Unknown message type:", data.type);
      break;
  }
});

ws.on("close", () => {
  console.log("Disconnected from server");
});
