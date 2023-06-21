var mysql = require('mysql');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'dht22db'
});

db.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected to mysql');
  });

module.exports = db