/*****************************************************************************************************************
										NODE.JS Server Source-code
*****************************************************************************************************************/

var http  = require ('http') //built in module provides HTTP server and client functionality
   ,fs    = require ('fs')   //built in fs module provides filesystem-related functionality
   ,path  = require ('path') //built in path module provides filesystem path-related functionality
   ,mime  = require ('mime') //add-on mime module provides ability to derive a MIME type based on a filename extension
   ,cache = {};				 //cache object is where the contents of cached files are stored
 
var express = require('express') 	//lightweight server framerwork
   ,expressSession = require('express-session')	 //express session manager for handling logged in users
   ,cookieParser = require('cookie-parser')	//module for parsing cookies
   ,bodyParser = require('body-parser')  	//middleware for parsing strings to JSON objects
   ,favicon = require('serve-favicon')		//module for handling the application's favicon
   ,under	= require('underscore');

//include access to the MongoDB driver for Node
var mongojs = require("mongojs")
//localhost specified		
    ,host = "127.0.0.1"	
//use the default port for Mongo server/client connections			
    ,port = "27017"					
//init BSCIMS (database) and Objectives (collection)
    ,db = mongojs("BSCIMS", ["Objectives","Division","Transaction","Transaction","Document"]);

//instantiate the server application
var bsc = express()
//Direct the Express server to the 'public' folder containing static app files
   .use(express.static(__dirname + '/public'))

//Invoke all the extensions that Express will need to parse the app's body
   .use(bodyParser.urlencoded({ extended: false}))
   .use(bodyParser.json())
   .use(bodyParser.text())
   .use(bodyParser.raw())

/**************************************************************************
	Server operations for Finance Perspective Objectives
**************************************************************************/
/*bsc.get("/financePerspective", function(req, res) {
	db.Objectives.find(function(err, docs) {
		res.json(docs);
	});
});*/

   .get("/retrieveFinanceObjectives", function(req, res) {
		db.Objectives.find(function(err, docs) {
			res.json(docs);
		});
	})

   .get("/getAllObjectives", function(req, res) {
		db.Objectives.find(function(err, docs) {
			if (err) {
				console.log("There is an error");
			} else {
				res.json(docs);
				console.log("Results are : ");
				console.log(docs);
			}
			
		});
	})

   /*.get("/getAllObjectives", function(req, res) {
		db.Division.find(function(err, docs) {
			if (err) {
				console.log("There is an error");
			} else {
				res.json(docs);
				console.log("Employees are: ");
				console.log(docs);
			}
			
		});
	})*/

    .post("/financePerspectiveController", function(req, res) {
		var svc = req.body;
		db.Objectives.insert(req.body, function(err, doc) {
			res.json(doc);
			console.log(doc);
		});

		console.log(svc);
	})

	.post("/financePerformanceRatingController", function(req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function(err, doc) {
			res.json(doc);
		});

		console.log(svc);
	})

	.delete("/financePerspectiveController/:id", function(req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
			res.json(doc);
		});
	})

/**************************************************************************
	Server operations for Customer Perspective Objectives
**************************************************************************/
	.get("/customerPerspective", function(req, res) {
		db.Objectives.find(function(err, docs) {
			res.json(docs);
		});
	})

	.post("/customerPerspectiveController", function(req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function(err, doc) {
			res.json(doc);
		});

		console.log(svc);
	})

	.delete("/customerPerspectiveController/:id", function(req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
			res.json(doc);
		});
	})

/**************************************************************************
	Server operations for Internal Business Perspective Objectives
**************************************************************************/
	.get("/internalPerspective", function(req, res) {
		db.Objectives.find(function(err, docs) {
			res.json(docs);
		});
	})

	.post("/internalPerspectiveController", function(req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function(err, doc) {
			res.json(doc);
		});

		console.log(svc);
	})

	.delete("/internalPerspectiveController/:id", function(req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
			res.json(doc);
		});
	})

/**************************************************************************
	Server operations for Learn & Growth Perspective Objectives
**************************************************************************/
	.get("/learnPerspective", function(req, res) {
		db.Objectives.find(function(err, docs) {
			res.json(docs);
		});
	})

	.post("/learnPerspectiveController", function(req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function(err, doc) {
			res.json(doc);
		});

		console.log(svc);
	})

	.delete("/learnPerspectiveController/:id", function(req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
			res.json(doc);
		});
	});

//Log on the console the 'init' of the server
console.log("Server initialized on port 3002...");

//Wait for a connection on port '3000' (idle port in this case)
//bsc.listen(3000);
module.exports = bsc;