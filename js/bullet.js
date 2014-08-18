/*================================================*/
/* Bullet Class */
/*================================================*/

/*=== Constructor ===*/
function Bullet( craft ) { 
	/*=== attributes ===*/
	this.dimensions = {
		width: 3,
		height: 3
	};
	this.pos = {
		x: craft.front.x,
		y: craft.front.y
	};
	this.velocity = {
		x: craft.velocity.x,
		y: craft.velocity.y,
		dir: {
			x: invert( Math.cos( craft.rotation.radians )),
			y: invert( Math.sin( craft.rotation.radians ))
		},
		rate: {
			x: 350,
			y: 350
		}
	};
	this.rotation = {
		dir: craft.rotation.dir,
		radians: craft.rotation.radians
	};

	this.playerIsParent = craft instanceof Ship;
	this.maxDistance = craft.MAX_BULLET_DISTANCE;
	this.colliding = false;
	this.collisionCircleRadius = getBoundingCircleRadius( this.dimensions );
}

/*=== methods ===*/
Bullet.prototype.update = function( delta ) {
	this.move( delta );
};

Bullet.prototype.render = function( ) {
	ctx.save( );
	ctx.fillStyle = "#FFFFFF";
	//ctx.fillText( "(" + this.velocity.dir.x + ", " + this.velocity.dir.y + ")", this.pos.x + 20, this.pos.y - 20 );
	ctx.fillRect( this.pos.x - ( this.dimensions.width / 2 ), this.pos.y - ( this.dimensions.height / 2 ), this.dimensions.width / 2, this.dimensions.height / 2 );
	ctx.restore( );
};

Bullet.prototype.checkForOutOfBounds = function( ) {
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

Bullet.prototype.move = function( delta ) {
	this.checkForOutOfBounds( );

	var bulletDelta = {
		x: this.velocity.rate.x * this.velocity.dir.x,
		y: this.velocity.rate.y * this.velocity.dir.y
	};

	this.pos.x += bulletDelta.x * delta;
	this.pos.y += bulletDelta.y * delta;

	this.maxDistance -= (( Math.abs( this.velocity.rate.x ) + Math.abs( this.velocity.rate.y )) / 2 ) * delta;
};

Bullet.prototype.collides = function( obj ) {
	if( obj && ( ! obj.destroyed && ! obj.warping )) {
		if( circlesIntersect( this.pos.x, this.pos.y, this.collisionCircleRadius, obj.pos.x, obj.pos.y, obj.collisionCircleRadius )) {
			this.colliding = true;		
			obj.destroy( );

			if( this.playerIsParent ) {
				score += obj.SCORE_VALUE;
				game.logKill( obj.name, obj.SCORE_VALUE, score, level_no, seconds_played );
			}
		} else {
			this.colliding = false;
		}
	}
};

Bullet.prototype.checkForOutOfBounds = function( ) {
	if( this.pos.x < invert( this.dimensions.width )) {
		this.pos.x = boundary.el.width + this.dimensions.width;
	}

	if( this.pos.x > boundary.el.width + this.dimensions.width ) {
		this.pos.x = invert( this.dimensions.width );
	}

	if( this.pos.y < invert( this.dimensions.height )) {
		this.pos.y = boundary.el.height + this.dimensions.height;
	}

	if( this.pos.y > boundary.el.height + this.dimensions.height ) {
		this.pos.y = invert( this.dimensions.height );
	}
};

