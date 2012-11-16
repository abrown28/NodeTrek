
/**
 * Module dependencies.
 */

var sys = require('sys')
  , express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , b2d = require('box2d')
  , async = require('async')
  , io = require('socket.io');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('aklsj8af48$PU*#&N DPashdfpME*#*P*#U'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);

io = io.listen(server);
io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});

server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});




// Define world
var worldAABB = new b2d.b2AABB();
worldAABB.lowerBound.Set(-11500, -115000);
worldAABB.upperBound.Set( 11500.0,  11500.0);

var gravity = new b2d.b2Vec2(0.0, 0.0);
var doSleep = true;

var world = new b2d.b2World(worldAABB, gravity, doSleep);

// Ground Box
var groundBodyDef = new b2d.b2BodyDef();
groundBodyDef.position.Set(100.0, 100.0);

var groundBody = world.CreateBody(groundBodyDef);

var groundShapeDef = new b2d.b2PolygonDef();
groundShapeDef.SetAsBox(250.0, 10.0);

groundBody.CreateShape(groundShapeDef);

var bodies = [];

// Run Simulation!
timedEvent(1.0/60.0, function() {
	var timeStep = 1.0 / 60.0;
	var iterations = 10;
	world.Step(timeStep, iterations);
});

// Update Client
timedEvent(1/30, function() {	
	for(var i = 0; i < bodies.length; ++i) {
		var body = bodies[i];
		if( !body.IsSleeping() ) {
			var position = body.GetPosition();
			var angle = body.GetAngle();
			io.sockets.emit('body', {id: i, 'position': position, 'angle': angle});
		}
	}
});

createBody();
createBody();
function createBody() {
	var offset = Math.floor((Math.random()*100)+1);
	
	// Dynamic Body
	var bodyDef = new b2d.b2BodyDef();
	bodyDef.position.Set(200+offset, 400);
	var body = world.CreateBody(bodyDef);
	var shapeDef = new b2d.b2PolygonDef();
	shapeDef.SetAsBox(2.5, 2.5);
	shapeDef.density = 1.0;
	shapeDef.friction = 0.3;
	body.CreateShape(shapeDef);
	//body.SetMassFromShapes();
	body.SetMass({mass: 10, I: 1, center:{x:0, y:0}});
	body.ApplyImpulse( {x:0, y:-400}, body.GetWorldCenter() );
	body.ApplyTorque(100);

	bodies.push(body);
	return body;
}

function timedEvent(interval, callback, time) {
	if( callback === undefined )
		return false;

	if( time === undefined )
		time = process.hrtime();

	process.nextTick(function() {
		var diff = process.hrtime(time);
		diff = diff[0] * 1000000000 + diff[1];
		if( diff > (interval*1000000000) ) {
			callback(diff);
			time = process.hrtime();
		}

		timedEvent(interval, callback, time);
	});

};









