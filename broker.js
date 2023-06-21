const aedes = require('aedes');
const net = require('net');
const db = require('./dbcon')

// Configuration for the MQTT broker
const broker = aedes();

// Create a TCP server
const server = net.createServer(broker.handle);

// Event when a client is connected to the broker
broker.on('client', (client) => {
  console.log('Client connected:', client.id);
});

broker.on('publish', (packet, client,) => {
  
  const now = new Date();
  timestamp = formatDate(now);

  if(packet.topic == 'sensorDHT22') {
    
    const payloadString = packet.payload.toString();
    const payloadObject = JSON.parse(payloadString);

    payloadObject.TimeSend = timestamp;

    packet.payload = Buffer.from(JSON.stringify(payloadObject));

    console.log('Received message:', packet.payload.toString());

    const sql = `INSERT INTO mqtt_receive (time_send,temperature,humidity) VALUES ('${payloadObject.TimeSend}','${payloadObject.Temperature}','${payloadObject.Humidity}');`
    db.query(sql,(err,fields) => {
      if (err) {
          console.error('Insert Data Failed ',err)
          return;
      }
      console.log('Insert Data Success')
    })
}

});

// Event when a client is disconnected from the broker
broker.on('clientDisconnect', (client) => {
  console.log('Client disconnected:', client.id);
});

broker.on('subscribe', (subscriptions, client) => {
  // Check if the sensor topic is subscribed by the client
  if (subscriptions.includes('sensorDHT22')) {
    console.log('Client subscribed to sensor_topic:', client.id);
  }
});


// Middleware for authenticating clients
broker.authenticate = (client, username, password, callback) => {
  // Replace with your own authentication logic
  const validUsername = 'pi';
  const validPassword = 'raspberry';

  if (username === validUsername && password.toString() === validPassword) {
    // Authentication successful
    callback(null, true);
  } else {
    // Authentication failed
    const error = new Error('Authentication failed');
    error.returnCode = 4; // Set appropriate return code (4 = Authentication error)
    callback(error, false);
  }
};

// Start the MQTT broker
server.listen(1883, () => {
  console.log('MQTT broker is running');
});

function formatDate(date) {
    const hours = padLeft(date.getHours(), 2)
    const minutes = padLeft(date.getMinutes(), 2)
    const seconds = padLeft(date.getSeconds(), 2)
    const milliseconds = padLeft(date.getMilliseconds(), 3)
  
    const format = `${hours}:${minutes}:${seconds}.${milliseconds}`;

    return format
  }

function padLeft(number, length) {
  let str = String(number)
  while (str.length < length) {
    str = '0' + str
  }
  return str
}
