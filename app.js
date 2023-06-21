const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const router = express.Router();
const app = express();
const mqttcon = require('./mqtt_connect');
const db = require('./dbcon');

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// Set up WebSocket server
const wss = new WebSocket.Server({port:3001})

// Subscribe to a topic
mqttcon.subscribe('sensorDHT22');
mqttcon.on('connect', function () {
  console.log('MQTT client connected');
});

// Handle incoming messages
let sensorData = {};
mqttcon.on('message', function (topic, message) {
  if (topic === 'sensorDHT22') {
    console.log(message.toString());
    sensorData = JSON.parse(message.toString());
    const now = new Date();
    timestamp = formatDate(now);

    if(sensorData){
      sensorData.Time_Received = timestamp; 
    }
    console.log(sensorData);
    const sql = `UPDATE mqtt_receive SET time_received = '${sensorData.Time_Received}' WHERE time_received IS NULL;`
    db.query(sql,(err,fields) => {
      if (err) {
          console.error('Insert Data Failed ',err)
          return;
      }
      console.log('Insert Data Success')
    })

    // Send sensor data to WebSocket clients
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sensorData));
      }
    });
  }
});

// API route to serve HTML file with WebSocket client code
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/sensorDHT22', function (req, res) {
    res.json(sensorData);
  });

app.listen(3000, function () {
  console.log('API server listening on port 3000');
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

