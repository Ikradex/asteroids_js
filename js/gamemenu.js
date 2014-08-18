/*================================================*/
/* Game Menu Class */
/*================================================*/

/*=== constructor ===*/
function GameMenu( game ) {
	/*=== attributes ===*/

	game.started = false;
	this.FONT_SIZE = 48;
	this.FONT_SIZE_MED = 16;
	this.FONT_SIZE_SMALL = 8;
	this.highScoreMenu = new HighScoreMenu( this );
	this.showHighScores = false;
	this.buttons = new Array( );
	this.gameTitle = "ASTEROID";
	this.gameSecTitle = "made in";
	this.versionText = "version: " + version;

	var logo = new Image( );
		logo.src = "res/img/html5logo.png";
		this.html5logo = logo;

	this.level = new Level( 0 );

	var that = this;

	new MenuButton( this.buttons, "Play Game", boundary.el.width / 2, 250, function( ) {	
		if( ! game.started ) {
			game.start( );
		}
	});

	new MenuButton( this.buttons, "High scores", boundary.el.width / 2, 300, function( ) {	
		that.showHighScoreMenu( );
	});
}

/*==============================*/
/* methods
/*==============================*/

GameMenu.prototype.update = function( delta ) {
	if( ! this.showHighScores ) {
		var hovering = false;

		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[ i ].update( delta );

			if( this.buttons[ i ].mouseOver ) {
				hovering = true;
			}
		}

		if( hovering ) {
			canvas.style.cursor = "pointer";
		} else {
			canvas.style.cursor = "default";
		}
	} else {
		this.highScoreMenu.update( delta );
	}

	this.level.update( delta );
};

GameMenu.prototype.render = function( ) {
	ctx.filStyle = "#FFFFFF"; 

	if( this.showHighScores ) {
		this.highScoreMenu.render( );
	} else {
		ctx.font = this.FONT_SIZE + "px AtariChunky";
		ctx.fillText( this.gameTitle, boundary.el.width / 2 - ( this.gameTitle.length * ( this.FONT_SIZE / 2 )), 100 );

		//ctx.font = this.FONT_SIZE_MED + "px AtariChunky";
		//ctx.fillText( this.gameSecTitle, boundary.el.width / 2 - ( this.gameSecTitle.length * ( this.FONT_SIZE_MED / 2 )), 140 );
		ctx.drawImage( this.html5logo, boundary.el.width / 2 + ( this.gameTitle.length * ( this.FONT_SIZE / 2 )), 60 );

		ctx.font = this.FONT_SIZE_SMALL + "px AtariChunky";
		ctx.fillText( this.versionText, boundary.el.width / 2 - ( this.versionText.length * ( this.FONT_SIZE_SMALL / 2 )), boundary.el.height - 50 );

		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[ i ].render( );
		}
	}

	this.level.render( );
};

GameMenu.prototype.showHighScoreMenu = function( ) {
	this.showHighScores = true;
};

GameMenu.prototype.hideHighScoreMenu = function( ) {
	this.showHighScores = false;
};

/*================================================*/
/* High Score Menu Class */
/*================================================*/

/*=== constructor ===*/
function HighScoreMenu( gameMenu ) {
	this.buttons = new Array( );
	this.title = "High Scores";
	this.highscores = {};
	this.FONT_SIZE = 32;
	this.FONT_SIZE_SMALL = 14;
	this.MAX_RESULTS = 12;

	var that = this; 

	/*var xhReq = new XMLHttpRequest( );
		xhReq.open( "GET", "score_board.php?max_results=" + this.MAX_RESULTS, true );
		xhReq.send( null );

	xhReq.onreadystatechange = function( ) {
		if( xhReq.readyState == 4 ) {
			if( xhReq.status == 200 ) {
				that.highscores = JSON.parse( xhReq.responseText );
			}
		}
	}*/

	new MenuButton( this.buttons, "Main Menu", boundary.el.width / 2, boundary.el.height - 60 , function( ) {	
		gameMenu.hideHighScoreMenu( );
	});
}

/*==============================*/
/* methods
/*==============================*/

HighScoreMenu.prototype.update = function( delta ) {
	var hovering = false;

	for( var i = 0; i < this.buttons.length; i++ ) {
		this.buttons[ i ].update( delta );

		if( this.buttons[ i ].mouseOver ) {
			hovering = true;
		}
	}

	if( hovering ) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "default";
	}
};

