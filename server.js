/**************************************************************************************************************************************
*****************************************NODE.JS Server Source-code********************************************************************
**************************************************************************************************************************************/
 
var http  = require ('http') 												//built in module provides HTTP server and client functionality
   ,fs    = require ('fs')   												//built in fs module provides filesystem-related functionality
   ,path  = require ('path') 												//built in path module provides filesystem path-related functionality
   ,cache = {};	
   			 												//cache object is where the contents of cached files are stored
 
var express = require('express') 											//lightweight server framerwork
   ,session = require('express-session')	 								//client session manager for handling logged in users
   ,cookieParser = require('cookie-parser')									//module for parsing cookies
   ,bodyParser = require('body-parser')  									//middleware for parsing strings to JSON objects
   ,favicon = require('serve-favicon')										//module for handling the application's favicon
   ,sendgrid = require('sendgrid')('bl1nk3r', 'SendGrid-api')	 		    //sendgrid api_user && api_key
   ,mandrill = require('node-mandrill')('Mandrill-api')
   ,ejs      = require('ejs')
   ,flash    = require('connect-flash');

//include access to the MongoDB driver for Node
var mongojs = require("mongojs")
//localhost specified		
    ,host = "127.0.0.1"	
//use the default port for Mongo server/client connections			
    ,port = "27017"				
//init BSCIMS (database) and Objectives (collection)
    ,db = mongojs("sebentiledb", ["Objectives","Division","Transaction","Document","Employees", "Scorecard"]);

//instantiate the server application 
var bsc = express()
//Direct the Express server to the 'public' folder containing static app files
   .use(express.static(__dirname + '/public'))
   .set('views', __dirname + '/public/views')
   .set('view engine', 'ejs')
 
//Invoke all the extensions that Express will need to parse the app's body
   .use(bodyParser.urlencoded({ extended: false}))
   .use(bodyParser.json())
   .use(bodyParser.text())
   .use(bodyParser.raw())
   .use(cookieParser())

   .use(session({
       //key: 'express.sid',
       secret: 'secret',
       maxAge: new Date(Date.now() + 3600000),
       //store: new MongoStore({ db: 'bscims', collection: 'sessions' })
   }))

	//server retrieval of login page
	.get('/login', function (req, res){
   		var msg = {error: 'none'};

   		if (req.session.loggdUser) {
   			res.render('main');
   		} else {
   			res.render('login', msg);
   		}
	})

    .get('/', function (req, res){
    	if (!req.session.loggdUser) {
   			res.redirect('/login');
   		} else {
   			res.render('main');
   		}
	})

    .post('/login', function (req, res){
   		var user = {
   			userName: req.body.username,
   			password: req.body.password,
   		};
  
   		if (req.body.username == '' || req.body.password == '') {
   			res.render('login', {error: 'Please fill in all fields'});
   		} else {
	   		var formRoles = [];
	   		var currRoles = [];

	   		db.Employees.findOne(user, function (err, data) {
	   			if (data) {
	   				// create a formRoles array to hold roles chosen at login
					if (req.body.empRole == 'on') {
						formRoles.push('employee');
					}
					if (req.body.supervisorRole == 'on') {
						formRoles.push('supervisor');
					}
					if (req.body.HRRole == 'on') {
						formRoles.push('HR');
					}
					if (req.body.adminRole == 'on') {
						formRoles.push('admin');
					}

					// capture role errors : when no role was chosen or when a role where the user is not allowed was choosen
					if (formRoles.length == 0) {
						res.render('login', {error: 'Choose atleast one role!'});
					} else if ((formRoles.indexOf('employee') !== -1) && (data.roles.indexOf('employee') == -1)) {
	   					res.render('login', {error: 'You do not have access to emp role'});
	   				} else if ((formRoles.indexOf('supervisor')  !== -1) && (data.roles.indexOf('supervisor') == -1)) {
	   					res.render('login', {error: 'You do not have access to sup role'});
	   				} else	if ((formRoles.indexOf('HR')  !== -1) && (data.roles.indexOf('HR') == -1)) {
	   					res.render('login', {error: 'You do not have access to HR role'});
	   				} else	if ((formRoles.indexOf('admin')  !== -1) && (data.roles.indexOf('admin') == -1)) {
	   					res.render('login', {error: 'You do not have access to admin role'});
	   				} else {
	   					// create an array of roles that the user has choosen
	   					if ((formRoles.indexOf('employee') !== -1) && (data.roles.indexOf('employee') !== -1)) {
							currRoles.push('employee');
		   				}
		   				if ((formRoles.indexOf('supervisor') !== -1) && (data.roles.indexOf('supervisor') !== -1)) {
		   					currRoles.push('supervisor');
		   				}
		   				if ((formRoles.indexOf('HR') !== -1) && (data.roles.indexOf('HR') !== -1)) {
		   					currRoles.push('HR');
		   				}
		   				if ((formRoles.indexOf('admin') !== -1) && (data.roles.indexOf('admin') !== -1)) {
		   					currRoles.push('admin');
		   				}
		   				
	   					req.session.loggdUser = {userName:data.userName,empName:data.empName,PFNum:data.PFNum,dbRoles:data.roles, currentRoles:currRoles};
		   				res.redirect('/');
	   				}
	   			} else {
	   				var msg = {error: 'Incorrect credentials, login again'};
	   				res.render('login', msg);
	   			}
//COMMENT
	   			for (var i = 0; i< currRoles.length; i++) {
	   				console.log(currRoles[i]);
	   			}
   			})
		}
	})
  
	.get('*', function(req, res) {
   		if (!req.session.loggdUser) {
   			res.redirect('/login');
   		} else {
   			res.redirect('/');
   		}
    })

	.post('/logout', function (req, res) {
		req.session.destroy();
		//req.session.userId = '';
		res.redirect('/login');
		console.log("***********************************************************logged out*********************************************");
	})


