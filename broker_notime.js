const aedes = require('aedes');
const net = require('net');

// Configuration for the MQTT broker
const broker = aedes();

// Create a TCP server
const server = net.createServer(broker.handle);

broker.on('client', (client) => {
  console.log('Client connected:', client.id);
});

broker.on('publish', (packet, client,) => {
  if(packet.topic == 'sensorDHT22') {
    console.log('Received message:', packet.payload.toString());
}});

broker.on('clientDisconnect', (client) => {
  console.log('Client disconnected:', client.id);
});

broker.on('subscribe', (subscriptions, client) => {
  if (subscriptions.includes('sensorDHT22')) {
    console.log('Client subscribed to sensor_topic:', client.id);
  }
});


// Middleware for authenticating clients

broker.authenticate = (client, username, password, callback) => {
  const validUsername = 'pi';
  const validPassword = 'raspberry';

  if (username === validUsername && password.toString() === validPassword) {
    callback(null, true);
  } else {
    const error = new Error('Authentication failed');
    error.returnCode = 4; // Set appropriate return code (4 = Authentication error)
    callback(error, false);
  }
};

// Start the MQTT broker
server.listen(1883, () => {
  console.log('MQTT broker is running');
});

