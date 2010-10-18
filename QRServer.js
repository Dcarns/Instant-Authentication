var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../'),
		sys = require('sys'),
		
server = http.createServer(function(req, res){
	
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
			res.end();
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
		case '/QRauth.html':
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

var sockethostname = "192.168.1.14";
		
//var randomnumber=Math.floor(Math.random()*10000)
		
io.on('connection', function(client){
	client.send({ buffer: buffer });
	client.broadcast({ announcement: client.sessionId + ' connected' });

	var QRCode = { qr: []};
	
	function drawQR()
	{	    
	    //var timestamp = Number(new Date());	    
	    //var uniqueQRcode = client.sessionId * randomnumber / timestamp;	
    	
		QRCode.qr[0] = "http://" + sockethostname + ":8080/QRauth.html?clientID=" + client.sessionId;
		
    		buffer.push(QRCode);
		if (buffer.length > 15) buffer.shift();
		
	   	client.send(QRCode);
	    
	}
	drawQR();
	
	setInterval(function(){
	    
		drawQR();

    	},30000);

	client.on('message', function(message){
		
		authAnnounce = { auth: ["You Are Authenticated!"]};
		console.log("test");
		console.log(message);
		io.clients[message].send(authAnnounce);
		
	});

	client.on('disconnect', function(){
		client.broadcast({ announcement: client.sessionId + ' disconnected' });
	});
});
