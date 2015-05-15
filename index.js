require('pmx').init();

var Hapi = require('hapi');
var port = 3000;

var server = new Hapi.Server();

server.connection({
	port: port
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