HighScoreMenu.prototype.render = function( ) {
	ctx.font = this.FONT_SIZE + "px AtariChunky";
	ctx.fillStyle = "rgba( 255, 255, 255, 1 )";
	ctx.fillText( this.title, boundary.el.width / 2 - ( this.title.length * ( this.FONT_SIZE / 2 )), 100 );

	for( var i = 0; i < this.buttons.length; i++ ) {
		this.buttons[ i ].render( );
	}

	var scoreListY = 150;
	ctx.font = this.FONT_SIZE_SMALL + "px AtariChunky";

	for( var key in this.highscores ) {
		if( key < this.MAX_RESULTS ) {
			var obj = this.highscores[ key ];
			var scoreInfo = new Array( );

			for( var prop in obj ) {
				if( obj.hasOwnProperty( prop )) {
					scoreInfo.push( obj[ prop ] );
				}
			}

			var text = "";
			var totalLengthOfSeperator = 20;

			for( var i = 0; i < scoreInfo.length; i++ ) {
				var score = scoreInfo[ 1 ];
				var seperator = "";
				var len = totalLengthOfSeperator - score.length;

				for( var j = 0; j < len; j++ ) {
					seperator += '.';
				}
			}

			text += scoreInfo[ 0 ] + seperator + scoreInfo[ 1 ];
			ctx.fillText( text, boundary.el.width / 2 - ( text.length * ( this.FONT_SIZE_SMALL / 2 )), scoreListY );
			scoreListY += 20;
		}
	}
};

/*================================================*/
/* Game Over Menu Class */
/*================================================*/

/*=== constructor ===*/
function GameOverMenu( game ) {
	this.buttons = new Array( );
	this.gameOverText = "GAME OVER";
	this.highScoreText = "SCORE: " + score;
	this.FONT_SIZE = 32;
	this.FONT_SIZE_MED = 24;
	this.alphabet = new Array( "a", "b", "c", "d", "e", "f", "g",
		"h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
		"u", "v", "w", "x", "y", "z" );
	this.highScoreUserName = new Array( 0, 0, 0 );
	this.selectedIndex = 0;
	this.keyHeld = false;

	new MenuButton( this.buttons, "Main Menu", boundary.el.width / 2, 350, function( ) {
		game.stop( );
	});

	var that = this;

	if( score > 0 ) {
		new MenuButton( this.buttons, "Submit", boundary.el.width / 2, 300, function( ) {
			var username = "";

			for( var i = 0; i < that.highScoreUserName.length; i++ ) {
				username += that.alphabet[ that.highScoreUserName[ i ]].toUpperCase( );
			}

			game.submitHighScore( score, username );
		});
	}
}

/*==============================*/
/* methods
/*==============================*/

GameOverMenu.prototype.update = function( delta ) {
	if( score > 0 && ! this.keyHeld ) {
		if( 38 in keysDown || 87 in keysDown ) {
			if( this.highScoreUserName[ this.selectedIndex ] + 1 < this.alphabet.length ) {
				this.highScoreUserName[ this.selectedIndex ]++;
			} else {
				this.highScoreUserName[ this.selectedIndex ] = 0;
			}
		}

		if( 83 in keysDown || 40 in keysDown ) {
			if( this.highScoreUserName[ this.selectedIndex ] - 1 > 0 ) {
				this.highScoreUserName[ this.selectedIndex ]--;
			} else {
				this.highScoreUserName[ this.selectedIndex ] = this.alphabet.length - 1;
			}
		}

		if( 65 in keysDown || 37 in keysDown ) {
			if( this.selectedIndex - 1 > -1 ) {
				this.selectedIndex--;
			} else {
				this.selectedIndex = this.highScoreUserName.length - 1;
			}
		}

		if( 68 in keysDown || 39 in keysDown ) {
			if( this.selectedIndex + 1 < this.highScoreUserName.length ) {
				this.selectedIndex++;
			} else {
				this.selectedIndex = 0;
			}
		}
 	}

 	if( ! ( 38 in keysDown || 87 in keysDown || 
		  	83 in keysDown || 40 in keysDown || 
		  	65 in keysDown || 68 in keysDown ||
		  	37 in keysDown || 39 in keysDown )) {
		this.keyHeld = false;
	} else {
		this.keyHeld = true;
	}

	var hovering = false;

	for( var i = 0; i < this.buttons.length; i++ ) {
		this.buttons[ i ].update( delta );

		if( this.buttons[ i ].mouseOver ) {
			hovering = true;
		}
	}

	if( hovering ) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "default";
	}
};

