require('pmx').init();
var argv = require('yargs').argv;

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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Expose-Headers", "X-Total-Count, Authorization");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.json({
	type: 'application/vnd.api+json'
}));
app.use(methodOverride());

mongoose.connect(conf.services.db);

var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401).end();
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  
  if (user.name === config.adminUser && user.pass === config.adminPass) {
    return next();
  } else {
    return unauthorized(res);
  }
};

var User = conf.models.user(mongoose);
var Game = conf.models.game(mongoose);
var GlobalUser = conf.models.globalUser(mongoose);

app.get('/ping', function(req,res){
	res.sendStatus(200).end();
});

app.get('/user', auth, function(req,res,next){ next(); });
app.post('/user', auth, function(req,res,next){ next(); });
app.get('/user/*', auth, function(req,res,next){ next(); });
app.put('/user/*', auth, function(req,res,next){ next(); });
app.delete('/user/*', auth, function(req,res,next){ next(); });

app.put('/game/*', auth, function(req,res,next){ next(); });
app.delete('/game/*', auth, function(req,res,next){ next(); });

app.post('/globaluser', auth, function(req,res,next){ next(); });
app.put('/globaluser/*', auth, function(req,res,next){ next(); });
app.delete('/globaluser/*', auth, function(req,res,next){ next(); });

var UserResource = restful.model('user', User);
UserResource.methods(['get', 'post', 'put', 'delete']);

var GameResource = restful.model('game', Game);
GameResource.methods(['get', 'post', 'put', 'delete']);

var GlobalUserResource = restful.model('global-user', GlobalUser);
GlobalUserResource.methods(['get', 'post', 'put', 'delete']);

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
GlobalUserResource.after('get', function(req, res, next) {
	GlobalUserResource.find({}, function(err, data){
		res.header('X-Total-Count', data.length);
		next();
	});
});


UserResource.register(app, '/user');
GameResource.register(app, '/game');
GlobalUserResource.register(app, '/global-user');


app.listen(config.port);