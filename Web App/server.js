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
   //,daemon = require('nodemon')

//instantiate the server application
var app = express();


//var dbConnect = require ('./public/js/connect.js'); //include the database connectivity from the connect module

//Three helper functions used for serving static HTTP files

//First function will handle the sending of 404 errors when a file is required that doesn't exist
/*function send404 (response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: This shit is not found!');
	response.end();
}

//Second function will serve file data (first writes appropriate HTTP headers and then sends contents of the file)
function sendFile(response, filePath, fileContents){
	response.writeHead(
			200,
			{"content-type": mime.lookup(path.basename(filePath))}
		);
		response.end(fileContents);
}


//Since accessing RAM is faster than accessing the filesystem, we will cache frequently used data in memory. Our application
//will cache static files to memory, only reading them from HDD once (first time they're read)


//Third helper function will determine whether or not a file is cached, if cached, it serves it, else it's read from HDD and server
function serveStatic (response, cache, absPath){
	if (cache[absPath]) {								   //check if file is cached in memory
		sendFile (response, absPath, cache[absPath]);      //serve file from memory
	} else {  
		fs.exists(absPath, function(exists){               //check if file exists in HDD
			if (exists){
				fs.readFile(absPath, function(err, data){  //read file from HDD
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data; 				//cache file
						sendFile(response, absPath, data); //serve file from disk
					}
				});
			} else {
				send404(response); 							//send HTTP 404 response
			}
		});
	}
}

//Creating the HTTP server using anonymous function to define per-request behaviour
var server = http.createServer(function(request, response){
	var filePath = false;

	if (request.url == '/'){
		filePath = 'public/index.html';					//determine HTML to be served by default
	} else {
		filePath = 'public' + request.url;				//translate URL path to relative file path
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);				//serve static file
});

//Start the server and listen on TCP/IP port 3000
server.listen(3000, function(){
	console.log("Server  initialising on port 3000...");
});*/

//include access to the MongoDB driver for Node
var mongojs = require("mongojs");
//localhost specified		
var host = "127.0.0.1";	
//use the default port for Mongo server/client connections			
var port = "27017";					
//init BSCIMS (database) and Objectives (collection)
var db = mongojs("BSCIMS", ["Objectives"]);

//Direct the Express server to the 'public' folder containing static app files
app.use(express.static(__dirname + '/public'));

//Invoke all the extensions that Express will need to parse the app's body
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());

/**************************************************************************
	Server operations for Finance Perspective Objectives
**************************************************************************/
app.get("/financePerspective", function(req, res) {
	db.Objectives.find(function(err, docs) {
		res.json(docs);
	});
});

app.post("/financePerspectiveController", function(req, res) {
	var svc = req.body;
	//res.send("Success");
	db.Objectives.insert(req.body, function(err, doc) {
		res.json(doc);
	});

	console.log(svc);
});

app.post("/financePerformanceRatingController", function(req, res) {
	var svc = req.body;
	//res.send("Success");
	db.Objectives.insert(req.body, function(err, doc) {
		res.json(doc);
	});

	console.log(svc);
});

app.delete("/financePerspectiveController/:id", function(req, res) {
	var id = req.params.id;
	console.log(id);
	db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
		res.json(doc);
	});
});

/**************************************************************************
	Server operations for Customer Perspective Objectives
**************************************************************************/
app.get("/customerPerspective", function(req, res) {
	db.Objectives.find(function(err, docs) {
		res.json(docs);
	});
});

app.post("/customerPerspectiveController", function(req, res) {
	var svc = req.body;
	//res.send("Success");
	db.Objectives.insert(req.body, function(err, doc) {
		res.json(doc);
	});

	console.log(svc);
});

app.delete("/customerPerspectiveController/:id", function(req, res) {
	var id = req.params.id;
	console.log(id);
	db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
		res.json(doc);
	});
});

/**************************************************************************
	Server operations for Internal Business Perspective Objectives
**************************************************************************/
app.get("/internalPerspective", function(req, res) {
	db.Objectives.find(function(err, docs) {
		res.json(docs);
	});
});

app.post("/internalPerspectiveController", function(req, res) {
	var svc = req.body;
	//res.send("Success");
	db.Objectives.insert(req.body, function(err, doc) {
		res.json(doc);
	});

	console.log(svc);
});

app.delete("/internalPerspectiveController/:id", function(req, res) {
	var id = req.params.id;
	console.log(id);
	db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
		res.json(doc);
	});
});

/**************************************************************************
	Server operations for Learn & Growth Perspective Objectives
**************************************************************************/
app.get("/learnPerspective", function(req, res) {
	db.Objectives.find(function(err, docs) {
		res.json(docs);
	});
});

app.post("/learnPerspectiveController", function(req, res) {
	var svc = req.body;
	//res.send("Success");
	db.Objectives.insert(req.body, function(err, doc) {
		res.json(doc);
	});

	console.log(svc);
});

app.delete("/learnPerspectiveController/:id", function(req, res) {
	var id = req.params.id;
	console.log(id);
	db.Objectives.remove({_id: mongojs.ObjectID(id)}, function(err, doc) {
		res.json(doc);
	});
});

//Log on the console the 'init' of the server
console.log("Server initialized on port 3000...");

//Wait for a connection on port '3000' (idle port in this case)
//app.listen(3000);
module.exports = app;