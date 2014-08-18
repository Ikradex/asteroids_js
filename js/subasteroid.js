/*================================================*/
/* Asteroid Class */
/*================================================*/

/*=== constructor ===*/
function SubAsteroid( parentAsteroid, stage ) {
	this.name = "Sub_Asteroid";

	if( parentAsteroid instanceof Asteroid ) {
		this.SCORE_VALUE = 50;
		this.name += "_Large";
		this.destroySFX = "snd_destroy_med";
	} else {
		this.SCORE_VALUE = parentAsteroid.SCORE_VALUE * 2;
		this.name += "_Small";
		this.destroySFX = "snd_destroy_high";
	}

	this.PARTICLE_SPEED = parentAsteroid.PARTICLE_SPEED * 1.5;
	this.MIN_PARTICLES = Math.round( parentAsteroid.MIN_PARTICLES / 2 );
	this.MAX_PARTICLES = Math.round( parentAsteroid.MAX_PARTICLES / 2 );
	this.MAX_PARTICLE_DISTANCE = Math.round( parentAsteroid.MAX_PARTICLE_DISTANCE / 2 );

	this.SCALE = parentAsteroid.SCALE / 2;
	this.degradation_stage = stage;

	var img = new Image( ),
		that = this;
		img.onload = function( ) {
			this.ready = true;
			that.collisionCircleRadius = ( img.width / 2 ) * that.SCALE;
		};
		img.src = asteroids[ getRandomInt( 0, asteroids.length - 1 ) ];
		this.image = img;

	this.values = new Array( -1, 1 );

	this.pos = {
		x: parentAsteroid.pos.x + getRandomArbitary( -10, 10 ),
		y: parentAsteroid.pos.y + getRandomArbitary( -10, 10 )
	};
	this.velocity = {
		x: getRandomArbitary( parentAsteroid.velocity.x, parentAsteroid.velocity.x * getRandomArbitary( 0.8, 2 )),
		y: getRandomArbitary( parentAsteroid.velocity.y, parentAsteroid.velocity.y * getRandomArbitary( 0.8, 2 )),
	};
	this.acceleration = {
		dir: {
			x: this.values[ getRandomInt( 0, 1 )],
			y: this.values[ getRandomInt( 0, 1 )]
		}
	};
	/*this.velocity = {
		x: parentAsteroid.velocity.x + getRandomArbitary( -parentAsteroid.velocity.x / 2, parentAsteroid.velocity.x * 1.3 ),
		y: parentAsteroid.velocity.y + getRandomArbitary( -parentAsteroid.velocity.y / 2, parentAsteroid.velocity.y * 1.3 )
	};
	this.acceleration = {
		dir: {
			x: parentAsteroid.acceleration.dir.x,
			y: parentAsteroid.acceleration.dir.y
		}
	};*/
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

SubAsteroid.prototype.update = function( delta ) {
	this.checkForOutOfBounds( );	

	this.pos.x += ( this.velocity.x * this.acceleration.dir.x ) * delta;
	this.pos.y += ( this.velocity.y * this.acceleration.dir.y ) * delta;

	if( this.rotation.rotating ) {
		this.rotation.radians += ( 0.1 * this.rotation.dir ) * TO_RADIANS;
	}
};

SubAsteroid.prototype.render = function( ) {
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

SubAsteroid.prototype.destroy = function( ) {
	for( var i = 0; i < getRandomArbitary( 3, 15 ); i++ ) {
		particles.push( new Particle( this ));
	}

	entities.splice( entities.indexOf( this ), 1 );
	if( this.degradation_stage < 2 ) {
		this.spawnSubAsteroids( 2 );
	}
	soundManager.play( this.destroySFX );
};

SubAsteroid.prototype.spawnSubAsteroids = function( num_of_asteroids ) {
	for( var i = 0; i < num_of_asteroids; i++ ) {
		new SubAsteroid( this, 2 );
	}
};

SubAsteroid.prototype.checkForOutOfBounds = function( ) {
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