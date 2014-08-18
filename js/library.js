/**
 * Returns a random number between min and max
 */
function getRandomArbitary( min, max ) {
    return Math.random( ) * ( max - min ) + min;
}

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt( min, max ) {
    return Math.floor( Math.random( ) * ( max - min + 1 )) + min;
}

/**
 * Returns the radius of a hit circle
 * sprite is an object with height and width properties
 */
function getBoundingCircleRadius( sprite ) {
    return Math.sqrt((( sprite.width / 2 * sprite.width / 2 )
            + ( sprite.height / 2 * sprite.height / 2 )));
 
}

/**
 * Returns boolean whether two circles intersect
 * Determines whether the distance between origins is less than the combined radii of the circles
 */
function circlesIntersect( c1X, c1Y, c1Radius, c2X, c2Y, c2Radius ){
    var distanceX = c2X - c1X;
    var distanceY = c2Y - c1Y;
 
    var magnitude = Math.sqrt( distanceX * distanceX + distanceY * distanceY );
    return magnitude < c1Radius + c2Radius;
}

function getCollisionPoint( c1, c2 ) {
	return {
		x: (( c1.x * c2.radius ) + ( c2.x * c1.radius )) / ( c1.radius + c2.radius ),
		y: (( c1.y * c2.radius ) + ( c2.y * c1.radius )) / ( c1.radius + c2.radius )
	};
}

/**
 *	Calculates the midpoint of two points
 */
function midpoint( p1, p2 ) {
	return {
		x: ( p1.x + p2.x ) / 2,
		y: ( p1.y + p2.y ) / 2
	};
}

function distanceBetween( p1, p2 ) {
	return Math.sqrt(( p2.x - p1.x ) * ( p2.x - p1.x ) + ( p2.y - p1.y ) * ( p2.y - p1.y ));
}

function angleBetween( p1, vel1, p2, vel2 ) {
	var relativePoint = {
		x: ( p2.x ) - ( p1.x ),
		y: ( p2.y ) - ( p1.y )
	};

	return Math.atan2( -relativePoint.y, -relativePoint.x );
}

/**
 * Calculates point on circumference of circle
 * Determines point based on origin point, radius and angle provided
 */
function parametricEquationForCircle( origin, radius, angle ) {
	return {
		x: origin.x + radius * Math.cos( angle ),
		y: origin.y + radius * Math.sin( angle )
	};
}

function getPostCollisionVelocities( objA, objB ) {
	return {
		x: ( objA.velocity.x * ( objA.mass - objB.mass ) + ( 2 * objB.mass * objB.velocity.x )) / ( objA.mass + objB.mass ),
		y: ( objA.velocity.y * ( objA.mass - objB.mass ) + ( 2 * objB.mass * objB.velocity.y )) / ( objA.mass + objB.mass )
	};
}

/**
 *	Returns the inversion of value
 */
function invert( value ) {
	return value * -1;
}

function isEvenFrame( ) {
	return frameCount % 2 == 0;
}