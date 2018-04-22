var mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var Topic = '#'; //subscribe to all topics
var Broker_URL = 'mqtt://localhost';
var Database_URL = 'localhost';

var options = {
	clientId: 'MyMQTT',
	port: 1883,
	//username: 'mqtt_user',
	//password: 'mqtt_password',
	keepalive : 60
};

var client  = mqtt.connect(Broker_URL, options);
client.on('connect', mqtt_connect);
client.on('reconnect', mqtt_reconnect);
client.on('error', mqtt_error);
client.on('message', mqtt_messsageReceived);
client.on('close', mqtt_close);

function mqtt_connect() {
    //console.log("Connecting MQTT");
    client.subscribe(Topic, mqtt_subscribe);
}

function mqtt_subscribe(err, granted) {
    console.log("Subscribed to " + Topic);
    if (err) {console.log(err);}
}

function mqtt_reconnect(err) {
    //console.log("Reconnect MQTT");
    //if (err) {console.log(err);}
	client  = mqtt.connect(Broker_URL, options);
}

function mqtt_error(err) {
    //console.log("Error!");
	//if (err) {console.log(err);}
}

function after_publish() {
	//do nothing
}

function mqtt_messsageReceived(topic, message, packet) {
	var pesan = parseInt(message, 10);
	//console.log('Message received = ' + message);
	insert_message(topic, pesan, packet);
}

function mqtt_close() {
	//console.log("Close MQTT");
}

////////////////////////////////////////////////////
///////////////////// MYSQL ////////////////////////
////////////////////////////////////////////////////
var mysql = require('mysql');

//Create Connection
var connection = mysql.createConnection({
	host: Database_URL,
	user: "USER", //input username
	password: "PASSWORD",//input password
	database: "DATABASE", //input databasename
});

connection.connect(function(err) {
	//if (err) throw err;
	//console.log("Database Connected!");
});

connection.on('error', function(err) {
  console.log(err.code); // 'ER_BAD_DB_ERROR'
});

var nilai;
//insert a row into the tbl_messages table
function insert_message(topic, message, packet) {
	var sql = "SELECT ?? FROM dataPengguna where id=?";
	var params = ['skor',message];
	sql = mysql.format(sql,params);
	var publish ={}
	connection.query(sql,function (error, results,fields) {
		if (results.length == 0){
			console.log("kartu tidak terdaftar");
			nilai = 0;
		}
		 else{
		 global.skor = parseInt(results[0].skor,10)+10;
		 var query = "UPDATE dataPengguna SET skor =? WHERE id = ?";
		 var parameter = [global.skor,message];
		 query = mysql.format(query,parameter);
		 connection.query(query, function(error,results){
			if (error) throw error;
			else{
				console.log("berhasil ditambahkan");
				nilai = 1;
			}
		 });
		 }
	});
};
var server = http.createServer(function(req,res){
  console.log('request dibuat : '+req.url);
  res.writeHead(200,{'Content-Type': 'application/json'});
  var obj={
  };
	obj['status']=nilai;
  res.end(JSON.stringify(obj));
});
server.listen(3030, 'localhost');
console.log('listen port 3030');
