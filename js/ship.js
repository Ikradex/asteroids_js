/*================================================*/
/* Ship Class */
/*================================================*/

/*=== constructor ===*/
function Ship( ) { 
	/*=== attributes ===*/
	this.destroySFX = "snd_destroy_low";
	this.bonusSFX = "snd_bonus";

	this.lives = 3;
	this.MAX_LIVES = 4;
	this.REWARD_INTERVAL = 10000;
	this.score_to_reward = 10000;

	this.RESPAWN_INTERVAL = 2000;
	this.timeToRespawn = this.RESPAWN_INTERVAL;

	this.WARP_INTERVAL = 1000;
	this.timeToUnWarp = this.WARP_INTERVAL;

	this.SCALE = 1.8;
	this.MAX_BULLET_DISTANCE = boundary.el.width / 2;

	this.MAX_VELOCITY = 300;
	this.ANGULAR_VELOCITY = 285 * TO_RADIANS;
	this.ACCELERATION_RATE = 50;
	
	this.PARTICLE_SPEED = 100;
	this.MIN_PARTICLES = 10;
	this.MAX_PARTICLES = 20;

	this.pos = {
		x: respawn.x,
		y: respawn.y
	};
	this.dimensions = {
		width: 24,
		height: 24
	};
	this.velocity = {
		x: 0,
		y: 0,
		max: this.MAX_VELOCITY,
		angular: this.ANGULAR_VELOCITY
	};
	this.acceleration = {
		x: 0,
		y: 0,
		rate: this.ACCELERATION_RATE,
		dir: {
			x: invert( Math.cos( Math.PI / 2 )),
			y: invert( Math.sin( Math.PI / 2 ))
		},
		max: 150
	};
	this.rotation = {
		rotating: false,
		dir: 1,
		radians: Math.PI / 2
	};
	this.canFire = true;
	this.colliding = false;
	this.inProximity = false;
	this.destroyed = false;
	this.engineFired = false;
	this.rewarded = false;
	this.bullets = new Array( );

	this.collisionCircleRadius = getBoundingCircleRadius( this.dimensions );
	this.front = parametricEquationForCircle( this.pos, this.dimensions.height / 2, this.rotation.radians - Math.PI );

	this.updateBoundaries( this.SCALE );
}

/*==============================*/
/* methods
/*==============================*/

/* Game loop methods ===*/

Ship.prototype.update = function( delta ) {
	if( ! ship.destroyed ) {
		if( 16 in keysDown ) {
			this.warp( );
		}

		if( this.warping ) {
			if( this.timeToUnWarp > 0 ) {
				this.timeToUnWarp -= ( 1000  * delta );
			} else {
				this.unWarp( );
			}
		} 

		if( 68 in keysDown || 39 in keysDown ) {
			this.rotate( 1, delta );
		}

		if( 65 in keysDown || 37 in keysDown ) {
			this.rotate( -1, delta );
		}

		if( 38 in keysDown || 87 in keysDown ) {
			this.thrust( delta );
		} else {
			this.stopThrust( delta );
		}

		if( 32 in keysDown ) {
			this.fire( );
			this.isNotAbleToFire( );
		} else {
			this.isAbleToFire( );
		}

		this.front = parametricEquationForCircle( this.pos, this.dimensions.height / 2, this.rotation.radians - Math.PI );
		this.updateBoundaries( this.SCALE );
		this.move( delta );
	} else {
		this.colliding = false;
		if( this.lives > 0 ) {
			if( this.timeToRespawn > 0 ) {
				this.timeToRespawn -= ( 1000  * delta );
			} else {
				if( ! this.respawnOccupied( )) {
					this.respawn( );
				}
			}
		} else {
			game.over( );
		}
	}

	this.updateBullets( delta );
};

