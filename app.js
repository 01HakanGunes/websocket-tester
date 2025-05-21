// Create StompJs client

// DOM elements
const connectButton = document.getElementById("connect");
const disconnectButton = document.getElementById("disconnect");
const sendButton = document.getElementById("send");
const sendCustomButton = document.getElementById("send-custom");
const subscribeCustomButton = document.getElementById("subscribe-custom");
const nameInput = document.getElementById("name");
const wsUrlInput = document.getElementById("wsurl");
const destinationInput = document.getElementById("destination");
const subscriptionInput = document.getElementById("subscription");
const messageBodyInput = document.getElementById("message-body");
const conversationElement = document.getElementById("conversation");
const greetingsElement = document.getElementById("greetings");

// StompJs client
let stompClient = null;
let customSubscriptions = [];

function createStompClient() {
  return new StompJs.Client({
    brokerURL: wsUrlInput.value,
  });
}

// Connect to websocket
function setupStompClient() {
  stompClient = createStompClient();

  stompClient.onConnect = (frame) => {
    setConnected(true);
    console.log("Connected: " + frame);

    // Subscribe to the default topic
    subscribeToTopic("/topic/greetings");

    // Enable the custom message form
    sendCustomButton.disabled = false;
    subscribeCustomButton.disabled = false;
  };

  stompClient.onWebSocketError = (error) => {
    console.error("Error with websocket", error);
    showError("WebSocket connection error: " + error.message);
  };

  stompClient.onStompError = (frame) => {
    console.error("Broker reported error: " + frame.headers["message"]);
    console.error("Additional details: " + frame.body);
    showError("STOMP error: " + frame.headers["message"]);
  };
}

function subscribeToTopic(topic, isCustom = false) {
  const subscription = stompClient.subscribe(topic, (message) => {
    try {
      const body = JSON.parse(message.body);
      showMessage(topic, body, new Date());
    } catch (e) {
      showMessage(topic, message.body, new Date(), true);
    }
  });

  if (isCustom) {
    customSubscriptions.push({
      id: subscription.id,
      topic: topic,
    });
    showInfo(`Subscribed to ${topic}`);
  }

  return subscription;
}

function setConnected(connected) {
  connectButton.disabled = connected;
  disconnectButton.disabled = !connected;
  wsUrlInput.disabled = connected;

  if (connected) {
    conversationElement.style.display = "table";
    sendCustomButton.disabled = false;
    subscribeCustomButton.disabled = false;
  } else {
    sendCustomButton.disabled = true;
    subscribeCustomButton.disabled = true;
  }
}

function connect() {
  setupStompClient();
  stompClient.activate();
}

function disconnect() {
  if (stompClient) {
    // Clear custom subscriptions
    customSubscriptions = [];

    stompClient.deactivate();
    stompClient = null;
  }

  setConnected(false);
  console.log("Disconnected");
}

function sendName() {
  const name = nameInput.value.trim();
  if (!name) {
    showError("Please enter a name");
    return;
  }

  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: "/app/hello",
      body: JSON.stringify({ name: name }),
    });
  } else {
    showError("Not connected to WebSocket server");
  }
}

function sendCustomMessage() {
  if (!stompClient || !stompClient.connected) {
    showError("Not connected to WebSocket server");
    return;
  }

  const destination = destinationInput.value.trim();
  if (!destination) {
    showError("Please enter a destination");
    return;
  }

  let messageBody;
  try {
    messageBody = JSON.parse(messageBodyInput.value);
  } catch (e) {
    showError("Invalid JSON: " + e.message);
    return;
  }

  stompClient.publish({
    destination: destination,
    body: JSON.stringify(messageBody),
  });

  showInfo(`Sent message to ${destination}`);
}

function subscribeCustom() {
  if (!stompClient || !stompClient.connected) {
    showError("Not connected to WebSocket server");
    return;
  }

  const topic = subscriptionInput.value.trim();
  if (!topic) {
    showError("Please enter a subscription topic");
    return;
  }

  // Check if already subscribed
  const existing = customSubscriptions.find((s) => s.topic === topic);
  if (existing) {
    showError(`Already subscribed to ${topic}`);
    return;
  }

  subscribeToTopic(topic, true);
}

function showMessage(destination, message, timestamp, isRaw = false) {
  const row = document.createElement("tr");

  // Timestamp cell
  const timeCell = document.createElement("td");
  timeCell.textContent = timestamp.toLocaleTimeString();
  row.appendChild(timeCell);

  // Destination cell
  const destCell = document.createElement("td");
  destCell.textContent = destination;
  row.appendChild(destCell);

  // Message cell
  const msgCell = document.createElement("td");
  if (isRaw) {
    msgCell.textContent = message;
  } else {
    if (typeof message === "object") {
      msgCell.innerHTML = `<pre>${JSON.stringify(message, null, 2)}</pre>`;
    } else {
      msgCell.textContent = message.content || message;
    }
  }
  row.appendChild(msgCell);

  greetingsElement.appendChild(row);
}

function showGreeting(message) {
  showMessage("/topic/greetings", { content: message }, new Date());
}

function showError(message) {
  const row = document.createElement("tr");
  row.className = "table-danger";

  // Timestamp cell
  const timeCell = document.createElement("td");
  timeCell.textContent = new Date().toLocaleTimeString();
  row.appendChild(timeCell);

  // Destination cell
  const destCell = document.createElement("td");
  destCell.textContent = "ERROR";
  row.appendChild(destCell);

  // Message cell
  const msgCell = document.createElement("td");
  msgCell.textContent = message;
  row.appendChild(msgCell);

  greetingsElement.appendChild(row);
}

function showInfo(message) {
  const row = document.createElement("tr");
  row.className = "table-info";

  // Timestamp cell
  const timeCell = document.createElement("td");
  timeCell.textContent = new Date().toLocaleTimeString();
  row.appendChild(timeCell);

  // Destination cell
  const destCell = document.createElement("td");
  destCell.textContent = "INFO";
  row.appendChild(destCell);

  // Message cell
  const msgCell = document.createElement("td");
  msgCell.textContent = message;
  row.appendChild(msgCell);

  greetingsElement.appendChild(row);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Hide conversation on startup
  conversationElement.style.display = "none";

  // Prevent form submissions
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => e.preventDefault());
  });

  // Add event listeners
  connectButton.addEventListener("click", connect);
  disconnectButton.addEventListener("click", disconnect);
  sendButton.addEventListener("click", sendName);
  sendCustomButton.addEventListener("click", sendCustomMessage);
  subscribeCustomButton.addEventListener("click", subscribeCustom);

  // Initially disable custom message buttons
  sendCustomButton.disabled = true;
  subscribeCustomButton.disabled = true;
});
