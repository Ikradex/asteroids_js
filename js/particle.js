/*================================================*/
/* Particle Class */
/*================================================*/

function Particle( parent ) {
	var p_s = parent.PARTICLE_SPEED;

	this.VELOCITY_DEVIATION_FACTOR = getRandomArbitary( 1, 2 );
	this.VELOCITY = p_s + getRandomArbitary( -( p_s - 2 ), p_s * this.VELOCITY_DEVIATION_FACTOR );
	this.DISTANCE_DEVIATION = 20;
	this.SECONDS_OF_LIFE = 2;
	this.MAX_DISTANCE = ( this.VELOCITY * this.SECONDS_OF_LIFE + 
						getRandomArbitary( -this.DISTANCE_DEVIATION, this.DISTANCE_DEVIATION )) / ( this.VELOCITY_DEVIATION_FACTOR );

	this.maxDistance = this.MAX_DISTANCE;

	this.dimensions = {
		width: 2,
		height: 2
	};
	this.pos = {
		x: parent.pos.x,
		y: parent.pos.y
	};
	this.velocity = {
		x: getRandomArbitary( -this.VELOCITY, this.VELOCITY ),
		y: getRandomArbitary( -this.VELOCITY, this.VELOCITY ),
		rate: this.VELOCITY
	};
	this.acceleration = {
		dir: {
			x: getRandomArbitary( -1, 1 ),
			y: getRandomArbitary( -1, 1 )
		}
	};
	this.rotation = {
		dir: getRandomArbitary( -1, 1 ),
		radians: getRandomArbitary( -Math.PI, Math.PI ) - Math.PI
	};
}

/*=== methods ===*/
Particle.prototype.update = function( delta ) {
	this.move( delta );
};

Particle.prototype.render = function( ) {
	ctx.fillStyle = "rgba( 255, 255, 255, 0.5 )";
	ctx.fillRect( this.pos.x - ( this.dimensions.width / 2 ), this.pos.y - ( this.dimensions.height / 2 ), this.dimensions.width / 2, this.dimensions.height / 2 );
};

Particle.prototype.checkForOutOfBounds = function( ) {
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

Particle.prototype.move = function( delta ) {
	this.checkForOutOfBounds( );	

	this.pos.x += ( this.velocity.x * this.acceleration.dir.x ) * delta;
	this.pos.y += ( this.velocity.y * this.acceleration.dir.y ) * delta;

	this.maxDistance -= Math.abs( this.VELOCITY ) * delta;
};