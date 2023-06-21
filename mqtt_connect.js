const mqtt = require('mqtt');

const host = '192.168.43.192';
const port = '1883';

const mqttcon = mqtt.connect(`mqtt://${host}:${port}`,{
    username:'pi',
    password:'raspberry'
});

module.exports = mqttcon