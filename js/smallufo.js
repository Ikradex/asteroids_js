/*================================================*/
/* Small SmallUFO Class */
/*================================================*/

/*=== constructor ===*/
function SmallUFO( ) {
	/*=== attributes ===*/

	this.name = "Small_UFO";
	this.destroySFX = "snd_destroy_high";
	this.moveSFX = "snd_saucer_move_high";
	this.SCORE_VALUE = 1000;
	this.MAX_COMMAND_INTERVAL = 2500;
	this.MIN_COMMAND_INTERVAL = 500;
	this.interval_to_fire = getRandomArbitary( this.MIN_COMMAND_INTERVAL, this.MAX_COMMAND_INTERVAL );
	this.interval_to_moveY = getRandomArbitary( this.MIN_COMMAND_INTERVAL, this.MAX_COMMAND_INTERVAL );

	this.MAX_MOVE_Y_LENGTH = 3000;
	this.MIN_MOVE_Y_LENGTH = 2000;
	this.moveY_length = getRandomArbitary( this.MIN_MOVE_Y_LENGTH, this.MAX_MOVE_Y_LENGTH );
	this.ORIGINAL_SCALE = 2;
	this.SCALE = 0.45;
	this.INACCURACY = 10;
	this.MAX_BULLET_DISTANCE = ( boundary.el.width / 2 ) * 0.5;

	this.PARTICLE_SPEED = 120;
	this.MIN_PARTICLES = 3;
	this.MAX_PARTICLES = 15;

	this.dimensions = {
		width: 24,
		height: 24
	};

	// calculate random positions & direction
	var newX = 0,
		dirX = 1;

	if( getRandomInt( 0, 1 )) {
		newX = boundary.origin.x - ( this.dimensions.width / 2 );
		dirX = 1;
	} else {
		newX = boundary.el.width + ( this.dimensions.width / 2 );
		dirX = -1;
	}

	this.pos = {
		x: newX,
		y: getRandomArbitary( boundary.origin.y - ( this.dimensions.height / 2 ), boundary.el.height + ( this.dimensions.height / 2 ))
	};
	this.velocity = {
		x: 100,
		y: 0,
		max: 100
	};
	this.acceleration = {
		x: 0,
		y: 0,
		rate: 350,
		dir: {
			x: dirX,
			y: 1
		},
		max: 150
	};
	this.rotation = {
		rotating: false,
		dir: 1,
		radians: Math.PI / 2
	};
	this.front = {
		x: this.pos.x,
		y: this.pos.y
	};
	this.destroyed = false;
	this.colliding = false;
	this.bullets = new Array( );

	this.setNewYVelocity( );
	this.setNewAccelerationDir( );
	this.collisionCircleRadius = getBoundingCircleRadius( this.dimensions ) * this.SCALE;
	this.updateBoundaries( this.ORIGINAL_SCALE / this.SCALE );

	crafts.push( this );

	//if( game ) soundManager.play( this.moveSFX );
}

/*==============================*/
/* methods
/*==============================*/

/* Game loop methods ===*/

SmallUFO.prototype.update = function( delta ) {
	if( ! this.destroyed ) {
		this.moveX( delta );

		if( this.interval_to_fire > 0 ) {
			this.interval_to_fire -= time_second;
		} else {
			this.fire( );
			this.setNewFireInterval( );
		}

		if( this.interval_to_moveY > 0 ) {
			this.interval_to_moveY -= time_second;
		} else {
			if( this.moveY_length > 0 ) {
				this.moveY( delta );
				this.moveY_length -= time_second;
			} else {
				this.setNewMoveYLengthInterval( );
				this.setNewIntervalToMoveY( );
				this.setNewAccelerationDir( );
				this.setNewYVelocity( );
			}
		}
		this.updateBoundaries( this.ORIGINAL_SCALE / this.SCALE );
	} else {
		if( ! this.bulletsStillExist( )) {
			crafts.splice( crafts.indexOf( this ), 1 );
		}
	}
	this.updateBullets( delta );
};

