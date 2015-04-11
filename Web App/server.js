/**************************************************************************************************************************************
*****************************************NODE.JS Server Source-code********************************************************************
**************************************************************************************************************************************/
 
var http  = require ('http') 									//built in module provides HTTP server and client functionality
   ,fs    = require ('fs')   									//built in fs module provides filesystem-related functionality
   ,path  = require ('path') 									//built in path module provides filesystem path-related functionality
   ,cache = {};				 									//cache object is where the contents of cached files are stored
 
var express = require('express') 								//lightweight server framerwork
   ,session = require('express-session')	 					//client session manager for handling logged in users
   ,cookieParser = require('cookie-parser')						//module for parsing cookies
   ,bodyParser = require('body-parser')  						//middleware for parsing strings to JSON objects
   ,favicon = require('serve-favicon')							//module for handling the application's favicon
   ,sendgrid = require('sendgrid')('api_user', 'api_key'); 		//sendgrid api_user && api_key

//include access to the MongoDB driver for Node
var mongojs = require("mongojs")
//localhost specified		
    ,host = "127.0.0.1"	
//use the default port for Mongo server/client connections			
    ,port = "27017"					
//init BSCIMS (database) and Objectives (collection)
    ,db = mongojs("BSCIMS", ["Objectives","Division","Transaction","Document","Employees"]);

//instantiate the server application 
var bsc = express()
//Direct the Express server to the 'public' folder containing static app files
   .use(express.static(__dirname + '/public'))

//Invoke all the extensions that Express will need to parse the app's body
   .use(bodyParser.urlencoded({ extended: false}))
   .use(bodyParser.json())
   .use(bodyParser.text())
   .use(bodyParser.raw())
   .use(session({ secret: 'qwertyasdfg'}))

//server retrieval of login page
   .get('/login', function (req, res){
   		res.sendfile('public/login.html');
   		console.log("No BUG_1");
   })

//route to actual login
   .post('/login', function (req, res) {
   		var user = {
   			userName: req.body.username,
   			password: req.body.password
   		};

   		var userRoles = [];

   		//check for access role selections
   		if (req.body.empRole == "on") {
   			userRoles.push({isEmp:true});
   		} else if (req.body.empRole == undefined) {
   			userRoles.push({isEmp:false});
   		}
   		if (req.body.HRRole == "on") {
   			userRoles.push({isHr:true});
   		} else if (req.body.HRRole == undefined) {
   			userRoles.push({isHr:false});
   		}
   		if (req.body.supervisorRole == "on") {
   			userRoles.push({isSup:true});
   		} else if ((req.body.supervisorRole == undefined)) {
   			userRoles.push({isSup:false});
   		}

   		//find that one employee logging in using their login details and create a session
   		db.Employees.findOne(user, function (err, data) {
   			if (data) {
   				req.session.loggedUser = {userName:data.userName,empName:data.empName,PFNum:data.PFNum,roles:data.roles, chosenRoles:userRoles};
   				res.redirect('/');
   				//console.log(req.session.loggedUser);

   			} else {
   				res.redirect('/login');
   			}
   		}) 
   		console.log("No BUG_2");
   })

	.get('*', function(req, res) {
   		if (!req.session.loggedUser) {
   			res.redirect('/login');
   		} else {
   			res.sendfile('public/main.html');
   		} 
   		console.log("No BUG_3");
    })

	.get('/logout', function (req, res) {
		req.session.resert();
		res.redirect('/login');
	})

/**************************************************************************************************************************************
******************************SERVER OPERATIONS FOR FINANCE PERSPECTIVES OBJECTIVES****************************************************
**************************************************************************************************************************************/
    /*.get("/retrieveFinanceObjectives", function (req, res) {
		db.Objectives.find(function (err, docs) {
			if (err) {
				console.log(err);
			}
			else {
				res.json(docs);
			}
		});
	})*/


