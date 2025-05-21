document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const wsUrlInput = document.getElementById('wsUrl');
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const connectionStatus = document.getElementById('connectionStatus');
    const lastPing = document.getElementById('lastPing');
    const connectionLatency = document.getElementById('connectionLatency');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const messageLog = document.getElementById('messageLog');
    
    let socket = null;
    let pingInterval = null;
    let pingStartTime = 0;
    
    // Update UI to show connection status
    function updateStatusUI(status) {
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        
        // Remove all status classes
        statusDot.classList.remove('connected', 'connecting', 'disconnected');
        
        switch(status) {
            case 'connected':
                statusDot.classList.add('connected');
                statusText.textContent = 'Connected';
                connectionStatus.textContent = 'Connected';
                connectBtn.disabled = true;
                disconnectBtn.disabled = false;
                messageInput.disabled = false;
                sendBtn.disabled = false;
                break;
                
            case 'connecting':
                statusDot.classList.add('connecting');
                statusText.textContent = 'Connecting...';
                connectionStatus.textContent = 'Connecting...';
                connectBtn.disabled = true;
                disconnectBtn.disabled = false;
                messageInput.disabled = true;
                sendBtn.disabled = true;
                break;
                
            case 'disconnected':
                statusDot.classList.add('disconnected');
                statusText.textContent = 'Disconnected';
                connectionStatus.textContent = 'Disconnected';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
                messageInput.disabled = true;
                sendBtn.disabled = true;
                break;
        }
    }
    
    // Add message to log
    function logMessage(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        messageLog.appendChild(logEntry);
        messageLog.scrollTop = messageLog.scrollHeight;
    }
    
    // Send ping to measure latency
    function sendPing() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            try {
                pingStartTime = Date.now();
                socket.send(JSON.stringify({ type: 'ping' }));
            } catch (err) {
                logMessage(`Failed to send ping: ${err.message}`, 'error');
            }
        }
    }
    
    // Connect to WebSocket
    function connectWebSocket() {
        const url = wsUrlInput.value.trim();
        
        if (!url) {
            logMessage('Please enter a valid WebSocket URL', 'error');
            return;
        }
        
        try {
            // Close existing connection if any
            if (socket) {
                socket.close();
            }
            
            updateStatusUI('connecting');
            logMessage(`Connecting to ${url}...`, 'info');
            
            socket = new WebSocket(url);
            
            // Connection opened
            socket.addEventListener('open', (event) => {
                updateStatusUI('connected');
                logMessage(`Connected to ${url}`, 'info');
                
                // Start sending pings every 5 seconds
                if (pingInterval) {
                    clearInterval(pingInterval);
                }
                pingInterval = setInterval(sendPing, 5000);
                sendPing(); // Send initial ping
            });
            
            // Listen for messages
            socket.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Handle ping response
                    if (data.type === 'pong') {
                        const latency = Date.now() - pingStartTime;
                        connectionLatency.textContent = `${latency}ms`;
                        lastPing.textContent = new Date().toLocaleTimeString();
                    } else {
                        logMessage(`Received: ${event.data}`, 'received');
                    }
                } catch (err) {
                    // Handle non-JSON messages
                    logMessage(`Received: ${event.data}`, 'received');
                }
            });
            
            // Connection closed
            socket.addEventListener('close', (event) => {
                updateStatusUI('disconnected');
                logMessage(`Disconnected (Code: ${event.code}, Reason: ${event.reason || 'None'})`, 'info');
                
                if (pingInterval) {
                    clearInterval(pingInterval);
                    pingInterval = null;
                }
                
                connectionLatency.textContent = '-';
            });
            
            // Error handling
            socket.addEventListener('error', (error) => {
                logMessage('WebSocket Error', 'error');
                console.error('WebSocket Error:', error);
            });
            
        } catch (err) {
            logMessage(`Connection error: ${err.message}`, 'error');
            updateStatusUI('disconnected');
        }
    }
    
    // Disconnect WebSocket
    function disconnectWebSocket() {
        if (socket) {
            socket.close();
            socket = null;
        }
    }
    
    // Send message
    function sendMessage() {
        const message = messageInput.value.trim();
        
        if (!message || !socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        try {
            socket.send(message);
            logMessage(`Sent: ${message}`, 'sent');
            messageInput.value = '';
        } catch (err) {
            logMessage(`Failed to send message: ${err.message}`, 'error');
        }
    }
    
    // Event listeners
    connectBtn.addEventListener('click', connectWebSocket);
    disconnectBtn.addEventListener('click', disconnectWebSocket);
    
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Initialize UI
    updateStatusUI('disconnected');
    logMessage('WebSocket Tester initialized. Enter a URL and click Connect to begin.', 'info');
});