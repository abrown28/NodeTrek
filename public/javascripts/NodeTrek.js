
$(function() {
	var canvas = document.getElementById('game');
	var context = canvas.getContext('2d');

	context.beginPath();
	context.moveTo(100, 150);
	context.lineTo(450, 50);
	context.lineWidth = 15;
	context.stroke();


	var socket = io.connect('http://destructivegenius.com:3000');

	//client
	socket
		.on('connect', function(data) {
			console.log('connected');
			bodies = [];
		})
		.on('player', function(player) {
			em.addEntity(   player.entity, 'player');
			em.addComponent(player.entity, 'body', player.body);
		})
		.on('other', function(obj) {
			em.addEntity(obj.entity, 'other');
			em.addComponent(obj.entity, 'body', obj.body);
		})
		.on('update', function(obj) {
			em.addComponent(obj.entity, 'body', obj.body);
		});

	var player = {
		torpedo: function(dir) {
			socket.emit('torpedo', dir);
		}
	}

	// Draw game
	setInterval(function() {
		doUpdate();
		doDraw();
	},1.0/60.0);

	function doUpdate() {
/*        if( mouse_up && mouse_event.which == 1 ) // left mouse
        {
            //fire torpedo
            var heading = vector.to_unit(vector.sub(screen_to_world(ctx, mouse_down), player.position));
            socket.send({type:103, heading:heading});
        }
*/
	}

	function doDraw() {
		context.clearRect(0,0,500,500);
		
		context.beginPath()
		context.rect(100,400,250,10);
		context.stroke();
		

		em.forEach('body', function(entity, body) {
            context.save();

            context.translate(body.position.x, 500-body.position.y);
            context.fillText(entity, 0, -15);

            context.beginPath();
            context.rotate(-1*body.angle);
            context.translate(-2.5, -2.5);

            context.rect(0, 0, 5, 5);
            context.lineWidth = 1;
            context.strokeStyle = 'black';
            context.stroke();

            context.restore();
		});
	};
});
