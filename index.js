require('pmx').init();
var argv = require('yargs').argv;

var Hapi = require('hapi');
var conf = require('hs.gg-config').get(argv.env || 'local');
var config = conf.services.api;

var express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	morgan = require('morgan'),
	restful = require('node-restful'),
	mongoose = restful.mongoose;
var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
	'extended': 'true'
}));
//enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Expose-Headers", "X-Total-Count");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.json({
	type: 'application/vnd.api+json'
}));
app.use(methodOverride());

mongoose.connect(conf.services.db);

var User = conf.models.user(mongoose);
var Game = conf.models.game(mongoose);

var UserResource = restful.model('user', User);
UserResource.methods(['get', 'post', 'put', 'delete']);

var GameResource = restful.model('game', Game);
GameResource.methods(['get', 'post', 'put', 'delete']);

UserResource.after('get', function(req, res, next) {
	UserResource.find({}, function(err, data){
		res.header('X-Total-Count', data.length);
		next();
	});
});
GameResource.after('get', function(req, res, next) {
	GameResource.find({}, function(err, data){
		res.header('X-Total-Count', data.length);
		next();
	});
});


UserResource.register(app, '/user');
GameResource.register(app, '/game');


app.listen(config.port);