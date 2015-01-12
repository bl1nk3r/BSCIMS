var mongo = require("mongo");
var host = "127.0.0.1";
var port = mongo.Connection.DEFAULT_PORT;

var db = new mongo.Db("PMS", new.mongo.Server(host, port, {}));

db.open(function(error){
	console.log("We are now connected to " + host + ":" + port);

	db.collection()
});