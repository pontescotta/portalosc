require('./config/global').setGlobal(__dirname);

var express = require('express'),
	app = express(),
	port = process.env.PORT || 3000,
	bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, XMLHttpRequest');
	next();
});

app.use(express.static(rootPath + '/client/'));
app.use(require('./server'));

app.listen(port, function(){
	console.log('Portal OSC rodando na porta ' + port);
});

//var cluster = require('cluster');
//var numCPUs = require('os').cpus().length;
//
//if (cluster.isMaster) {
//	for (var i = 0; i < numCPUs; i++) {
//		cluster.fork();
//	}
//}
//else{
//	app.listen(port, function(){
//		console.log('Portal OSC rodando na porta ' + port);
//	});
//}