var mongo = require("mongodb");
var host = "127.0.0.1";
var port = "27017";

var db = new mongo.Db("PMS", new mongo.Server(host, port, {safe:false}));

db.open(function(error){
	console.log("We are now connected to " + host + ":" + port);

	db.collection("PMS", function(error, collection){
		console.log("We have the collection PMS");
	});
});