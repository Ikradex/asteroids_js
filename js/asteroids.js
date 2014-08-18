/**
 *	HTML5 Asteroids game
 *	@author Chris Twomey
 */

/*================================================*/
/* Global
/*================================================*/

var version = 0.9;

// set-up canvas
var canvas = null,
	container = document.getElementById( "gameCanvasContainer" );

canvas = document.createElement( "canvas" );
var ctx = canvas.getContext( "2d" );
canvas.width = container.offsetWidth;
canvas.height = container.offsetHeight;
//canvas.width = 650;
//canvas.height = 450;

var mouseX, mouseY;

var GAME_SCALE = 1;
var BOUNDARY_INNER_SIZE = GAME_SCALE,
	BOUNDARY_OUTER_SIZE = ( 1 - BOUNDARY_INNER_SIZE ) / 2;

var MAX_FPS = 80;

var time_second = 0;

var boundary = document.createElement( "div" );
boundary.width = canvas.width * BOUNDARY_INNER_SIZE;
boundary.height = canvas.height * BOUNDARY_INNER_SIZE;

var boundary = {
	el: document.createElement( "div" ),
	origin: {
		x: canvas.width * BOUNDARY_OUTER_SIZE,
		y: canvas.height * BOUNDARY_OUTER_SIZE
	}
};

boundary.el.position = "absolute";
boundary.el.top = canvas.height * BOUNDARY_OUTER_SIZE;
boundary.el.left = canvas.width * BOUNDARY_OUTER_SIZE;
boundary.el.width = canvas.width * BOUNDARY_INNER_SIZE;
boundary.el.height = canvas.height * BOUNDARY_INNER_SIZE;

canvas.appendChild( boundary.el );
container.appendChild( canvas );

/*==============================*/
/* Game Constants & Variables
/*==============================*/

var TO_RADIANS = Math.PI / 180, TO_DEGREES = 180 / Math.PI;
var INITIAL_SCORE = 0;

var respawn = {
	x: boundary.el.width / 2,
	y: boundary.el.height / 2,
	radius: 64
};

var seconds_played = 0;

var entities = new Array( ),
	crafts = new Array( ),
	asteroids = new Array( ),
	particles = new Array( ),
	keysDown = new Array( );

var keyCodesUsed = new Array( 16, 27, 32, 37, 38, 39, 40, 65, 68, 83, 87, 121 ) 

var gameOver = false;

var score = INITIAL_SCORE,
	level_no = 0,
	frameCount = 0,
	gameLives = 3,
	game_fps = 0;

var debug = false;

for( var i = 1; i < 6; i++ ) {
	asteroids.push( "res/img/asteroid" + i + ".svg" );
}

var ship;
var soundManager = new SoundManager( );
var game = new AsteroidsGame( );

/*==============================*/
/* Main Loop
/*==============================*/

var main = function( ) {
	var now = Date.now( ),
		delta = now - then;

	time_second = delta;
	
	if( game ) {
		game.update( delta / 1000 );
		game.render( delta );
	}

	then = now;
};

var then = Date.now( );
setInterval( main, 1000 / game.FPS );

/*==============================*/
/* Game Class
/*==============================*/

function AsteroidsGame( ) {
	this.FPS = MAX_FPS;
	this.started = false;
	this.paused = false;
	this.level = null;
	this.gameMenu = new GameMenu( this );
	this.gameOverMenu = null;
	this.pauseMenu = null;

	var that = this;

	window.addEventListener( "blur", function( e ) {
		that.pause( );
	}, false );

	canvas.addEventListener( "mousemove", function( e ) { 
		if( e.offsetX || e.offsetY == 0 ) {
		    mouseX = e.offsetX;
		    mouseY = e.offsetY;
		}
	}, false );

	addEventListener( "keydown", function( e ) {
		if( e.keyCode in keyCodesUsed || ( e.keyCode == 32 || 
										   e.keyCode == 37 || 
										   e.keyCode == 38 ||
										   e.keyCode == 39 || 
										   e.keyCode == 40 )) {
			e.preventDefault( );
		}
		keysDown[ e.keyCode ] = true;

		if( e.keyCode == 121 ) {
			e.preventDefault( );
			if( debug ) {
				debug = false;
			} else {
				debug = true;
			}
		}
	}, false );

	addEventListener( "keyup", function( e ) {
		delete keysDown[ e.keyCode ];

		if( e.keyCode == 27 ) {
			e.preventDefault( );

			if( that.started && ! gameOver ) {
				if( that.paused ) {
					that.unpause( );
				} else {
					that.pause( );
				}
			}
		}
	}, false );
}

AsteroidsGame.prototype.update = function( delta ) {
	if( this.gameMenu ) {
		this.gameMenu.update( delta );
	}

	if( this.started ) {
		if( ! this.paused ) {
			if( ! this.level.over ) {
				if( gameOver ) {
					this.gameOverMenu.update( delta );	
				} else {
					ship.update( delta );
				}

				this.level.update( delta );

				if( score > 0 && ( ship.score_to_reward / score < 1 )) {
					if( ! ship.rewarded ) {
						ship.bonus( );
					}
				}
			} else {
				level_no++;
				this.level = new Level( level_no );
			}

			this.updateFPS( delta );
		} else {
			if( this.pauseMenu ) {
				this.pauseMenu.update( delta );
			}
		}
	}

	frameCount++;
};

