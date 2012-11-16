
$(function() {
	var canvas = document.getElementById('game');
	var context = canvas.getContext('2d');

	context.beginPath();
	context.moveTo(100, 150);
	context.lineTo(450, 50);
	context.lineWidth = 15;
	context.stroke();

	var bodies = [];
		
	var socket = io.connect('http://localhost:3000');
	socket
		.on('connect', function(data) {
			console.log('connected');
			bodies = [];
		})
		.on('body', function(data) {
			bodies[data.id] = data;
			console.log(data.angle);
		});

	setInterval(function() {
		context.clearRect(0,0,500,500);
		
		context.beginPath()
		context.rect(100,400,250,10);
		context.stroke();
		
		for(var body_id in bodies) {
			var body = bodies[body_id];
			
			context.save();
			
			context.translate(body.position.x, 500-body.position.y);
			context.fillText(body_id, 0, -15);
			
			context.beginPath();
			context.rotate(-1*body.angle);
			context.translate(-2.5, -2.5);
	
			context.rect(0, 0, 5, 5);
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();
			
			context.restore();
		}
		
	},1);
});