GameOverMenu.prototype.render = function( ) {
	ctx.font = this.FONT_SIZE + "px AtariChunky";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText( this.gameOverText, boundary.el.width / 2 - ( this.gameOverText.length * ( this.FONT_SIZE / 2 )), 100 );
	ctx.font = this.FONT_SIZE_MED + "px AtariChunky";
	ctx.fillText( this.highScoreText, boundary.el.width / 2 - ( this.highScoreText.length * ( this.FONT_SIZE_MED / 2 )), 175 );

	if( score > 0 ) {
		var userNameX = boundary.el.width / 2 - ( this.highScoreUserName.length * ( this.FONT_SIZE_MED + 4 ) / 2 );

		for( var i = 0; i < this.highScoreUserName.length; i++ ) {
			ctx.fillText( this.alphabet[ this.highScoreUserName[ i ]].toUpperCase( ), userNameX, 250 );

			if( i == this.selectedIndex ) {
				ctx.beginPath( );
				ctx.moveTo( userNameX, 252 );
				ctx.lineTo( userNameX + this.FONT_SIZE_MED, 252 );
				ctx.stroke( );
			}

			userNameX += this.FONT_SIZE_MED + 4;
		}
	}

	for( var i = 0; i < this.buttons.length; i++ ) {
		this.buttons[ i ].render( );
	}
};

/*================================================*/
/* Pause Menu Class */
/*================================================*/

/*=== constructor ===*/
function PauseMenu( game ) {
	this.buttons = new Array( );
	this.pauseTitle = "PAUSED";
	this.FONT_SIZE = 48;
	this.FONT_SIZE_SMALL = 16;
	game.paused = true;

	new MenuButton( this.buttons, "Continue", boundary.el.width / 2, boundary.el.height / 2 - 50, function( ) {	
		game.unpause( );
	});

	new MenuButton( this.buttons, "Main Menu", boundary.el.width / 2, boundary.el.height / 2, function( ) {	
		game.stop( );
	});
}

/*==============================*/
/* methods
/*==============================*/

PauseMenu.prototype.update = function( delta ) {
	var hovering = false;

	for( var i = 0; i < this.buttons.length; i++ ) {
		this.buttons[ i ].update( delta );

		if( this.buttons[ i ].mouseOver ) {
			hovering = true;
		}
	}

	if( hovering ) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "default";
	}
};

PauseMenu.prototype.render = function( ) {
	ctx.font = this.FONT_SIZE + "px AtariChunky";
	ctx.fillStyle = "rgba( 255, 255, 255, 1 )";
	ctx.fillText( this.pauseTitle, boundary.el.width / 2 - ( this.pauseTitle.length * ( this.FONT_SIZE / 2 )), 100 );

	for( var i = 0; i < this.buttons.length; i++ ) {
		this.buttons[ i ].render( );
	}
};

/*================================================*/
/* Menu Button Class */
/*================================================*/

function MenuButton( buttons, btnText, btnX, btnY, clickFunction ) {
	this.text = btnText;
	this.FONT_SIZE = 20;
	this.PADDING = 12;
	this.mouseOver = false;
	this.pos = {
		x: btnX,
		y: btnY
	};
	this.dimensions = {
		width: this.text.length * ( this.FONT_SIZE ) + this.PADDING,
		height: this.FONT_SIZE + this.PADDING
	};
	this.eventHandler = clickFunction;
	buttons.push( this );

	var that = this;

	canvas.addEventListener( "mouseup", function clickHandler( e ) {
		e.preventDefault( );

		if( that.mouseOver ) {
			that.executeEventHandler( );
		}
	}, false );
};

MenuButton.prototype.update = function( delta ) {
	if( this.mouseHover( )) {
		this.mouseOver = true;
	} else { 
		this.mouseOver = false;
	}
};

MenuButton.prototype.render = function( ) {
	ctx.font = this.FONT_SIZE + "px AtariChunky";
	ctx.fillText( this.text, this.pos.x - ( this.dimensions.width / 2 ), this.pos.y + this.dimensions.height );
};

MenuButton.prototype.mouseHover = function( ) {
	return (( mouseX >= ( this.pos.x - ( this.dimensions.width / 2 )) && mouseX <= ( this.pos.x - ( this.dimensions.width / 2 )) + this.dimensions.width ) && 
			( mouseY >= this.pos.y && mouseY <= this.pos.y + this.dimensions.height )); 
};

MenuButton.prototype.executeEventHandler = function( ) {
	this.eventHandler.call( );
};