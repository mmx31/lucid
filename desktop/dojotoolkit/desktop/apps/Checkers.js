dojo.provide("desktop.apps.Checkers");

dojo.declare("desktop.apps.Checkers", desktop.apps._App, {
	init: function(args)
	{
		dojo.require("dojox.gfx");
		dojo.require("dojox.gfx.move");
		dojo.requireLocalization("desktop", "apps");
		var app = dojo.i18n.getLocalization("desktop", "apps");
		this.win = new desktop.widget.Window({
			title: app["Checkers"],
			width: "400px",
			height: "400px",
			resizable: false,
            showMaximize: false,
			iconClass: this.iconClass,
			onClose: dojo.hitch(this, this.kill)
		});
		this.win.show();
		this.surface = dojox.gfx.createSurface(this.win.containerNode, 400, 400);
		this.drawBoard();
		this.win.startup();
	},
	kill: function(){
		if(!this.win.closed) this.win.close();
	},
	drawBoard: function()
	{
		for(var i = 0; i < 400; i += 50){
			for(var j = 0; j < 400; j += 50){
				if(!(i % 100 == j % 100)){
					this.surface.createRect({ x: i, y: j, width: 50, height: 50 }).setFill({
						type: "linear",
						x1: i, y1: j, x2: (i+50), y2: (j+50),
						colors:[
							{offset: 0, color:"#888888"},
							{offset: 1, color:"#222222"}
						]
					});
				}
			}
		}
		for(var i = 0; i < 400; i += 50){
			for(var j = 0; j < 400; j += 50){
				if(!(i % 100 == j % 100)){
					if(j < 150) this.makePiece({x: i+25, y: j+25, color: "red"});
					else if(j > 200) this.makePiece({x: i+25, y: j+25, color: "black"});
				}
			}
		}
	},
	pieces: [],
	makePiece: function(c)
	{
		
		var shape = this.surface.createCircle({
			cx: c.x,
			cy: c.y,
			r: 18
		}).setStroke({
			color: (c.color=="red" ? [150, 0, 0, 0.8] : "gray"),
			width: 1
		});
		
		if ( c.color == "red" ){
			shape.setFill({
				type: "radial",
				//x1: (c.x), y1: (c.y), x2: (c.x + 15), y2: (c.y + 15),
				cx: c.x, cy: c.y, r: 18,
				colors:[
					{offset:0, color: "#880000"},
					{offset:1, color: "#DD0000"}
				]
			});
		}else{
			shape.setFill({
				type: "radial",
				cx: c.x, cy: c.y, r: 18,
				colors: [
					{offset: 0, color: "#000000"},
					{offset: 1, color: "#444444"}
				]
			});
		}
	
		var move = new dojox.gfx.Moveable(shape);
		shape.checkMove = dojo.hitch(this, this.checkMove);
		shape.checkKing = dojo.hitch(this, this.checkKing);
		shape.connect("onmousedown", shape, function(e){
			this.moveToFront();
			this.old_shape = this.getShape();
			this.old_pos = (this.getTransform() || {
				dx: 0,
				dy: 0
			});
		});
		var bodyNode = this.win.containerNode;
		shape.connect("onmouseup", shape, function(e){
			var bCoords = dojo.coords(bodyNode, false);
			for(var c=0; c <= 400; c+=50)
			{
				if(e.clientY - bCoords.y <= c && e.clientY - bCoords.y >= c-50){
					for(var v=0; v <= 400; v+=50)
					{
						if(e.clientX - bCoords.x <= v && e.clientX - bCoords.x >= v-50)
						{
							var os=this.old_shape;
							var pos = this.old_pos;
							var final_oldpos = {
								x: os.cx+pos.dx-25,
								y: os.cy+pos.dy-25
							}
							if(this.checkMove(final_oldpos, v, c, this))
							{
								this.checkKing(v, c, this);
								this.setTransform({
									dx: (v+50)-os.cx-75,
									dy: (c+50)-os.cy-75
								});
							}
							else
							{
								var pos = this.getTransform();
								this.applyLeftTransform({
									dx: this.old_pos.dx-pos.dx,
									dy: this.old_pos.dy-pos.dy
								});
							}
							break;
						}
					}
				}
			}
		});
		shape._checkers_color = c.color,
		shape._checkers_king = false;
		shape._checkers_id = this.pieceCount;
		this.pieces[this.pieces.length] = {
			circle: shape,
			movable: move,
			id: this.pieceCount
		};
		this.pieceCount++;
	},
	checkKing: function(x, y, piece)
	{
		if(piece._checkers_color == "red"){
			if(y/50 == 8)
			{
				piece._checkers_king = true;
				piece.setStroke("gold");
			}
		}
		if(piece._checkers_color == "black"){
			if(y/50 == 1)
			{
				piece._checkers_king = true;
				piece.setStroke("gold");
			}
		}
	},
	pieceCount: 0,
	checkMove: function(old_pos, x, y, shape)
	{
		if(!(x % 100 == y % 100))
		{
			var board = [];
			for(var i=1;i <= 8; i++){ board[i] = []; }
			dojo.forEach(this.pieces, function(piece){
				if(piece)
				{
					if(piece.id != shape._checkers_id){
						var pos = piece.circle.getShape();
						var trans = (piece.circle.getTransform() || {dx: 0, dy: 0});
						var c = {
							x: pos.cx+trans.dx-25,
							y: pos.cy+trans.dy-25
						};
						if(typeof board[c.x/50] == "undefined") board[c.x/50] = [];
						board[c.x/50][c.y/50]=piece;
					}
				}
			});
			var spaces = {
				x: Math.abs((old_pos.x/50) - (x/50)+1),
				y: (old_pos.y/50) - (y/50)+1
			};
			if(shape._checkers_king) spaces.y = Math.abs(spaces.y);
			else if(shape._checkers_color == "red") spaces.y = -spaces.y;
			if(spaces.x == 1 && spaces.y == 1){
				if(typeof board[(x/50)-1] != "undefined" && typeof board[(x/50)-1][(y/50)-1] == "undefined") return true;
			}
			else if(spaces.x == 2 && spaces.y == 2){
				var ey = (((old_pos.y/50) + (y/50))/2)-0.5;
				var ex = (((old_pos.x/50) + (x/50))/2)-0.5;
				if(typeof board[ex][ey] != "undefined" && board[ex][ey].circle._checkers_color != shape._checkers_color){
					if(typeof board[(x/50)-1] != "undefined" && typeof board[(x/50)-1][(y/50)-1] == "undefined"){
						this.surface.remove(board[ex][ey].circle);
						for(var i in this.pieces){
							var piece = this.pieces[i];
							if(piece)
							{
								if(piece.id == board[ex][ey].id){
									this.pieces[i] = undefined;
								}
							}
						}
						return true;
					}
				}
			}
			return false;
		}
		return false;
	}
})