Ship.prototype.render = function( ) {
	if( ! this.destroyed ) {
		ctx.save( );
		ctx.strokeStyle = "rgb( 255, 255, 255 )";

		if( ! this.warping ) {
			// draws ship lines/boundaries
			for( var pairs in this.boundaries ) {
				var points = this.boundaries[ pairs ];

				ctx.beginPath( );
				ctx.moveTo( points.pointA.x, points.pointA.y );
				ctx.lineTo( points.pointB.x, points.pointB.y );
				ctx.stroke( );
			}
		}

		if( debug ) {
			ctx.font = "11px Monospace";
			ctx.strokeStyle = "rgba( 255, 255, 255, 0.4 )";
			ctx.fillStyle = '#FFFFFF';

			ctx.fillText( "Ship (x,y): (" + Math.round( this.pos.x ) + ", " + Math.round( this.pos.y ) + ")", 25, 65 );
			ctx.fillText( "Angle (deg): " + Math.round( this.rotation.radians * TO_DEGREES ), 25, 85 );

			ctx.fillText( "Velocity (x,y): (" + Math.round( this.velocity.x ) + ", " + Math.round( this.velocity.y ) + ")", 25, 105 );
			ctx.fillText( "Acceleration (x,y): (" + Math.round( this.acceleration.x ) + ", " + Math.round( this.acceleration.y ) + ")", 25, 125 );

			ctx.fillText( "Colliding: " + this.colliding, 25, 145 );
			ctx.fillText( "In Proximity: " + this.inProximity, 25, 165 );

			ctx.beginPath( );
			ctx.moveTo( this.front.x, this.front.y );
			var endPoint = parametricEquationForCircle( this.pos, 150, this.rotation.radians - Math.PI );
			ctx.lineTo( endPoint.x, endPoint.y );
			ctx.stroke( );

			for( var pairs in this.boundaries ) {
				var points = this.boundaries[ pairs ];

				for( var point in points ) {
					ctx.beginPath( );
					ctx.arc( points[ point ].x, points[ point ].y, 1, 0, 2 * Math.PI, false );
					ctx.fill( );
					ctx.stroke( );
				}

				ctx.beginPath( );
				ctx.arc( this.pos.x, this.pos.y, this.collisionCircleRadius, 0, 2 * Math.PI, false );
				ctx.stroke( );
			}
		}
		ctx.restore( );
	}

	var shipImg = new Image( );
		shipImg.src = "res/img/ship.png";
	var livesX = 25;

	ctx.save( );
	ctx.scale( 0.7, 0.7 );
	for( var i = 0; i < this.lives; i++ ) {
		ctx.drawImage( shipImg, livesX, 30 );
		livesX += 25;
	}
	ctx.restore( );

	if( this.bullets.length > 0 ) {
		for( var i = 0; i < this.bullets.length; i++ ) {
			this.bullets[ i ].render( );
		}
	}
};

Ship.prototype.respawn = function( ) {
	this.reset( );
};

Ship.prototype.respawnOccupied = function( ) {
	var occupied = false;

	for( var i = 0; i < entities.length; i++ ) {
		var asteroid = entities[ i ];

		if( circlesIntersect( respawn.x, respawn.y, respawn.radius,
			asteroid.pos.x, asteroid.pos.y, asteroid.collisionCircleRadius )) {
			occupied = true
		}
	}
	return occupied;
};

Ship.prototype.reset = function( ) {
	this.timeToRespawn = this.RESPAWN_INTERVAL;

	this.pos = {
		x: respawn.x,
		y: respawn.y
	};
	this.velocity = {
		x: 0,
		y: 0,
		max: 300,
		angular: 200 * TO_RADIANS
	};
	this.acceleration = {
		x: 0,
		y: 0,
		rate: 350,
		dir: {
			x: invert( Math.cos( Math.PI / 2 )),
			y: invert( Math.sin( Math.PI / 2 ))
		},
		max: 150
	};
	this.rotation = {
		rotating: false,
		dir: 1,
		radians: Math.PI / 2
	};
	this.canFire = true;
	this.colliding = false;
	this.inProximity = false;
	this.destroyed = false;
	this.bullets = new Array( );

	this.front = parametricEquationForCircle( this.pos, this.dimensions.height / 2, this.rotation.radians - Math.PI );
	this.updateBoundaries( this.SCALE );
};

Ship.prototype.bonus = function( ) {
	if( this.lives < this.MAX_LIVES ) {
		this.lives++;
	}
	
	this.rewarded = true;
	this.score_to_reward += this.REWARD_INTERVAL;
	soundManager.play( this.bonusSFX );
}

