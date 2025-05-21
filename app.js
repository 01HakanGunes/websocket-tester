// Create StompJs client
const stompClient = new StompJs.Client({
  brokerURL: "ws://localhost:8080/gs-guide-websocket",
});

// DOM elements
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const sendButton = document.getElementById('send');
const nameInput = document.getElementById('name');
const conversationElement = document.getElementById('conversation');
const greetingsElement = document.getElementById('greetings');

// Connect to websocket
stompClient.onConnect = (frame) => {
  setConnected(true);
  console.log("Connected: " + frame);
  stompClient.subscribe("/topic/greetings", (greeting) => {
    showGreeting(JSON.parse(greeting.body).content);
  });
};

stompClient.onWebSocketError = (error) => {
  console.error("Error with websocket", error);
};

stompClient.onStompError = (frame) => {
  console.error("Broker reported error: " + frame.headers["message"]);
  console.error("Additional details: " + frame.body);
};

function setConnected(connected) {
  connectButton.disabled = connected;
  disconnectButton.disabled = !connected;
  if (connected) {
    conversationElement.style.display = 'table';
  } else {
    conversationElement.style.display = 'none';
  }
  greetingsElement.innerHTML = '';
}

function connect() {
  stompClient.activate();
}

function disconnect() {
  stompClient.deactivate();
  setConnected(false);
  console.log("Disconnected");
}

function sendName() {
  const name = nameInput.value;
  stompClient.publish({
    destination: "/app/hello",
    body: JSON.stringify({ name: name }),
  });
}

function showGreeting(message) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.textContent = message;
  row.appendChild(cell);
  greetingsElement.appendChild(row);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Hide conversation on startup
  conversationElement.style.display = 'none';
  
  // Prevent form submissions
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => e.preventDefault());
  });
  
  // Add event listeners
  connectButton.addEventListener('click', connect);
  disconnectButton.addEventListener('click', disconnect);
  sendButton.addEventListener('click', sendName);
});
