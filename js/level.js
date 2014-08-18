/*================================================*/
/* Level Class
/*================================================*/

function Level( LEVEL_NO ) {
	/*==============================*/
	/* Game Constants & Variables
	/*==============================*/
 
 	this.BEAT_DECREMENT = 2;
	this.MIN_BEAT_INTERVAL = 250; 
	this.MAX_BEAT_INTERVAL = 1000;
	this.timeToNextBeat = this.MAX_BEAT_INTERVAL;
	this.beatInterval = this.MAX_BEAT_INTERVAL;
	this.toneCount = 0;

	this.TIME_OF_NEW_LEVEL = time_second;

	this.NEXT_LEVEL_INTERVAL = 1000;
	this.timeToNextLevel = this.NEXT_LEVEL_INTERVAL;

	this.ASTEROIDS_MIN = 4;
	this.ASTEROIDS_MAX = 12;
	this.asteroidsMaxVelFactor = 1 * (( LEVEL_NO  / 10 ) * 2 );

	this.MIN_BEGIN_SPAWNING_INTERVAL = 5000;
	this.MAX_BEGIN_SPAWNING_INTERVAL = 25000;
	this.begin_spawning_interval = getRandomArbitary( this.MIN_BEGIN_SPAWNING_INTERVAL, this.MAX_BEGIN_SPAWNING_INTERVAL );

	this.MAX_SPAWN_INTERVAL = 10000;
	this.MIN_SPAWN_INTERVAL = 500;
	this.spawn_interval = getRandomArbitary( this.MIN_SPAWN_INTERVAL, this.MAX_SPAWN_INTERVAL );

	this.over = false;

	if( ship ) {
		ship.rewarded = false;
	}	

	//particles = new Array( );
	crafts = new Array( );
	this.spawnNewAsteroids( LEVEL_NO, this.asteroidsMaxVelFactor );
}

Level.prototype.update = function( delta ) {
	if( this.timeToNextBeat > 0 ) {
		this.timeToNextBeat -= ( 1000  * delta );
	} else {
		if( this.toneCount % 2 == 0 ) {
			soundManager.play( "snd_tone_low" );
		} else {
			soundManager.play( "snd_tone_high" );
		}
		this.toneCount++;
		this.timeToNextBeat = this.beatInterval;
	}

	if( frameCount % time_second == 0 ) {
		if( this.beatInterval - this.BEAT_DECREMENT >= this.MIN_BEAT_INTERVAL ) {
			this.beatInterval -= this.BEAT_DECREMENT;
		}
	}

	for( var i = 0; i < particles.length; i++ ) {
		var particle = particles[ i ];

		if( particle.maxDistance <= 0 ) {
			particles.splice( i, 1 );
		} else {
			particle.update( delta );
		}
	}

	if( this.destroyableObjects( )) {
		for( var i = 0; i < entities.length; i++ ) {
			entities[ i ].update( delta );
		}

		for( var i = 0; i < crafts.length; i++ ) {
			crafts[ i ].update( delta );
		}

		if( this.BEGIN_SPAWNING_INTERVAL > 0 ) {
			this.BEGIN_SPAWNING_INTERVAL -= time_second;
		} else {
			if( ! crafts.length > 0 ) {
				if( this.spawn_interval > 0 ) {
					this.spawn_interval -= time_second;
				} else {
					this.spawnNewUFO( );
					this.setNewSpawnInterval( );
				}
			}
		}

		this.checkForCollisions( );
	} else {
		if( this.timeToNextLevel > 0 ) {
				this.timeToNextLevel -= ( 1000  * delta );
		} else {
			this.levelOver( );
		}
	}
};

Level.prototype.render = function( ) {
	ctx.font = "11px Monospace";
	ctx.fillStyle = '#FFFFFF';

	if( debug ) {
		ctx.fillText( "Number of Asteroids: " + entities.length, 25, 185 );
	}

	if( this.destroyableObjects( )) {
		for( var i = 0; i < entities.length; i++ ) {
			entities[ i ].render( );
		}

		for( var i = 0; i < crafts.length; i++ ) {
			crafts[ i ].render( );
		}
	}

	if( this.particlesStillRendering( )) {
		for( var i = 0; i < particles.length; i++ ) {
			particles[ i ].render( );
		}
	}
};

Level.prototype.checkForCollisions = function( ) {
	for( var i = 0; i < entities.length; i++ ) {
		if( ship ) {
			ship.collides( entities[ i ] );

			if( ship.colliding ) {
				ship.destroy( );
			}
		}

		for( var j = 0; j < crafts.length; j++ ) {
			crafts[ j ].collides( entities[ i ] );

			if( ship ) {
				if( ! ship.destroyed ) {
					ship.collides( crafts[ j ] );

					if( ship.colliding ) {
						ship.destroy( );
					}
				}
			}

			if( crafts[ j ].colliding ) {
				crafts[ j ].destroy( );
			}
		}
	};
};

Level.prototype.spawnNewUFO = function( ) {
	getRandomInt( 0, 1 ) ? new UFO( ) : new SmallUFO( );
}

Level.prototype.spawnNewAsteroids = function( LEVEL_NO, asteroidsMaxVelFactor ) {
	var numOfAsteroids = this.ASTEROIDS_MIN + LEVEL_NO <= this.ASTEROIDS_MAX 
		? this.ASTEROIDS_MIN + LEVEL_NO : this.ASTEROIDS_MAX;

	entities = new Array( );

	for( var i = 0; i < numOfAsteroids; i++ ) {
		new Asteroid( asteroidsMaxVelFactor );
	}
};

Level.prototype.setNewSpawnInterval = function( ) {
	this.spawn_interval = getRandomArbitary( this.MIN_SPAWN_INTERVAL, this.MAX_SPAWN_INTERVAL );
}

Level.prototype.levelOver = function( ) {
	this.over = true;
	this.timeToNextLevel = this.NEXT_LEVEL_INTERVAL;
};

Level.prototype.countDestroyableAsteroids = function( ) {
	return entities.length;
}

Level.prototype.destroyableObjects = function( ) {
	return entities.length > 0 || crafts.length > 0;
};

Level.prototype.particlesStillRendering = function( ) {
	return particles.length > 0;
}