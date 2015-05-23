var argv = require('yargs').argv;

require('pmx').init();

var Hapi = require('hapi');
var config = require('hs.gg-config').get(argv.env || 'local').services.api;
var server = new Hapi.Server();

server.connection({
	port: config.port
});

server.start(function() {
	console.log('Server running at:', server.info.uri);
});

server.route({
	config: {cors: true},
	method: 'GET',
	path: '/ping',
	handler: function(request, reply) {
		reply({ok: true});
	}
});