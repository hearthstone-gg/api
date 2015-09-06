require('pmx').init();
var argv = require('yargs').argv;

var Hapi = require('hapi');
var conf = require('hs.gg-config').get(argv.env || 'local');
var config = conf.services.api;
var server = new Hapi.Server();

server.connection({
	port: config.port,
	routes: {
		cors: true
	}
});

server.start(function() {
	console.log('Server running at:', server.info.uri);
});

server.route({
	config: {
		cors: true
	},
	method: 'GET',
	path: '/ping',
	handler: function(request, reply) {
		reply({
			ok: true
		});
	}
});

var Mongoose = require('mongoose');

var mongoose = Mongoose.connect(conf.services.db);

var User = conf.models.user(mongoose);

server.route({
	method: 'GET',
	path: '/user',
	handler: function(request, reply) {
		User.find({}, function(err, users) {
			reply(users)
		});
	}
});

server.route({
	method: 'GET',
	path: '/user/{userId}',
	handler: function(request, reply) {
		User.findOne({
			'_id': request.params.userId
		}, function(err, user) {
			reply(user);
		});
	}
});

server.route({
	method: 'POST',
	path: '/user',
	handler: function(request, reply) {
		var user = new User(request.payload);
		user.save(function(err, user) {
			reply(user);
		});
	}
});

server.route({
	method: 'PUT',
	path: '/user/{userId}',
	handler: function(request, reply) {
		User.findOne({
			'_id': request.params.userId
		}, function(err, user) {
			for (var prop in request.payload) {
				if (request.payload.hasOwnProperty(prop)) {
					user[prop] = request.payload[prop];
				}
			}
			user.save(function(err, user) {
				reply(user);
			});
		});
	}
});

server.route({
	method: 'DELETE',
	path: '/user/{userId}',
	handler: function(request, reply) {
		User.remove({
			'_id': request.params.userId
		}, function(err, user) {
			reply({ message: 'User Deleted' });
		});
	}
});