/***************************************************************
			MAJOR BUG HERE!!!
***************************************************************/
    .post("/getAllObjectives", function ( req, res) {
   		//console.log("Beginning of route");
		db.Objectives.find({status: "unapproved"}, function (err, docs) {
			if (err) {
				console.log("There is an error");
			} else { 
				res.json(docs);
				console.log(docs);
			}
			console.log(res);
			console.log("say!");		
		});
		

		/*sendgrid.send({
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
		})*/
	})

	.post("/getPendingObjectives", function ( req, res) {
	   		console.log("Beginning of route");
			db.Objectives.find({status: "sent_for_approval"}, function (err, docs) {
				if (err) {
					console.log("There is an error");
				} else { 
					res.json(docs);
					console.log(docs);
				}
				console.log(res);
				console.log("say!");		
			});
		})

   .post("/showAllDivisions", function (req, res) {
		db.Division.find(function (err, doc){
			if ( err || !doc) {
                res.send("No divisions found");
            } else {
                res.json(doc);
            }
		});
		console.log("No BUG_4");
	})

	.post("/getSecEmployees", function (req, res) {
		var div = req.body.divName;
		db.Division.find({DivName: div},function (err, doc){
			if ( err || !doc) {
                res.send("No Employees found");
            } else {
                res.send(doc);
            }
		});
		console.log("No BUG_5");
	})

	.post("/getLoggedInEmp", function (req, res) {
		res.send(req.session.loggedUser);
		console.log("No BUG_6");
	})

	.post("/getEmpObjectives", function (req, res) {
		var pfnum = Number(req.body.pfno);
		console.log(pfnum);
		db.Objectives.find({createdBy:pfnum},function (err, doc){
			if ( err || !doc) {
                res.send("No objectives found");
            } else {
                res.send(doc);
                console.log(doc);
            }
		});
		console.log("No BUG_7");
	})

    .post("/financePerspectiveController", function (req, res) {
		var svc = req.body;
		db.Objectives.insert(req.body, function (err, doc) {
			//Update existing objectives and assert a 'status' field - set to unapproved
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "finance"}}, {multi: false}, 
				function (err, doc) {
					res.json(doc);
					console.log(doc);
			});
		})
	})

	.delete("/financePerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

/*****************************************************************************************************************************************
**********************************SERVER OPERATIONS FOR CUSTOMER PERSPECTIVE OBJECTIVES***************************************************
******************************************************************************************************************************************/
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
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "customer"}}, {multi: false}, 
				function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		});
	})

	.delete("/customerPerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

/*****************************************************************************************************************************************
***************************SERVER OPERATIONS FOR INTERNAL PERSPECTIVE OBJECTIVES**********************************************************
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
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "internal"}}, {multi: false}, 
				function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		});
	})

	.delete("/internalPerspectiveController/:id", function (req, res) {
		var id = req.params.id;
		console.log(id);
		db.Objectives.remove({_id: mongojs.ObjectID(id)}, function (err, doc) {
			res.json(doc);
		});
	})

/******************************************************************************************************************************************
*********************************SERVER OPERATIONS FOR LEARN & GROWTH PERSPECTIVE OBJECTIVES***********************************************
*******************************************************************************************************************************************/
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
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "learn"}}, {multi: false}, 
				function (err, doc) {
				res.json(doc);
				console.log(doc);
			});
		});
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
	})

/******************************************************************************************************************************************
***********************************SUBMIT OBJECTIVE OPERATION (CHANGES STATUS OF OBJECTIVE)************************************************
******************************************************************************************************************************************/

	.post("/objectivesSubmitted_status_changed:id", function (req, res) {
		var ID = req.params.id;
		console.log(ID);
		
		//Updating status of sent objectives to distinguish them from unsent in order for Supervisor to have access to them
		db.Objectives.update({ _id: mongojs.ObjectId(ID)}, {$set : {status: "sent_for_approval"}}, {multi: false}, function (err, doc) {		
			if (err) {																															
				console.log(err);																												
			} 
			else {
				res.json(doc);
				console.log(doc);
			}
		});
	})



	.post('/getEmpsPendingObjs', function (req, res) {
		db.Employees.find( function (err, cur) {
			if (err) {
				console.log(err.message);
			}
			else {
				res.json(cur);
				console.log(cur);
			}
		})
	});

//Log on the console the 'init' of the server
console.log("Server initialized on port 3002...");

module.exports = bsc;