/*=== Collision methods ===*/

Ship.prototype.collides = function( obj ) {
	var isColliding = false,
		proximity = false;

	if( ! this.destroyed && ! this.warping ) {
		if( distanceBetween( this.pos, obj.pos ) <= ( obj.dimensions.height / 2 + this.dimensions.height / 2 ) * 2 ) {
			proximity = true;
			if( circlesIntersect( this.pos.x, this.pos.y, this.collisionCircleRadius, 
									obj.pos.x, obj.pos.y, obj.collisionCircleRadius )) {
				isColliding = true;	
				if( obj instanceof Asteroid || obj instanceof SubAsteroid ) {
					score += obj.SCORE_VALUE;
					game.logKill( obj.name, obj.SCORE_VALUE, score, level_no, seconds_played );
					obj.destroy( );
				}
			}
		}
	}
	this.inProximity = proximity;
	this.colliding = isColliding;
};

Ship.prototype.destroy = function( ) {
	for( var i = 0; i < getRandomArbitary( this.MIN_PARTICLES, this.MAX_PARTICLES ); i++ ) {
		particles.push( new Particle( this ));
	}

	this.destroyed = true;
	this.lives--;
	soundManager.play( this.destroySFX );
};

Ship.prototype.destroyBullet = function( index ) {
	this.bullets.splice( index, 1 );
};

Ship.prototype.checkForOutOfBounds = function( ) {
	if( this.pos.x < boundary.origin.x - this.dimensions.width ) {
		this.pos.x = ( boundary.origin.x + boundary.el.width ) + this.dimensions.width;
	}

	if( this.pos.x > ( boundary.origin.x + boundary.el.width ) + this.dimensions.width ) {
		this.pos.x = boundary.origin.x - this.dimensions.width;
	}

	if( this.pos.y < boundary.origin.y - this.dimensions.height ) {
		this.pos.y = ( boundary.origin.y + boundary.el.height ) + this.dimensions.height;
	}

	if( this.pos.y > ( boundary.origin.y + boundary.el.height ) + this.dimensions.height ) {
		this.pos.y = boundary.origin.y - this.dimensions.height;
	}
};

/*=== Movement methods ====*/

Ship.prototype.move = function( delta ) {
	this.checkForOutOfBounds( );
	this.checkForIllegalVelocities( );

	this.pos.x += this.velocity.x * delta;
	this.pos.y += this.velocity.y * delta;
};

Ship.prototype.rotate = function( direction, delta ) {
	this.rotation.dir = direction;

	if( this.rotation.radians > Math.PI ) {
		this.rotation.radians = -( Math.PI );
	}

	if( this.rotation.radians < -( Math.PI )) {
		this.rotation.radians = Math.PI;
	}

	this.acceleration.dir.x = invert( Math.cos( this.rotation.radians ));
	this.acceleration.dir.y = invert( Math.sin( this.rotation.radians ));

	this.rotation.radians += ( this.velocity.angular * this.rotation.dir ) * delta;
};

Ship.prototype.thrust = function( delta ) {
	this.engineOn( );

	if( this.acceleration.x < this.acceleration.max ) {
		this.acceleration.x += ( this.acceleration.rate * delta );
	}

	if( this.acceleration.y < this.acceleration.max ) {
		this.acceleration.y += ( this.acceleration.rate * delta );
	}

	this.velocity.x += this.acceleration.x * this.acceleration.dir.x * delta;
	this.velocity.y += this.acceleration.y * this.acceleration.dir.y * delta;

	this.velocity.x *= 0.99;
	this.velocity.y *= 0.99;
};

Ship.prototype.stopThrust = function( delta ) {
	this.engineOff( );
	this.acceleration.x = 0;
	this.acceleration.y = 0;

	this.velocity.x *= 0.99;
	this.velocity.y *= 0.99;
};

Ship.prototype.engineOn = function( ) {
	this.engineFired = true;
	soundManager.play( "SND_THRUST" );
};

