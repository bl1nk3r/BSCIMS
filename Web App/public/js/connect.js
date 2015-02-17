var mongo = require("mongodb");		//include access to the MongoDB driver for Node
var host = "127.0.0.1";				//localhost specified
var port = "27017";					//use the default port for Mongo server/client connections

var db = new mongo.Db("BSCIMS", new mongo.Server(host, port, {safe:true, strict:false}));

db.open(function(error){
	console.log("We are now connected to " + host + ":" + port);

	db.collection("Division", function(error, collection){
		console.log("We have the collection Division");
	});
});

