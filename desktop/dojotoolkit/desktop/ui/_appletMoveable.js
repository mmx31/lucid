dojo.provide("desktop.ui._appletMoveable");
dojo.require("dojo.dnd.move");
dojo.declare("desktop.ui._appletMoveable", dojo.dnd.move.constrainedMoveable, {
	//	summary:
	//		A subclassed dojo.dnd.move.constrainedMoveable for desktop.ui.Applet
	onMove: function(/* dojo.dnd.Mover */ mover, /* Object */ leftTop){
		//	summary: called during every move notification,
		//		should actually move the node, can be overwritten.
		var c = this.constraintBox;
		leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
		leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;
		dojo.marginBox(mover.node, leftTop);
		this.onMoved(mover, leftTop);
	}
});