SmallUFO.prototype.render = function( ) {
	if( ! this.destroyed ) {
		ctx.fillStyle = "#FFFFFF";
		ctx.strokeStyle = "rgb( 255, 255, 255 )";

		// draws SmallUFO lines/boundaries
		for( var pairs in this.boundaries ) {
			var points = this.boundaries[ pairs ];

			ctx.beginPath( );
			ctx.moveTo( points.pointA.x, points.pointA.y );
			ctx.lineTo( points.pointB.x, points.pointB.y );
			ctx.stroke( );
		}
	}

	if( this.bullets.length > 0 ) {
		for( var i = 0; i < this.bullets.length; i++ ) {
			this.bullets[ i ].render( );
		}
	}

	if( debug ) {
		ctx.beginPath( );
		ctx.arc( this.pos.x, this.pos.y, this.collisionCircleRadius, 0, 2 * Math.PI, false );
		ctx.stroke( );
	}
};

SmallUFO.prototype.moveX = function( delta ) {
	this.checkForOutOfBounds( );

	this.pos.x += ( this.velocity.x * this.acceleration.dir.x ) * delta;
	this.front.x = this.pos.x;
};

SmallUFO.prototype.moveY = function( delta ) {
	this.checkForOutOfBounds( );
	this.pos.y += ( this.velocity.y * this.acceleration.dir.y ) * delta;
	this.front.y = this.pos.y;
};

SmallUFO.prototype.setNewMoveYLengthInterval = function( ) {
	this.moveY_length = getRandomArbitary( this.MIN_MOVE_Y_LENGTH, this.MAX_MOVE_Y_LENGTH );
};

SmallUFO.prototype.setNewIntervalToMoveY = function( ) {
	this.interval_to_moveY = getRandomArbitary( this.MIN_COMMAND_INTERVAL, this.MAX_COMMAND_INTERVAL );
};

SmallUFO.prototype.setNewAccelerationDir = function( ) {
	this.acceleration.dir.y = getRandomInt( -1, 1 );
};

SmallUFO.prototype.setNewYVelocity = function( ) {
	this.velocity.y = getRandomArbitary( 0, this.velocity.max );
};

SmallUFO.prototype.collides = function( obj ) {
	var isColliding = false;

	if( obj ) {
		if( ! this.destroyed ) {
			//if( distanceBetween( this.pos, obj.pos ) <= ( obj.dimensions.height / 2 + this.dimensions.height / 2 ) * 2 ) {
				if( circlesIntersect( this.pos.x, this.pos.y, this.collisionCircleRadius, 
										obj.pos.x, obj.pos.y, obj.collisionCircleRadius )) {
					isColliding = true;
					obj.destroy( );
				}
			//}
		}
	}
	this.colliding = isColliding;
};

SmallUFO.prototype.destroy = function( ) {
	for( var i = 0; i < getRandomArbitary( 3, 15 ); i++ ) {
		particles.push( new Particle( this ));
	}

	this.destroyed = true;
	crafts.splice( crafts.indexOf( this ), 1 );
	soundManager.play( this.destroySFX );
};

SmallUFO.prototype.fire = function( ) {
	var ang, newAng;

	if( ! ship || ship.destroyed ) {
		ang = getRandomArbitary( 0, 180 );
		newAng = getRandomInt( 0, 1 ) ? ang *= invert( TO_RADIANS ) : ang *= TO_RADIANS;
	} else {
		var inaccuracy = getRandomArbitary( -this.INACCURACY, this.INACCURACY ) * TO_RADIANS;
		newAng = angleBetween( this.pos, this.velocity, ship.pos, ship.velocity ) + inaccuracy;
	}
	this.rotation.radians = newAng;

	this.bullets.push( new Bullet( this ));
	soundManager.play( "snd_shoot" );
};

