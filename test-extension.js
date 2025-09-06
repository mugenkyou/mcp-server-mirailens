// Simple test script to connect to the browser extension
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('Connected to browser extension');
  
  // Test navigation
  setTimeout(() => {
    console.log('Sending navigate command...');
    ws.send(JSON.stringify({
      command: 'navigate',
      args: { url: 'https://www.youtube.com' }
    }));
  }, 1000);
  
  // Test snapshot after navigation
  setTimeout(() => {
    console.log('Sending snapshot command...');
    ws.send(JSON.stringify({
      command: 'snapshot',
      args: {}
    }));
  }, 3000);
});

ws.on('message', function message(data) {
  console.log('Received:', JSON.parse(data));
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Connection closed');
});
