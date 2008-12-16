dojo.provide("desktop.apps.MineSweep");

dojo.declare("desktop.apps.MineSweep", desktop.apps._App, {
	// TO DO:
	// * When revealing a numbered tile, all adjacent *clear* tiles should be revealed, which in turn reveal all other adjacent numbered tiles
	// * When all tiles containing mines have been revealed, the player should see a 'you win' message
	
	difficulty: "Easy",		// current difficulty setting
	board: 0,			// 2d array, holds all squares
	xSize: 0,			// horiz size of board
	ySize: 0,			// vert size of board
	squaresRevealed: 0,		// num of squares revealed by player
	totalSquares: 0,		// total num of squares
	squaresToWin: 0,		// num of squares to reveal to win
	resultShade: 0,			// 'shade' (alpha'ed rect) used to dim playing field when displaying result message
	resultMessage: 0,		// text shape object, 'You Win!' or 'You Lose!'
	
	init: function(args)
	{
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.form.Button");
		dojo.require("dijit.form.FilteringSelect");
		dojo.require("dojo.data.ItemFileReadStore");
		dojo.require("dojox.gfx");
		dojo.requireLocalization("desktop", "games");
		dojo.requireLocalization("desktop", "apps");
		var nls = dojo.i18n.getLocalization("desktop", "games");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.win = new desktop.widget.Window({
			title: app["MineSweep"],
			width: "200px",
			height: "230px",
			iconClass: this.iconClass,
			resizable: false,
            showMaximize: false,
			onClose: dojo.hitch(this, this.kill)
		});
	
		this.toolbar = new dijit.Toolbar({
			region: "top"
		});
		this.toolbar.addChild( new dijit.form.Button({
			label: nls.start,
			onClick: dojo.hitch(this, "startGame")
		}) );
		this.win.addChild( this.toolbar );
		
		var dropdown = new dijit.form.FilteringSelect({
			autoComplete: true,
			searchAttr: "label",
			style: "width: 90px; font-size: small",
			store: new dojo.data.ItemFileReadStore({
				data: {
					identifier: "value",
					items: [
						{ label: nls.easy, value: "Easy" },
						{ label: nls.medium, value: "Medium" },
						{ label: nls.hard, value: "Hard" }
					]
				}
			}),
			onChange: dojo.hitch( this, function(val){
				if ( typeof val == "undefined" ) return;
				this.difficulty = val;
				//console.debug( "Difficulty is now " + this.difficulty );
			})
		});
		this.toolbar.addChild( dropdown );
	
		this.surfacePane = new dijit.layout.ContentPane({
			region: "center",
			style: "overflow: hidden"
		});
	
		this.surface = dojox.gfx.createSurface(this.surfacePane.containerNode, 600, 600);
	
		this.win.addChild( this.surfacePane );
	
		this.win.show();
		this.win.startup();
		
		dropdown.textbox.disabled = true;
		dropdown.setValue("Easy");
	
		dojo.connect(this.surfacePane.containerNode, "oncontextmenu", dojo, "stopEvent");
		
        this.makeBoard(10, 10);
        setTimeout(dojo.hitch(this, function(){
            var tHeight = this.toolbar.domNode.offsetHeight;
            this.win.resize({width: "200px", height: (200+tHeight)+"px"});
        }), 200);
	},

	startGame: function()
	{
		//console.debug( "Starting game.. difficulty is: " + this.difficulty );
		var tHeight = this.toolbar.domNode.offsetHeight;
		if ( this.difficulty == "Easy" ){
			//console.debug("resizing..");
			this.win.resize({width: "200px", height: (200+tHeight)+"px"});
			this.surface.clear();
			this.makeBoard(10, 10);
		} else if ( this.difficulty == "Medium" ){
			this.win.resize({width:"300px", height:(300+tHeight)+"px"});
			this.surface.clear();
			this.makeBoard(15, 15);
		} else if ( this.difficulty == "Hard" ){
			this.win.resize({width:"600px", height:(300+tHeight)+"px"});
			this.surface.clear();
			this.makeBoard(30,15);
		}
	},

	makeBoard: function( xSize, ySize )
	{
		this.xSize = xSize;
		this.ySize = ySize;
		this.squaresRevealed = 0;
		this.totalSquares = 0;
		this.squaresToWin = 0;		
		var a = 0;
		var b = 0;
		this.board = new Array();
		for ( b = 0; b < xSize; b++ ){
			this.board[b] = new Array();
			for ( a = 0; a < ySize; a++ ){
				this.board[b][a] = this.makeSquare(b, a);
				this.totalSquares++;
			}
		}
		this.squaresToWin = this.totalSquares;
		this.makeMines();
		this.assignNums();
		console.debug( "Total: " + this.totalSquares + ", To win: " + this.squaresToWin );
	},

	makeMines: function()
	{
		// Create as many mines as we have squares on the board on the x axis
		var a = 0;
		var numMines = 0;
		if ( this.difficulty == "Easy" ) numMines = 10;
		if ( this.difficulty == "Medium" ) numMines = 34;
		if ( this.difficulty == "Hard" ) numMines = 90;
		for ( a = 0; a < numMines; a++ ){
			var randX = Math.floor(Math.random() * this.xSize);
			var randY = Math.floor(Math.random() * this.ySize);
			this.board[randX][randY].hasMine = true;
			this.board[randX][randY].numMines = 0;
			this.squaresToWin--;
		}
	},

	assignNums: function()
	{
		var a = 0;
		var b = 0;
		var numMines = 0;
		for ( b = 0; b < this.xSize; b++ ){
			for ( a = 0; a < this.ySize; a++ ){
				numMines = 0;
	
				// Square to the north
				if ( a > 0){
					if ( this.board[b][a-1].hasMine == true ) numMines++;
				}
	
				// Square to the north east
				if ( a > 0 && b < (this.xSize-1) ){
					if ( this.board[b+1][a-1].hasMine == true ) numMines++;
				}
	
				// Square to east
				if ( b < (this.xSize-1) ){
					if ( this.board[b+1][a].hasMine == true ) numMines++;
				}

				
				// Square to south east
				if ( a < (this.ySize-1) && b < (this.xSize-1) ){
					if ( this.board[b+1][a+1].hasMine == true ) numMines++;
				}
                            
				// Square to south
				if ( a < (this.ySize-1) ){
					if ( this.board[b][a+1].hasMine == true ) numMines++;
				}
                            
				// Square to south west
				if ( b > 0 && a < (this.ySize-1) ){
					if ( this.board[b-1][a+1].hasMine == true ) numMines++;
				}
                            
				// Square to west
				if ( b > 0 ){
					if ( this.board[b-1][a].hasMine == true ) numMines++;
				}
                            
				// Square to north west
				if ( b > 0 && a > 0 ){
					if ( this.board[b-1][a-1].hasMine == true ) numMines++;
				}
				this.board[b][a].numMines = numMines;
			}                    
		}	
	},

	makeSquare: function(xPos, yPos)
	{

		var square = this.surface.createRect({ x: xPos*20, y: yPos*20, width: 20, height: 20 });
		this.squareFillNormal( square );
		square.mouseover = square.connect("onmouseover", this, function blah(){ this.squareFillOver(square); });
		square.mouseout = square.connect("onmouseout", this, function blah2(){ this.squareFillNormal(square); });
		square.mousedown = square.connect("onmouseup", this, function (e){
			dojo.stopEvent(e);
			if(e.button == 2) this.squareFillMarked(square);
			else this.squareReveal(square);
			//this.squareReveal(square);
			return false;
		});
		square.mouseright = square.connect("oncontextmenu", this, function (e){ 
			dojo.stopEvent(e);
			//this.squareFillMarked(square);
		});
              
		// Square is not yet revealed by default
		square.revealed = false;
              
		// Set a default numMines (number of mines surrounding square)
		square.numMines = 0;
              
		// Square does not have a mine by default
		square.hasMine = false;
              
		// Square is unmarked by default
		square.marked = false;
              
		// Assign the board position to the square
		square.xPos = xPos;
		square.yPos = yPos;
              
		return square;
	},

	gameOver: function()
	{
		this.resultShade = this.surface.createRect({
			x: 0, y:0,
			width: (this.xSize*20), height: (this.ySize*20)
		}).setFill([ 225,225,225,0.75 ]);
		
		var nls = dojo.i18n.getLocalization("desktop", "games");
		this.resultMessage = this.surface.createText({
			x: ((this.xSize * 20)/2), y: ((this.ySize * 20)/2),
			text: nls.youLose,
			align: "middle"
		}).setFill("#000000");
		this.resultMessage.setFont({
			weight: "bold",
			size: 20
		})
	},

	gameWin: function()
	{
		this.resultShade = this.surface.createRect({
			x: 0, y:0,
			width: (this.xSize*20), height: (this.ySize*20)
		}).setFill([ 225,225,225,0.75 ]);

		var nls = dojo.i18n.getLocalization("desktop", "games");
		this.resultMessage = this.surface.createText({
			x: ((this.xSize * 20)/2), y: ((this.ySize * 20)/2),
			text: nls.youWin,
			align: "middle"
		}).setFill("#000000");
		this.resultMessage.setFont({
			weight: "bold",
			size: 20
		})		
	},

	squareReveal: function( square )
	{
		if ( square.revealed == true ) return;	
              
		// disconnect this squares events
		dojo.disconnect( square.mousedown );
		dojo.disconnect( square.mouseover );
		dojo.disconnect( square.mouseout );
		dojo.disconnect( square.mouseright );
              
		// mark it as revealed
		square.revealed = true;
              
		// fetch the squares bounding box
		var bbox = square.getBoundingBox();
              
		// does this square contain a mine?
		if ( square.hasMine == true ){
			square.setFill("#FF0000");
			square.mine = this.surface.createCircle({
				cx: (bbox.x + (bbox.width/2)), cy: (bbox.y + (bbox.height/2)),
				r: (bbox.width/2)
			});
			square.mine.setFill({
				type: "radial",
				cx: ((bbox.x + (bbox.width/2)) - 5),
				cy: ((bbox.y + (bbox.height/2)) - 5),
				colors:[
					{ offset: 0, color: "#FFFFFF"},
					{ offset: 0.1, color: "#222222"}
				]
			});
			this.gameOver();
			return;
		}
              
		square.setFill("#EFEFEF");
              
		this.squaresRevealed++;
		//console.debug( this.squaresRevealed + " squares revealed.. " + this.squaresToWin + " needed to win" );
		if ( this.squaresRevealed >= this.squaresToWin ){
			this.gameWin();
			return;
		}
              
		if ( square.numMines > 0 ){
			var textColor = "#000000";
			if ( square.numMines == 1 ) textColor = "#0000FF";
			if ( square.numMines == 2 ) textColor = "#00AA00";
			if ( square.numMines >= 3 ) textColor = "#FF0000";
			square.numText = this.surface.createText({
				x: (bbox.x + (bbox.width/2) - 5), y: (bbox.y + (bbox.height - 5)),
				text: " "+(square.numMines)+" ",
				align: "left",
				color: "#000000"
			}).setFill(textColor);
			square.numText.setFont({
				weight: "bold"
			});
			square.numText.moveToFront();
		}else{
			this.clearAdjacentSquares( square.xPos, square.yPos );
		}
              
		//this.surface.remove(square);
	},

	clearAdjacentSquares: function(xPos, yPos)
	{
		// When the player reveals a clear square, we should reveal all adjacent clear squares
		// (as well as as all adjacen clear squares to those clear squares)
		// (( as well as.. well.. you get it.. its recursive! ))
              
		// Not sure if i should do this diagonally as well..
              
		// Check square to the north
		if ( yPos > 0 ){
			if ( !this.board[xPos][yPos-1].hasMine  && !this.board[xPos][yPos-1].revealed) this.squareReveal( this.board[xPos][yPos-1] );
		}
              
		// Check square to the east
		if ( xPos < (this.xSize-1) ){
			if ( !this.board[xPos+1][yPos].hasMine && !this.board[xPos+1][yPos].revealed) this.squareReveal( this.board[xPos+1][yPos] );
		}
              
		// Check square to south
		if ( yPos < (this.ySize-1) ){
			if ( !this.board[xPos][yPos+1].hasMine && this.board[xPos][yPos+1].revealed) this.squareReveal( this.board[xPos][yPos+1] );
		}
              
		// Check square to west
		if ( xPos > 0 ){
			if ( !this.board[xPos-1][yPos].hasMine && !this.board[xPos-1][yPos].revealed) this.squareReveal( this.board[xPos-1][yPos] );
		}
              
		// check square to northeast
		if ( yPos > 0 && xPos < (this.xSize-1) ){
			if ( !this.board[xPos+1][yPos-1].hasMine && !this.board[xPos+1][yPos-1].revealed) this.squareReveal( this.board[xPos+1][yPos-1] );
		}
              
		// check square to southeast
		if ( yPos < (this.ySize-1) && xPos < (this.xSize-1) ){
			if ( !this.board[xPos+1][yPos+1].hasMine && !this.board[xPos+1][yPos+1].revealed) this.squareReveal( this.board[xPos+1][yPos+1] );
		}
              
		// check square to southwest
		if ( yPos < (this.ySize-1) && xPos > 0 ){
			if ( !this.board[xPos-1][yPos+1].hasMine && !this.board[xPos-1][yPos+1].revealed) this.squareReveal( this.board[xPos-1][yPos+1] );
		}
              
		// check square to northwest
		if ( yPos > 0 && xPos > 0 ){
			if ( !this.board[xPos-1][yPos-1].hasMine && !this.board[xPos-1][yPos-1].revealed) this.squareReveal( this.board[xPos-1][yPos-1] );
		}    
	},

	squareFillMarked: function( square )
	{
		if ( square.marked == false ){
			square.marked = true;
			//dojo.disconnect( square.mouseover );
			var bbox = square.getBoundingBox();
			square.setFill({
				type: "linear",
				x1: bbox.x, y1: bbox.y,
				x2: bbox.x+bbox.width, y2: bbox.y+bbox.height,
				colors: [
					{ offset: 0, color: "#8F8F8F"},
					{ offset: 1, color: "#444444"}
				]
			});
		}else{
			square.marked = false;
			this.squareFillNormal( square );
		}
	},

	squareFillNormal: function( square )
	{
		if ( square.marked == true ) return;
		var bbox = square.getBoundingBox();
		square.setStroke({
			width: "0.25px",
			color: "#000000"
		});
		square.setFill({
			type: "linear",
			x1: bbox.x, y1: bbox.y,
			x2: bbox.x+bbox.width, y2: bbox.y+bbox.height,
			colors: [
				{ offset: 0.1, color: "#CFCFCF"},
				{ offset: 0.9, color: "#888888"}
			]
		});
	},

	squareFillOver: function( square )
	{
		if ( square.marked == true ) return;
		var bbox = square.getBoundingBox();
		square.setFill({
			type: "linear",
			x1: bbox.x, y1: bbox.y,
			x2: bbox.x+bbox.width, y2: bbox.y+bbox.height,
			colors: [
				{ offset: 0, color: "#E5E5E5"},
				{ offset: 1, color: "#AAAAAA"}
			]
		});	
	},

	kill: function()
	{
		if ( !this.win.closed ) this.win.close();
	}

})