Ship.prototype.engineOff = function( ) {
	this.engineFired = false;
};


Ship.prototype.checkForIllegalVelocities = function( ) {
	if( Math.abs( this.velocity.x ) >= this.velocity.max ) {
		if( this.velocity.x > 0 ) {
			this.velocity.x = this.velocity.max;
		} else {
			this.velocity.x = invert( this.velocity.max );
		}
	}

	if( Math.abs( this.velocity.y ) >= this.velocity.max ) {
		if( this.velocity.y > 0 ) {
			this.velocity.y = this.velocity.max;
		} else {
			this.velocity.y = invert( this.velocity.max );
		}
	}
};

Ship.prototype.updateBoundaries = function( size ) {
	var angle = this.rotation.radians - Math.PI,
		angleDiff = 140 * TO_RADIANS;

	this.boundaries = {
		pairA: {
			pointA: parametricEquationForCircle( this.pos, this.dimensions.height / size, angle - angleDiff ),
			pointB: parametricEquationForCircle( this.pos, this.dimensions.height / size, angle )
		},
		pairB: {
			pointA: parametricEquationForCircle( this.pos, this.dimensions.height / size, angle ),
			pointB: parametricEquationForCircle( this.pos, this.dimensions.height / size, angle + angleDiff )
		},
		pairC: {
			pointA: parametricEquationForCircle( this.pos, this.dimensions.height / ( size + 1 ), angle - angleDiff ),
			pointB: parametricEquationForCircle( this.pos, this.dimensions.height / ( size + 1 ), angle + angleDiff )
		}
	};

	if( this.engineFired && frameCount % 5 == 0 ) {
		var exhaustEndPoint = parametricEquationForCircle( this.pos, this.dimensions.height - 5, angle + Math.PI );
		this.boundaries[ "pairD" ] = {
			pointA: parametricEquationForCircle( this.pos, this.dimensions.height / ( size + 1 ), angle - ( angleDiff + ( 20 * TO_RADIANS ))),
			pointB: exhaustEndPoint
		};
		this.boundaries[ "pairE" ] = {
			pointA: exhaustEndPoint,
			pointB: parametricEquationForCircle( this.pos, this.dimensions.height / ( size + 1 ), angle + ( angleDiff + ( 20 * TO_RADIANS ))),
		};
	}
};

/*=== fire methods ===*/

Ship.prototype.fire = function( ) {
	if( this.canFire ) {
		this.bullets.push( new Bullet( this ));
		soundManager.play( "snd_shoot" );
	}
};

Ship.prototype.isAbleToFire = function( ) {
	this.canFire = true;
};

Ship.prototype.isNotAbleToFire = function( ) {
	this.canFire = false;
};

Ship.prototype.warp = function( ) {
	this.warping = true;
};

Ship.prototype.unWarp = function( ) {
	if( this.warping ) {
		this.pos.x = getRandomArbitary( boundary.origin.x - ( this.dimensions.width / 2 ), boundary.el.width + ( this.dimensions.width / 2 )),
		this.pos.y = getRandomArbitary( boundary.origin.y + ( this.dimensions.height * 2 ), boundary.el.height + ( this.dimensions.height / 2 ));
		this.warping = false;
	}
	this.timeToUnWarp = this.WARP_INTERVAL;
};

Ship.prototype.updateBullets = function( delta ) {
	for( var i = 0; i < this.bullets.length; i++ ) {
		var bullet = this.bullets[ i ],
			bulletExists = true;
		
		for( var j = 0; j < entities.length; j++ ) {
			bullet.collides( entities[ j ] );

			if( bullet.colliding ) {
				this.destroyBullet( i );
				bulletExists = false;
				break;
			}
		}

		if( ! bullet.colliding ) {
			for( var j = 0; j < crafts.length; j++ ) {
				bullet.collides( crafts[ j ] );

				if( bullet.colliding ) {
					this.destroyBullet( i );
					bulletExists = false;
					break;
				}
			}
		}

		if( bulletExists ) {
	 		if( bullet.maxDistance <= 0 ) {
				this.bullets.splice( i, 1 );
			} else {
				bullet.update( delta );
			}
		}
	}
};