AsteroidsGame.prototype.render = function( delta ) {
	ctx.font = "14px AtariChunky";
	ctx.fillStyle = "#000000";
	ctx.fillRect( 0, 0, canvas.width, canvas.height );
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#FFFFFF";
	ctx.strokeRect( canvas.width * BOUNDARY_OUTER_SIZE, canvas.height * BOUNDARY_OUTER_SIZE, boundary.el.width, boundary.el.height );
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText( "Score: " + score, 25, 25 );

	if( debug ) {
		ctx.font = "11px Monospace";
		ctx.strokeStyle = "rgba( 255, 255, 255, 0.2 )";
		ctx.beginPath( );
		ctx.moveTo( 0, canvas.height / 2 );
		ctx.lineTo( canvas.width, canvas.height / 2 );
		ctx.stroke( );

		ctx.beginPath( );
		ctx.moveTo( canvas.width / 2, 0 );
		ctx.lineTo( canvas.width / 2, canvas.height );
		ctx.stroke( );

		var entitiesY = 105;
		for( var i = 0; i < entities.length; i++ ) {
			var entity = entities[ i ];
			ctx.arc( entity.pos.x, entity.pos.y, 100, 0, 2 * Math.PI, false );
			ctx.fillText( "(" + Math.round( entity.pos.x ) + ", " + Math.round( entity.pos.y ) + ")", 
				entity.pos.x + entity.image.width / 2, entity.pos.y - entity.image.height / 2 );
			entitiesY += 25;
		}

		ctx.fillText( "FPS: " + game_fps, boundary.el.width - 100, 25 );
		ctx.fillText( "Time: " + seconds_played, boundary.el.width - 100, 50 );
		
		if( this.started ) {  
			ctx.fillText( "Level: " + level_no, ( boundary.el.width / 2 ) - 15, 25 ); 
		}
	}

	if( this.gameMenu ) {
		this.gameMenu.render( );
	}

	if( this.started ) {
		if( gameOver ) {
			if( this.gameOverMenu ) {
				this.gameOverMenu.render( );
			}
		} else {
			ship.render( );
		}

		this.level.render( );

		if( this.paused ) {
			if( this.pauseMenu ) {
				this.pauseMenu.render( );
			}
		}
	}
};

AsteroidsGame.prototype.start = function( ) {
	this.gameMenu = null;
	this.pauseMenu = null;
	this.paused = false;
	this.started = true;
	seconds_played = 0;
	level_no = 0;
	ship = new Ship( );
	this.level = new Level( level_no );
	score = INITIAL_SCORE;
	canvas.style.cursor = "default";
};

AsteroidsGame.prototype.stop = function( ) {
	/*var xhReq = new XMLHttpRequest( );
		xhReq.open( "GET", "score_tracker.php?action=remove_game_log", true );
		xhReq.send( null );

	xhReq.onreadystatechange = function( ) {
		if( xhReq.readyState == 4 ) {
			if( xhReq.status == 200 ) {
				if( ! xhReq.responseText == "OK" ) {
					alert( "Error in communicating with server" );
				}
			}
		}
	}*/

	this.started = false;
	gameOver = false;
	ship = null;
	this.level = null;
	this.gameOverMenu = null;
	this.gameMenu = new GameMenu( this );
	canvas.style.cursor = "default";
};

AsteroidsGame.prototype.over = function( ) {
	gameOver = true;
	this.gameMenu = null;
	this.pauseMenu = null;
	this.gameOverMenu = new GameOverMenu( this );
	canvas.style.cursor = "default";
};

AsteroidsGame.prototype.pause = function( ) {
	if( game.started && ! gameOver ) {
		this.pauseMenu = new PauseMenu( this );
	}
};

AsteroidsGame.prototype.unpause = function( ) {
	this.pauseMenu = null;
	this.paused = false;
};

AsteroidsGame.prototype.logKill = function( destroyedObj, objScoreValue, clientScore, levelNo, time ) {
	var killData = "kill_data=" + JSON.stringify({ "obj" : destroyedObj, 
									"scoreValue" : objScoreValue, 
									"clientScore" : clientScore,
									"levelNo" : levelNo,
									"timeOfKill" : time });

	/*var xhReq = new XMLHttpRequest( );
		xhReq.open( "POST", "score_tracker.php", true );
		xhReq.setRequestHeader( "Content-type","application/x-www-form-urlencoded" );
		xhReq.send( killData ); */
};

AsteroidsGame.prototype.submitHighScore = function( score, username ) {
	/*var xhReq = new XMLHttpRequest( );
		xhReq.open( "GET", "score_tracker.php?action=submit_high_score&score=" + score + "&username=" + username, true );
		xhReq.send( null );

	xhReq.onreadystatechange = function( ) {
		if( xhReq.readyState == 4 ) {
			if( xhReq.status == 200 ) {
				if( xhReq.responseText == "OK" ) {
					game.stop( );
				} else if( xhReq.responseText == "ERR" ) {
					alert( "Error - Could not verify score with server" );
					game.stop( );
				}
			}
		}
	}*/
};

AsteroidsGame.prototype.updateFPS = function( delta ) {
	if( frameCount % this.FPS == 0 ) {
		game_fps = Math.round(( 1000 / delta ) / 1000 );
	}
};