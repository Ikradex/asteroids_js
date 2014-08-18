/*================================================*/
/* Asteroid Class */
/*================================================*/

/*=== constructor ===*/
function Asteroid( levelMaxVelFactor ) {
	this.name = "Asteroid";
	this.destroySFX = "snd_destroy_low";

	this.SCALE = 1;
	this.SCORE_VALUE = 20;
	this.NO_OF_SUB_ASTEROIDS = 2;

	this.PARTICLE_SPEED = 60;
	this.MIN_PARTICLES = 10;
	this.MAX_PARTICLES = 25;

	this.MAX_VELOCITY = 45 * levelMaxVelFactor;
	this.MIN_VELOCITY = 40;

	var img = new Image( ),
		that = this;
		img.onload = function( ) {
			this.ready = true;
			that.collisionCircleRadius = ( img.width / 2 ) * that.SCALE;
		};
		img.src = asteroids[ getRandomInt( 0, asteroids.length - 1 ) ];
		this.image = img;

	// calculate velocities & positions

	var velNeg = getRandomArbitary( invert( this.MAX_VELOCITY), invert( this.MIN_VELOCITY )),
		velPos = getRandomArbitary( this.MIN_VELOCITY, this.MAX_VELOCITY ),
		newVelX = getRandomInt( 0, 1 ) ? velNeg : velPos;

	var velNeg = getRandomArbitary( invert( this.MAX_VELOCITY ), invert( this.MIN_VELOCITY )),
		velPos = getRandomArbitary( this.MAX_VELOCITY, this.MIN_VELOCITY ),
		newVelY = getRandomInt( 0, 1 ) ? velNeg : velPos;

	if( ship ) {
		// prevent spawning on ship 
		var posXNeg = getRandomArbitary( boundary.origin.x - ( this.image.width / 2 ), ship.pos.x - ( ship.dimensions.width * 2 )),	
			posXPos = getRandomArbitary( ship.pos.x + ship.dimensions.width * 2, boundary.el.width + ( this.image.width / 2 )),
			newPosX = getRandomInt( 0, 1 ) ? posXNeg : posXPos;

		var posYNeg = getRandomArbitary( boundary.origin.y - ( this.image.height / 2 ), ship.pos.y - ( ship.dimensions.width * 2 )),	
			posYPos = getRandomArbitary( ship.pos.y + ( ship.dimensions.height * 2 ), boundary.el.height + ( this.image.height / 2 )),
			newPosY = getRandomInt( 0, 1 ) ? posYNeg : posYPos;
	} else {
		var newPosX = getRandomArbitary( boundary.origin.x - ( this.image.width / 2 ), boundary.el.width + ( this.image.width / 2 )),
			newPosY = getRandomArbitary( boundary.origin.y + ( this.image.height * 2 ), boundary.el.height + ( this.image.height / 2 ));
	}

	/*=== attributes ===*/

	this.pos = {
		x: newPosX,
		y: newPosY
	};
	this.velocity = {
		x: newVelX,
		y: newVelY
	};
	this.acceleration = {
		dir: {
			x: getRandomArbitary( -1, 1 ),
			y: getRandomArbitary( -1, 1 )
		}
	};
	this.rotation = {
		rotating: false,
		dir: getRandomInt( -1, 1 ),
		radians: Math.PI / 2
	};
	this.dimensions = {
		width: this.image.width * this.SCALE,
		height: this.image.height * this.SCALE
	};

	entities.push( this );
}

/*==============================*/
/* methods
/*==============================*/

/*=== Game loop methods ===*/

Asteroid.prototype.update = function( delta ) {
	this.checkForOutOfBounds( );	
	this.pos.x += ( this.velocity.x * this.acceleration.dir.x ) * delta;
	this.pos.y += ( this.velocity.y * this.acceleration.dir.y ) * delta;

	if( this.rotation.rotating ) {
		this.rotation.radians += ( 0.1 * this.rotation.dir ) * TO_RADIANS;
	}
};

Asteroid.prototype.render = function( ) {
	ctx.save( );
	ctx.translate( this.pos.x, this.pos.y );
	ctx.rotate( this.rotation.radians - Math.PI / 2 );
	ctx.scale( this.SCALE, this.SCALE );
	ctx.drawImage( this.image, invert( this.image.width / 2 ), invert( this.image.height / 2 ));
	ctx.restore( );

	if( debug ) {
		ctx.strokeStyle = "rgba( 255, 255, 255, 0.6 )";
		ctx.beginPath( );
		ctx.arc( this.pos.x, this.pos.y, this.collisionCircleRadius, 0, 2 * Math.PI, false );
		ctx.stroke( );
	}
};

/*=== Collision methods ===*/

Asteroid.prototype.destroy = function( ) {
	for( var i = 0; i < getRandomArbitary( this.MIN_PARTICLES, this.MAX_PARTICLES ); i++ ) {
		particles.push( new Particle( this ));
	}

	entities.splice( entities.indexOf( this ), 1 );
	this.spawnSubAsteroids( 2 );
	soundManager.play( this.destroySFX );
};

Asteroid.prototype.spawnSubAsteroids = function( num_of_asteroids ) {
	for( var i = 0; i < num_of_asteroids; i++ ) {
		new SubAsteroid( this, 1 );
	}
};

Asteroid.prototype.checkForOutOfBounds = function( ) {
	if( this.pos.x < boundary.origin.x - this.image.width ) {
		this.pos.x = ( boundary.origin.x + boundary.el.width ) + this.image.width;
	}

	if( this.pos.x > ( boundary.origin.x + boundary.el.width ) + this.image.width ) {
		this.pos.x = boundary.origin.x - this.image.width;
	}

	if( this.pos.y < boundary.origin.y - this.image.height ) {
		this.pos.y = ( boundary.origin.y + boundary.el.height ) + this.image.height;
	}

	if( this.pos.y > ( boundary.origin.y + boundary.el.height ) + this.image.height ) {
		this.pos.y = boundary.origin.y - this.image.height;
	}
};