# STOMP Websocket Tester

A simple web application that demonstrates STOMP messaging over WebSockets with custom message testing capabilities.

## Features

- Connect to any STOMP WebSocket server (configurable URL)
- Send standard greeting messages
- Send custom messages to any destination
- Subscribe to custom topics dynamically
- Receive and display messages from multiple subscriptions
- View full message content and metadata
- Detailed error reporting and connection status

## Technologies

- Vanilla JavaScript (ES6+)
- Bootstrap 5
- STOMP.js for WebSocket communication

## Usage

1. Open the application in your browser
2. Enter your WebSocket server URL (default: `ws://localhost:8080/gs-guide-websocket`)
3. Click "Connect" to establish a WebSocket connection
4. Use the Simple Greeting form to send basic messages:
   - Enter your name and click "Send"
5. Use the Custom Message form for advanced testing:
   - Specify a custom destination
   - Subscribe to different topics
   - Create custom JSON message bodies
   - Send messages to any endpoint
6. View all responses in the table below, including timestamps and destination information

## Advanced Testing

### Custom Destinations

To send messages to a custom destination:

1. Enter the destination path in the "Destination" field (e.g., `/app/custom`)
2. Create your JSON message in the message body field
3. Click "Send Custom Message"

### Custom Subscriptions

To subscribe to additional topics:

1. Enter the subscription topic in the "Subscribe to" field (e.g., `/topic/custom`)
2. Click "Subscribe"
3. All messages from this topic will appear in the conversation table
