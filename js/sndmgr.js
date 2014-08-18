/*================================================*/
/* Sound Manager Class */
/*================================================*/

/*=== constructor ===*/
function SoundManager( ) {
	/*=== attributes ===*/

	var dir = "res/snd/";

	this.queue = new createjs.LoadQueue( );
	this.queue.installPlugin( createjs.Sound );
	this.queue.addEventListener( "complete", this.loadComplete );
	this.queue.loadManifest([ 
		{ id : "snd_shoot", src : dir + "asteroids_shoot.wav"},
		{ id : "snd_destroy_low", src : dir + "asteroids_die_low.mp3" },
		{ id : "snd_destroy_med", src : dir + "asteroids_die_med.mp3" },
		{ id : "snd_destroy_high", src : dir + "asteroids_die_high.mp3" },
		{ id : "snd_saucer_move", src : dir + "asteroids_saucer.mp3" },
		{ id : "snd_saucer_move_high", src : dir + "asteroids_saucer_high.mp3" },
		{ id : "snd_tone_high", src : dir + "asteroids_tone_high.mp3" },
		{ id : "snd_tone_low", src : dir + "asteroids_tone_low.mp3" },
		{ id : "snd_bonus", src : dir + "asteroids_bonus_alt.mp3" }
	]);
}

/*==============================*/
/* methods
/*==============================*/

SoundManager.prototype.loadComplete = function( ) {

};

SoundManager.prototype.play = function( id ) {
	if( game.started ) {
		if( id.indexOf( "move" ) !== -1 ) {
			createjs.Sound.play( id, null, null, 0, 1 );
		} else if( id.indexOf( "bonus" ) !== -1 ) {
			createjs.Sound.play( id, null, null, 0, 5 );
		} else {
			createjs.Sound.play( id );
		}
	}
};

SoundManager.prototype.stop = function( id ) {
	createjs.Sound.removeSound( id );
};