this.init = function(args)
{
	dojo.require("dojox.gfx");
	dojo.require("dojox.gfx.move");
	this.win = new api.window({
		title: "Checkers",
		width: "400px",
		height: "420px",
		resizable: false,
		onHide: dojo.hitch(this, this.kill)
	});
	this.win.show();
	this.surface = dojox.gfx.createSurface(this.win.body.domNode, 400, 400);
	this.drawBoard();
}
this.kill = function() {
	if(!this.win.hidden) this.win.hide();
	api.instances.setKilled(this.instance);
}
this.drawBoard = function()
{
	for(var i = 0; i < 400; i += 50){
		for(var j = 0; j < 400; j += 50){
			if(!(i % 100 == j % 100)) {
				this.surface.createRect({ x: i, y: j, width: 50, height: 50 }).setFill("gray");
			}
		}
	}
	for(var i = 0; i < 400; i += 50){
		for(var j = 0; j < 400; j += 50){
			if(!(i % 100 == j % 100)) {
				if(j < 150) this.makePiece({x: i+25, y: j+25, color: "red"});
				else if(j > 200) this.makePiece({x: i+25, y: j+25, color: "black"});
			}
		}
	}
}
this.pieces = [];
this.makePiece = function(c)
{
	var shape = this.surface.createCircle({
		cx: c.x,
		cy: c.y,
		r: 18
	}).setFill(c.color).setStroke({
		color: (c.color=="red" ? [150, 0, 0, 0.8] : "gray"),
		width: 1
	});
	var move = new dojox.gfx.Moveable(shape);
	shape.checkMove = dojo.hitch(this, this.checkMove);
	shape.connect("onmousedown", shape, function(e) {
		this.moveToFront();
		this.old_shape = this.getShape();
		this.old_pos = (this.getTransform() || {
			dx: 0,
			dy: 0
		});
	});
	shape.connect("onmouseup", shape, function(e) {
		for(var c=0; c <= 400; c+=50)
		{
			if(e.layerY <= c && e.layerY >= c-50) {
				for(var v=0; v <= 400; v+=50)
				{
					if(e.layerX <= v && e.layerX >= v-50)
					{
						var os=this.old_shape;
						var pos = this.old_pos;
						var final_oldpos = {
							x: os.cx+pos.dx-25,
							y: os.cy+pos.dy-25
						}
						if(this.checkMove(final_oldpos, v, c, this))
						{
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
	shape.__color = c.color,
	shape.__king = false;
	this.pieces[this.pieces.length] = {
		circle: shape,
		movable: move
	};
}
this.checkMove = function(old_pos, x, y, shape)
{
	if(!(x % 100 == y % 100))
	{
		var board = [];
		dojo.forEach(this.pieces, function(piece) {
			if(piece)
			{
				if(piece.circle.shape.cx != shape.shape.cx && piece.circle.shape.cy != shape.shape.cy) {
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
		if(shape.king) spaces.y = Math.abs(spaces.y);
		else if(shape.__color == "red") spaces.y = -spaces.y;
		if(spaces.x == 1 && spaces.y == 1) {
			if(typeof board[(x/50)-1][(y/50)-1] == "undefined") return true;
		}
		else if(spaces.x == 2 && spaces.y == 2) {
			var ey = (((old_pos.y/50) + (y/50))/2)-0.5;
			var ex = (((old_pos.x/50) + (x/50))/2)-0.5;
			if(typeof board[ex][ey] != "undefined" && board[ex][ey].circle.__color != shape.__color) {
				if(typeof board[(x/50)-1][(y/50)-1] == "undefined") {
					this.surface.remove(board[ex][ey].circle);
					for(i in this.pieces) {
						var piece = this.pieces[i];
						if(piece)
						{
							if(piece.circle.shape.cx == board[ex][ey].circle.shape.cx && piece.circle.shape.cy == board[ex][ey].circle.shape.cy) {
								delete this.pieces[i];
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
