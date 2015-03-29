/*****************************************************************************************************************
										NODE.JS Server Source-code
*****************************************************************************************************************/

var http  = require ('http') //built in module provides HTTP server and client functionality
   ,fs    = require ('fs')   //built in fs module provides filesystem-related functionality
   ,path  = require ('path') //built in path module provides filesystem path-related functionality
   ,mime  = require ('mime') //add-on mime module provides ability to derive a MIME type based on a filename extension
   ,cache = {};				 //cache object is where the contents of cached files are stored
 
var express = require('express') 	//lightweight server framerwork
   ,userSession = require('client-sessions')	 //client session manager for handling logged in users
   ,cookieParser = require('cookie-parser')	//module for parsing cookies
   ,bodyParser = require('body-parser')  	//middleware for parsing strings to JSON objects
   ,favicon = require('serve-favicon')		//module for handling the application's favicon
   ,sendgrid = require('sendgrid')('bl1nk3r', 'MySendGrid'); //sendgrid api_user && api_key

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

//Session handler middleware with basic configurations
   .use(userSession({
   		cookieName: 'userSession',
   		secret: 'qwertyasdfg',			//random, high-entropy string for cookie encryption
   		duration: 30 * 60 * 1000,		//defines how long the session will live in milliseconds (after duration, cookie will be reset)
   		activeDuration: 5 * 60 * 1000	//increase duration by interacting with site (5 minutes in our case)
   }))

//login route that checks database for user record and verifies password (nothing stored in cookie)
	.post('/login', function (req, res) {
		db.Employees.findOne({ EmpName: req.userName}, function (err, emp) {
			if (!emp) {
				//res.render('index.html',)
				console.log('Invalid Login!!!');
			}	else {
				if (req.body.password === emp.password) {
					res.redirect('/main');
				}	else {
					res.render ()
					console.log('Your password is fucked up!!!');
				}
			}
		})
	})

	.use(function (req, res, next) {
		if (req.userSession && req.userSession.emp) {
			Employees.findOne({ userName: req.userSession.emp.useName}, function (err, emp) {
				if (emp) {
					req.emp = emp;
					delete req.emp.password; 		//delete the password from the session
					req.userSession.emp = emp;
					res.locals.emp = user;
				}
				//finishing processing the middleware and run the route
				next();
			});
		}	else {
			next();
		}
	})

	.get('/logout', function (req, res) {
		req.userSession.reser();
		res.redirect('/');
	});

function requireLogin (req, res, next) {
	if (!req.emp) {
		res.redirect('index');
	}	else {
		next();
	}
};


/**************************************************************************
	Server operations for Finance Perspective Objectives
**************************************************************************/
/*bsc.get("/financePerspective", function(req, res) {
	db.Objectives.find(function(err, docs) {
		res.json(docs);
	});
});*/

   bsc.get("/retrieveFinanceObjectives", function (req, res) {
		db.Objectives.find(function (err, docs) {
			res.json(docs);
		});
	})

   .get("/getAllObjectives", function (req, res) {
		db.Objectives.find(function (err, docs) {
			if (err) {
				console.log("There is an error");
			} else {
				res.json(docs);
				console.log("Results are : ");
				console.log(docs);
			}
			
		});

		sendgrid.send({
			to: 'jay.rego.14@gmail.com',
			from: 'testRun@bscims.com',
			subject: 'Kindly Receive These Objectives',
			text: "Isn't this awesome :D ",
			//Termplate not yet working... get back to it <ASAP/>
			//"%body%": "Coming soon",
			"filters": {
				"templates": {
					"settings": {
						"enabled": 1,
						"template_id": "dc857727-f018-4267-8a45-b31919e2c247"
					}
				}
			}

		}, function (err, json) {
			if (err) {
				return console.error(err);
			}
			console.log(json);
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

    .post("/financePerspectiveController", function (req, res) {
		var svc = req.body;
		db.Objectives.insert(req.body, function (err, doc) {
			//res.json(doc);
			//console.log(doc.description);
			//Update existing objectives and assert a 'status' field - set to unapproved
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "finance"}}, {multi: false}, function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		})

		

		console.log(svc);
	})

	/*.post("/financePerformanceRatingController", function(req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function(err, doc) {
			res.json(doc);
		});

		console.log(svc);
	})*/

	.delete("/financePerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

/**************************************************************************
	Server operations for Customer Perspective Objectives
**************************************************************************/
	.get("/customerPerspective", function (req, res) {
		db.Objectives.find(function(err, docs) {
			res.json(docs);
		});
	})

	.post("/customerPerspectiveController", function (req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function (err, doc) {
			//res.json(doc);
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "customer"}}, {multi: false}, function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		});

		console.log(svc);
	})

	.delete("/customerPerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

/**************************************************************************
	Server operations for Internal Business Perspective Objectives
**************************************************************************/
	.get("/internalPerspective", function (req, res) {
		db.Objectives.find(function (err, docs) {
			res.json(docs);
		});
	})

	.post("/internalPerspectiveController", function (req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function (err, doc) {
			//res.json(doc);
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "internal"}}, {multi: false}, function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		});

		console.log(svc);
	})

	.delete("/internalPerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

/**************************************************************************
		Server operations for Learn & Growth Perspective Objectives
**************************************************************************/
	.get("/learnPerspective", function (req, res) {
		db.Objectives.find(function (err, docs) {
			res.json(docs);
		});
	})

	.post("/learnPerspectiveController", function (req, res) {
		var svc = req.body;
		//res.send("Success");
		db.Objectives.insert(req.body, function (err, doc) {
			//res.json(doc);
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "learn"}}, {multi: false}, function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		});

		console.log(svc);
	})

	.delete("/learnPerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

	.get('/', function (req, res) {
		sendgrid.send({
			to: ['jay.rego.14@gmail.com'],
			from: 'testRun@bscims.com',
			subject: 'Kindly Receive These Objectives',
			"filters": {
				"templates": {
					"settings": {
						"enabled": 1,
						"template_id": "dc857727-f018-4267-8a45-b31919e2c247"
					}
				}
			}

		}, function (err, json) {
			if (err) {
				return console.error(err);
			}
			console.log(json);
		});
	});

//Log on the console the 'init' of the server
console.log("Server initialized on port 3002...");

//Wait for a connection on port '3000' (idle port in this case)
//bsc.listen(3000);
module.exports = bsc;