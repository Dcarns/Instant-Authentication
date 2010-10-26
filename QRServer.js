/**
 * QR Instant Authentication Server
 * 
 * @author David Carns <dcarns@gmail.com>
 * @license The MIT license.
 * @copyright Copyright (c) 2010 David Carns <dcarns@gmail.com>
 */


var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../../'), //Alter the require path to your socket.io location
		sys = require('sys'),
		
server = http.createServer(function(req, res){
	
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
			fs.readFile(__dirname + '/QRClient.html', function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
			break;
			
		case '/json.js':
		case '/QRClient.html':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
			break;
		case '/QRAuth.html':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
			break;
			
		default: send404(res);
	}
}),

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

server.listen(8080);
		
//socket.io server
var io = io.listen(server),
	buffer = [];

var sockethostname = "localhost";

io.on('connection', function(client){
	client.send({ buffer: buffer });
	client.broadcast({ announcement: client.sessionId + ' connected' });

	var QRCode = { qr: []};
	
	function drawQR()
	{	    
    	
		QRCode.qr[0] = "http://" + sockethostname + ":8080/QRAuth.html?clientID=" + client.sessionId;
	
		buffer.push(QRCode);
		if (buffer.length > 15) buffer.shift(); 
	
	   	client.send(QRCode);
	    
	}
	drawQR();
	
	/*
	setInterval(function(){
	    
		drawQR();

    	},30000);
    */

	client.on('message', function(message){
			
		authAnnounce = { auth: ["You Are Authenticated!<br><br>Check your broswer for the session cookie SessionCookieFromQR.<br><br>Passing you to the secured application...."], cookie: [message.cookie[0]] };
		console.log("Authenticated: " + message.cookie[0] + ": " + message.client[0]);
		io.clients[message.client[0]].send(authAnnounce);
		
	});

	client.on('disconnect', function(){
		client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});