SmallUFO.prototype.setNewFireInterval = function( ) {
	this.interval_to_fire = getRandomArbitary( this.MIN_COMMAND_INTERVAL, this.MAX_COMMAND_INTERVAL );
};

SmallUFO.prototype.updateBullets = function( delta ) {
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
			bullet.collides( ship );
			if( bullet.colliding ) {
				this.destroyBullet( i );
				bulletExists = false;
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

SmallUFO.prototype.destroyBullet = function( index ) {
	this.bullets.splice( index, 1 );
};

SmallUFO.prototype.checkForOutOfBounds = function( ) {
	if( this.pos.x < boundary.origin.x - this.dimensions.width ) {
		this.destroyed = true;
		crafts.splice( crafts.indexOf( this ), 1 );
		soundManager.stop( this.moveSFX );
	}

	if( this.pos.x > ( boundary.origin.x + boundary.el.width ) + this.dimensions.width ) {
		this.destroyed = true;
		crafts.splice( crafts.indexOf( this ), 1 );
		soundManager.stop( this.moveSFX );
	}

	if( this.pos.y < boundary.origin.y - this.dimensions.height ) {
		this.pos.y = ( boundary.origin.y + boundary.el.height ) + this.dimensions.height;
	}

	if( this.pos.y > ( boundary.origin.y + boundary.el.height ) + this.dimensions.height ) {
		this.pos.y = boundary.origin.y - this.dimensions.height;
	}
};

SmallUFO.prototype.bulletsStillExist = function( ) {
	return this.bullets.length > 0;
};

SmallUFO.prototype.updateBoundaries = function( size ) {
	var angle = ( Math.PI / 2 ) - Math.PI,
		angleInner = 130 * TO_RADIANS,
		angleOuter = 25 * TO_RADIANS,
		sizeOuter = size / 1.2,
		sizeInner = size / 1.5;

	var pt_A = {
		pointA: parametricEquationForCircle( this.pos, this.dimensions.height / size, angle - angleInner ),
		pointB: parametricEquationForCircle( this.pos, this.dimensions.height / size, angle + angleInner )
	},
		pt_B = {
		pointA: parametricEquationForCircle( this.pos, this.dimensions.height / size, invert( angle - angleInner )),
		pointB: parametricEquationForCircle( this.pos, this.dimensions.height / size, invert( angle + angleInner ))
	},
		pt_C = {
		pointA: parametricEquationForCircle( this.pos, this.dimensions.height / sizeOuter, angle - angleOuter ),
		pointB: parametricEquationForCircle( this.pos, this.dimensions.height / sizeOuter, angle + angleOuter )
	},
		pt_D = {
		pointA: parametricEquationForCircle( this.pos, this.dimensions.height / sizeInner, invert( Math.PI )),
		pointB: parametricEquationForCircle( this.pos, this.dimensions.height / sizeInner, Math.PI * 2 )
	};

	var pt_E = {
		pointA: pt_A.pointA,
		pointB: pt_D.pointA
	},
	pt_F = {
		pointA: pt_B.pointA,
		pointB: pt_D.pointA
	},
	pt_G = {
		pointA: pt_B.pointA,
		pointB: pt_C.pointA
	},
	pt_H = {
		pointA: pt_C.pointB,
		pointB: pt_B.pointB
	},
	pt_I = {
		pointA: pt_B.pointB,
		pointB: pt_D.pointB
	},
	pt_J = {
		pointA: pt_D.pointB,
		pointB: pt_A.pointB
	};

	this.boundaries = {
		pairA: pt_A,
		pairB: pt_B, 
		pairC: pt_C,
		pairD: pt_D,
		pairE: pt_E,
		pairF: pt_F,
		pairG: pt_G,
		pairH: pt_H,
		pairI: pt_I,
		pairJ: pt_J
	};
}