/**************************************************************************************************************************************
******************************SERVER OPERATIONS FOR FINANCE PERSPECTIVES OBJECTIVES****************************************************
**************************************************************************************************************************************/
    .post("/getAllObjectives", function ( req, res) {
   		//console.log("Beginning of route");
		db.Objectives.find({status: "unapproved"}, function (err, docs) {
			if (err) {
				console.log("There is an error");
			} else { 
				res.json(docs);
				//console.log(docs);
			}
			//console.log(res);
			//onsole.log("say!");		
		});
	})

	.post("/getPendingObjectives", function ( req, res) {
	   		//console.log("Beginning of route");
			db.Objectives.find({status: "sent_for_approval"}, function (err, docs) {
				if (err) {
					console.log("There is an error");
				} else { 
					res.json(docs);
					//console.log(docs);
				}
				//onsole.log(res);
				//console.log("say!");		
			});
	})

	.post("/getApprovedObjectives", function ( req, res) {
	   		//console.log("Beginning of route");
			db.Objectives.find({status: "approved"}, function (err, docs) {
				if (err) {
					console.log("There is an error");
				} else { 
					res.json(docs);
					//console.log(docs);
				}
				//onsole.log(res);
				//console.log("say!");		
			});
	})

	/* FOR SELF EVALUATION by Mlandvo*/
	
	//get all KPAs by Mlandvo
	.post("/getKPAs", function (req, res) {
	   		console.log("Retrieving all aproved KPAs");
			db.Objectives.find({status: "approved"}, function (err, data) {
				if (err || !data) {
					console.log("No Approved KPA's found");
				} else { 
					console.log(data);
					res.send(data);
				
				}
				//onsole.log(res);
				//console.log("say!");		
			});
	})
	/*By Mlandvo
	.post('/completeSelfEval', function (req, res) {
        var kpa = req.body;
        var id = String(kpa.id);
        var rating = Number(kpa.rating);
        console.log(id);
        console.log(typeof kpa.weightedRating);
        db.Objectives.update({_id:id},{$set: {status:kpa.status, empComment:kpa.empComment, rating:rating, weightedRating:kpa.weightedRating, score:kpa.score}}, {multi: false}, function (err, saved) {
            if (err) {
                res.send("An error occured");    
            } else {
            	console.log("KPA updated");
                res.send("KPA successfully updated");

            }
        });
    })*/
	//by Mlandvo
    .post("/getEvalKPAs", function ( req, res) {
	   		console.log("getting evaluated KPAs");
	   		//var uname = req.body.loggedUserName;
			db.Objectives.find({status: "evaluatedByEmp"}, function ( err, data) {
				if ( err || !data) {
					console.log("There is an error getting KPAs");
					res.send("No Evaluated KPAs found");
				} else { 
					res.send(data);
				}	
			});
	})
	// by Mlandvo
	.put('/completeSelfEval/', function (req, res) {
		var kpa = req.body;
		var id = String(kpa.id);
        var rating = Number(kpa.rating);
		console.log(req.body);
		db.Objectives.findAndModify({query:{_id: mongojs.ObjectId(id)},
			update: {$set: {status:kpa.status, empComment:kpa.empComment, rating:rating, weightedRating:kpa.weightedRating, score:kpa.score}},
			new: true}, function (err, data) {
				console.log("Rating saved");
				res.send("Evaluationn completed for current KPA");
			});
		
	})
	//By Mlandvo
	.post('/file-upload/', function (req, res, next) {
    	console.log(req.body);
    	console.log("server uploading");
    	//console.log(req.file);
		var filename    = req.files.file.name;
        var tmpFilepath="./upload/"+ guid();
        fs.rename(req.files.file.path,tmpFilepath);
        fs.createReadStream(tmpFilepath)
          .on('end', function() {
         console.log("file Saved");
      	})
          .on('error', function() {
           console.log("error encountered");
           // res.send('ERR');
          })
          // and pipe it to gfs
          .pipe(writestream);
            writestream.on('close', function (file) {
            fs.unlink(tmpFilepath);

        });
	})



