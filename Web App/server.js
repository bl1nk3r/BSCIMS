var http  = require ('http') //built in module provides HTTP server and client functionality
   ,fs    = require ('fs')   //built in fs module provides filesystem-related functionality
   ,path  = require ('path') //built in path module provides filesystem path-related functionality
   ,mime  = require ('mime') //add-on mime module provides ability to derive a MIME type based on a filename extension
   ,cache = {};				  //cache object is where the contents of cached files are stored

var dbConnect = require ('./public/js/connect.js'); //include the database connectivity from the connect module
//Three helper functions used for serving static HTTP files

//First function will handle the sending of 404 errors when a file is required that doesn't exist
function send404 (response) {
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

/*
Since accessing RAM is faster than accessing the filesystem, we will cache frequently used data in memory. Our application
will cache static files to memory, only reading them from HDD once (first time they're read)
*/

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
});