//********************************


	.post("/getUnapprovedObjectives", function ( req, res) {
	   		//console.log("Beginning of route");
			db.Objectives.find({status: "approved"}, function (err, docs) {
				if (err) {
					console.log("There is an error");
				} else { 
					res.json(docs);
					//console.log(docs);
				}
				//onsole.log(res);
				//console.log("say!");		
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
	})

	.post("/getLoggedInEmp", function (req, res) {
		res.send(req.session.loggdUser);
		//console.log(req.session[req.session.userId]);
	})

	.post("/getEmpObjectives", function (req, res) {
		var pfnum = Number(req.body.pfno);
		console.log(pfnum);
		db.Objectives.find({PFNum: pfnum},function (err, doc){
			if ( err || !doc) {
                res.send("No objectives found");
            } else {
                res.send(doc);
                //console.log(doc);
            }
		});
	})

    .post("/financePerspectiveController", function (req, res) {
		
		db.Objectives.insert(req.body, function (err, doc) {
			//Update existing objectives and assert a 'status' field - set to unapproved
			console.log("USER PF:");
			console.log(req.session.loggdUser.PFNum);
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "finance", PFNum: req.session.loggdUser.PFNum}}, {multi: false}, 
				function (err, doc) {
					res.json(doc);
					//console.log(doc);
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
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "customer", PFNum: req.session.loggdUser.PFNum}}, {multi: false}, 
				function (err, doc) {
				res.json(doc);
				//console.log(doc);
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
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "internal", PFNum: req.session.loggdUser.PFNum}}, {multi: false}, 
				function (err, doc) {
				res.json(doc);
				//console.log(doc);
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
			db.Objectives.update({description: req.body.description}, {$set : {status: "unapproved", perspective: "learn", PFNum: req.session.loggdUser.PFNum}}, {multi: false}, 
				function (err, doc) {
				res.json(doc);
				//console.log(doc);
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

/******************************************************************************************************************************************
***********************************SUBMIT OBJECTIVE OPERATION (CHANGES STATUS OF OBJECTIVE)************************************************
******************************************************************************************************************************************/

	.post("/objectivesSubmitted_status_changed/:id", function (req, res) {
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

		mandrill('/messages/send', {
			message: {
			to: [{email: 'jay.rego.14@gmail.com', name: 'Mamba'}],
			from_email: 'objectives@bscims.sec',
			subject: "You have objectives!",
			text: "An employee has sent you objectives for review... View : 127.0.0.1:3002/login.html"
			}
		}, function (error, response) {
			if (error) {
				console.log(JSON.stringify(error));
			}
			else {
				console.log(response);
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
				//console.log(cur);
			}
		})
	})

/******************************************************************************************************************************************
***********************************SUBMIT OBJECTIVE OPERATION (CHANGES STATUS OF OBJECTIVE)************************************************
******************************************************************************************************************************************/

	.post("/createScoreCardRoute:/:id", function (req, res) {
		var ID = req.params.id;
		//console.log(req.body);
		
		//Updating status of sent objectives to distinguish them from unsent in order for Supervisor to have access to them
		db.Objectives.findOne({ _id: mongojs.ObjectId(ID)}, function (err, doc) {		
			if (err) {																															
				console.log(err);																												
			} 
			else {
				res.json(doc);
				//console.log(doc);
			}
		});

		/*db.Scorecard.insert(req.params.ID, function (err, doc) {
			if (err) {
				console.log(err);
			}
			else {
				res.json(doc);
			}
		});*/
	})

/******************************************************************************************************************************************
***********************************INITIALIZE SCORECARD OPERATION (ON "CLOSE" BUTTON CLICK ************************************************
******************************************************************************************************************************************/

	.post("/initScorecardRoute:/", function (req, res) {
		//var ID = req.params.id;
		//var SC = req.body;
		//console.log(ID);
		var ID =req.body;
		//console.log(ID);
		
		for (var i = 0; i<ID.length; i++){
			db.Objectives.findOne({ _id: mongojs.ObjectId(ID[i]._id)}, function (err, doc) {		
				if (err) {																															
					console.log(err);																												
				} 
				else {
					//res.json(doc);
					console.log(doc);
					db.Scorecard.insert({"Objectives_ID": doc._id, "Createdby:": doc.PFNum, "DateCreated": Date()}, function (err, doc) {
						if (err) {

							console.log(err);
						}
						else {
							//res.json(doc);
							console.log("here:");
							console.log(doc);
						}
					});
				}
			});
		}
	})

/******************************************************************************************************************************************
***********************************APPROVE FINANCE OBJECTIVE OPERATION (CHANGES STATUS OF OBJECTIVE)***************************************
******************************************************************************************************************************************/
	.post('/approveFinanceObjective/:id', function (req, res) {
		var ID = req.params.id
			,persp = req.params.perspective
			,finUpdate = req.body;

		console.log("The expected ID is:")
		console.log(ID);
		db.Objectives.update({_id: mongojs.ObjectId(ID)}, {$set: {status: "approved", description: finUpdate.description, DSO: finUpdate.DSO, 
													metricOneDef: finUpdate.oneDef, metricTwoDef: finUpdate.twoDef, metricThreeDef: finUpdate.threeDef,
													metricFourDef: finUpdate.fourDef, metricFiveDef: finUpdate.fiveUpdate}}, {multi: false}, function (err, doc) {
			if (err) {
				console.log(err);
			}
			else {
				res.json(doc);
				console.log("Approved objectives:")
				console.log(doc);
			}
		})
		
	})

	/*.post('/rejectFinanceObjective/:id', function (req, res) {
		var ID = req.params.id;

		console.log("The expected ID is:")
		console.log(ID);
		db.Objectives.update({_id: mongojs.ObjectId(ID)}, {$set: {status: "unapproved" }}, {multi: false}, function (err, doc) {
			if (err) {
				console.log(err);
			}
			else {
				res.json(doc);
				console.log("Unapproved objectives:")
				console.log(doc);
			}
		})
		
	})*/


//Log on the console the 'init' of the server
console.log("Server initialized on port 3003...");

module.exports = bsc;
