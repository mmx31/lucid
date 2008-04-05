dojo.provide("api.Window");
dojo.require("dojox.layout.ResizeHandle");
dojo.require("dojo.dnd.move");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dojox.fx.easing");
dojo.require("dijit._Templated");
/*
 * Class: api.Window
 * 
 * Summary:
 * 		The window constructor
 * 
 * Example:
 * 		(start code)
 * 		win = new api.Window();
 * 		win.title = "foo";
 * 		win.height =  "200px";
 * 		win.width = "20%";
 * 		widget = new dijit.layout.ContentPane();
 * 		widget.setContent("baz");
 * 		win.addChild(widget);
 * 		win.show();
 * 		win.startup();
 * 		setTimeout(dojo.hitch(win, win.destroy), 1000*5);
 * 		(end code)
 */
dojo.declare("api.Window", [dijit.layout._LayoutWidget, dijit._Templated], {
	templatePath: dojo.moduleUrl("api", "templates/Window.html"),
	/*
	 * Property: _winListItem
	 * 
	 * The store item that represents this window on desktop.ui._windowList
	 */
	_winListItem: null,
	/*
	 * Property: closed
	 * 
	 * Is the window closed?
	 */
	closed: false,
	/*
	 * Property: onClose
	 * 
	 * What to do on destroying of the window
	 */
	onClose: function() {
		
	},
	/*
	 * Property: onResize
	 * 
	 * What to do on the resizing of the window
	 */
	onResize: function() {
		
	},
	/*
	 * Property: onMinimize
	 * 
	 * What to do on the minimizing of the window
	 */
	onMinimize: function() {
		
	},
	/*
	 * Property: onMaximize
	 * 
	 * What to do upon maximize of window
	 */
	onMaximize: function() {
		
	},
	/*
	 * Property: showMaximize
	 * 
	 * Show whether or not to show the maximize button
	 */
	showMaximize: true,
	/*
	 * Property: showMinimize
	 * 
	 * Show whether or not to show the minimize button
	 */
	showMinimize: true,
	/*
	 * Property: showClose
	 * 
	 * Show whether or not to show the close button
	 */
	showClose: true,
	/*
	 * Property: maximized
	 * 
	 * Whether or not the window is maximized
	 */
	maximized: false,
	/*
	 * Property: minimized
	 * 
	 * Whether or not the window is minimized
	 */
	minimized: false,
	/*
	 * Property: height
	 * 
	 * The window's height in px, or %.
	 */
	height: "480px",
	/*
	 * Property: width
	 * 
	 * The window's width in px, or %.
	 */
	width: "600px",
	/*
	 * Property: title
	 * 
	 * The window's title
	 */
	title: "",
	/*
	 * Property: resizable
	 * 
	 * Weather or not the window is resizable.
	 */
	resizable: true,
	/*
	 * Property: pos
	 * 
	 * Internal variable used by the window maximizer
	 */
	pos: {},
	/*
	 * Property: _minimizeAnim
	 * 
	 * Set to true when the window is in the middle of a minimize animation.
	 * This is to prevent a bug where the size is captured mid-animation and restores weird.
	 */
	_minimizeAnim: false,
	postCreate: function() {
		this.domNode.title="";
		this.makeDragger();
		this.sizeHandle = new dojox.layout.ResizeHandle({
			targetContainer: this.domNode,
			activeResize: true
		}, this.sizeHandle);
		if(!this.resizable)
		{
			this.killResizer();
		}
		dojo.addClass(this.sizeHandle.domNode, "win-resize");
		dojo.connect(this.sizeHandle.domNode, "onmousedown", this, function(e){
			this._resizeEnd = dojo.connect(document, "onmouseup", this, function(e){
				dojo.disconnect(this._resizeEnd);
				this.resize();
			});
		});
		
		if(dojo.isIE){
			dojo.connect(this.domNode,'onresize', this,"_onResize");
		}
		dojo.connect(window,'onresize',this,"_onResize");
		this.bringToFront();
	},
	/*
	 * Method: show
	 *  
	 * Shows the window
	 */
	show: function()
	{
			desktop.ui.containerNode.appendChild(this.domNode);
			dojo.style(this.domNode, "width", this.width);
			dojo.style(this.domNode, "height", this.height);
			this.titleNode.innerHTML = this.title;
			this._winListItem = desktop.ui._windowList.newItem({
				label: this.title,
				icon: this.icon,
				id: this.id
			});
			if(this.maximized == true) this.maximize();
			dojo.style(this.domNode, "display", "block");
			var calcWidth = this.domNode.offsetWidth;
			var calcHeight = this.domNode.offsetHeight;
			var bodyWidth = this.containerNode.offsetWidth;
			var bodyHeight = this.containerNode.offsetHeight;
			dojo.style(this.domNode, "width", ((calcWidth - bodyWidth)+calcWidth)+"px");
			dojo.style(this.domNode, "height", ((calcHeight - bodyHeight)+calcHeight)+"px");
			if (desktop.config.fx >= 2) {
				if (desktop.config.fx < 3) this._toggleBody(false);
				dojo.style(this.domNode, "opacity", 0);
				var anim = dojo.fadeIn({
					node: this.domNode,
					duration: desktop.config.window.animSpeed
				});
				dojo.connect(anim, "onEnd", this, function() {
					if (desktop.config.fx < 3) this._toggleBody(true);
					this.resize();
				});
				anim.play();
			} else this.resize();
	},
	/*
	 * Method: _toggleBody
	 * 
	 * Toggles the display of the window's body
	 * 
	 * Arguments:
	 * 		show - If true the body is shown, if false then the body is hidden.
	 */
	_toggleBody: function(show) {
		if(show) {
			dojo.style(this.containerNode, "display", "block");
			dojo.style(this.dragContainerNode, "display", "none");
		}
		else {
			dojo.style(this.containerNode, "display", "none");
			dojo.style(this.dragContainerNode, "display", "block");
		}
	},
	/*
	 * Method: setTitle
	 * 
	 * Sets window title after window creation
	 * 
	 * Arguments:
	 * 		title - The new title
	 */
	setTitle: function(title) {
		this.titleNode.innerHTML = title;
		desktop.ui._windowList.setValue(this._winListItem, "label", title);
		this.title = title;
	},
	/*
	 * Method: _getPoints
	 * 
	 * Get the points of a box (as if it were on an xy plane)
	 * 
	 * Arguments:
	 * 		box - the box. {x: 24 (x position), y: 25 (y position), w: 533 (width), h: 435 (height)}
	 */
	_getPoints: function(/*Object*/box) {
		return {
			tl: {x: box.x, y: box.y},
			tr: {x: box.x+box.w, y: box.y},
			bl: {x: box.x, y: box.y+box.h},
			br: {x: box.x+box.w, y: box.y+box.h}
		}
	},
	/*
	 * Method: _onTaskClick
	 * 
	 * Called when the task button on a panel is clicked on
	 * Minimizes/restores the window
	 */
	_onTaskClick: function()
	{
		var s = this.domNode.style.display;
		if(s == "none")
		{
			this.restore();
			this.bringToFront();
		}
		else
		{
			if(!this.bringToFront()) this.minimize();
		}
	},
	/*
	 * Method: _toggleMaximize
	 * 
	 * Toggles the window being maximized
	 */
	_toggleMaximize: function() {
		if(this.maximized == true) this.unmaximize();
		else this.maximize();
	},
	/*
	 * Method: makeResizer
	 * 
	 * Internal method that makes a resizer for the window.
	 */
	makeResizer: function() {
		dojo.style(this.sizeHandle.domNode, "display", "block");
	},
	/*
	 * Method: killResizer
	 * 
	 * Internal method that gets rid of the resizer on the window.
	 */
	killResizer: function()
	{
		/*dojo.disconnect(this._dragging);
		dojo.disconnect(this._resizeEvent);
		dojo.disconnect(this._doconmouseup);
		this.sizeHandle.style.cursor = "default";*/
		dojo.style(this.sizeHandle.domNode, "display", "none");
	},
	/* 
	 * Method: minimize
	 * 
	 * Minimizes the window to the taskbar
	 */
	minimize: function()
	{
		if(this._minimizeAnim && desktop.config.fx >= 2) return;
		this.onMinimize();
		if(desktop.config.fx >= 2)
		{
			this._minimizeAnim = true;
			if(desktop.config.fx < 3) this._toggleBody(false);
			var pos = dojo.coords(this.domNode, true);
			this.left = pos.x;
			this.top = pos.y;
			var win = this.domNode;
			console.log("test");
			this._width = dojo.style(win, "width");
			this._height = dojo.style(win, "height");
			var pos = dojo.coords(this._task.nodes[0], true);
			var anim = dojo.animateProperty({
				node: this.domNode,
				duration: desktop.config.window.animSpeed,
				properties: {
					opacity: {end: 0},
					top: {end: pos.y},
					left: {end: pos.x},
					height: {end: 26}, //TODO: is there a way of detecting this?
					width: {end: 191} //and this?
				},
				easing: dojox.fx.easing.easeIn
			});
			dojo.connect(anim, "onEnd", this, function() {
				dojo.style(this.domNode, "display", "none");
				if(desktop.config.fx < 3) this._toggleBody(true);
				this._minimizeAnim = false;
			});
			anim.play();
		}
		else
		{
			dojo.style(this.domNode, "opacity", 100)
			dojo.style(this.domNode, "display", "none");
		}
		this.minimized = true;
	},
	/*
	 * Method: restore
	 * 
	 * Restores the window from the taskbar
	 */
	restore: function()
	{
		if(this._minimizeAnim && desktop.config.fx >= 2) return;
		this.domNode.style.display = "inline";
		if(desktop.config.fx >= 2)
		{
			this._minimizeAnim = true;
			if(desktop.config.fx < 3) this._toggleBody(false);
			var anim = dojo.animateProperty({
				node: this.domNode,
				duration: desktop.config.window.animSpeed,
				properties: {
					opacity: {end: 100},
					top: {end: this.top},
					left: {end: this.left},
					height: {end: this._height},
					width: {end: this._width}
				},
				easing: dojox.fx.easing.easeOut
			});
			dojo.connect(anim, "onEnd", this, function() {
				if(desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
				this._minimizeAnim = false;
			});
			anim.play();
		}
		this.minimized = false;
	},
	/*
	 * Method: maximize
	 * 
	 * Maximizes the window
	 */
	maximize: function()
	{
		this.onMaximize();
		this.maximized = true;
		var viewport = dijit.getViewport();
		dojo.addClass(this.domNode, "win-maximized");
		if(this._drag) this._drag.onMouseUp(); this._drag.destroy();
		this.killResizer();
		this.pos.top = dojo.style(this.domNode, "top");
		//this.pos.bottom = dojo.style(this.domNode, "bottom");
		this.pos.left = dojo.style(this.domNode, "left");
		//this.pos.right = dojo.style(this.domNode, "right");
		this.pos.width = dojo.style(this.domNode, "width");
		this.pos.height = dojo.style(this.domNode, "height");
		var win = this.domNode;
		var max = desktop.ui._area.getBox();
		if(desktop.config.fx >= 2)
		{
			//api.log("maximizing... (in style!)");
			if(desktop.config.fx < 3) this._toggleBody(false);
			var anim = dojo.animateProperty({
				node: this.domNode,
				properties: {
					top: {end: max.T},
					left: {end: max.L},
					width: {end: viewport.w - max.R - max.L},
					height: {end: viewport.h - max.B - max.T}
				},
				duration: desktop.config.window.animSpeed
			});
			dojo.connect(anim, "onEnd", this, function() {
				if(desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
			});
			anim.play();
		}
		else
		{
			//api.log("maximizing...");
			win.style.top = max.T;
			win.style.left = max.L;
			win.style.width = (viewport.h - max.R - max.L)+"px";
			win.style.height = (viewport.h - max.B - max.T)+"px";
			this.resize();
		}
	},
	/*
	 * Method: makeDragger
	 * 
	 * internal method to make the window moveable
	 */
	makeDragger: function()
	{
		if(desktop.config.window.constrain) 
		{
			this._drag = new dojo.dnd.move.parentConstrainedMoveable(this.domNode, {
				handle: this.handle
			});
		}
		else
		{
			this._drag = new dojo.dnd.Moveable(this.domNode, {
				handle: this.handle
			});
		}
		this._dragStartListener = dojo.connect(this._drag, "onMoveStart", dojo.hitch(this, function(mover){
			if(desktop.config.fx < 3) this._toggleBody(false);
		}));
		this._dragStopListener = dojo.connect(this._drag, "onMoveStop", dojo.hitch(this, function(mover){
			if (desktop.config.fx < 3) {
				this._toggleBody(true);
				this.resize();
			}
		}));
	},
	/*
	 * Method: unmaximize
	 * 
	 * UnMaximizes the window
	 */
	unmaximize: function()
	{
		dojo.removeClass(this.domNode, "win-maximized");
		this.makeDragger();
		if(this.resizable == true)
		{		
			this.makeResizer();
		}
		var win = this.domNode;
		if(desktop.config.fx >= 2)
		{
			if(desktop.config.fx < 3) this._toggleBody(false);
			var anim = dojo.animateProperty({
				node: this.domNode,
				properties: {
					top: {end: this.pos.top},
					left: {end: this.pos.left},
					width: {end: this.pos.width},
					height: {end: this.pos.height}
				},
				duration: desktop.config.window.animSpeed
			});
			dojo.connect(anim, "onEnd", this, function(e) {
				if(desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
			});
			void(anim); //fixes a weird ass IE bug. Don't ask me why :D
			anim.play();
		}
		else
		{
			win.style.top = this.pos.top+"px";
			win.style.left = this.pos.left+"px";
			win.style.height= this.pos.height+"px";
			win.style.width= this.pos.width+"px";
			this.resize();
		}
		this.maximized = false;
	},
	/*
	 * Method: bringToFront
	 * 
	 * Brings the window to the front of the stack
	 * 
	 * Returns:	
	 * 		false - it had to be rased
	 * 		true - it was allready on top.
	 */
	bringToFront: function()
	{
		var ns = dojo.query("div.win", desktop.ui.containerNode);
		var maxZindex = 10;
		for(i=0;i<ns.length;i++)
		{
			if(dojo.style(ns[i], "display") == "none") continue;
			if(dojo.style(ns[i], "zIndex") > maxZindex)
			{
				maxZindex = dojo.style(ns[i], "zIndex");
			}
		}
		var zindex = dojo.style(this.domNode, "zIndex");
		if(maxZindex != zindex)
		{
			maxZindex++;
			dojo.style(this.domNode, "zIndex", maxZindex);
			return true;
		}
		return false;
	},
	uninitialize: function() {
		if(!this.closed) this.onClose();
		if(this._winListItem) desktop.ui._windowList.deleteItem(this._winListItem);
		if(this._drag) this._drag.destroy();
		if(this.sizeHandle) this.sizeHandle.destroy();
	},
	/* 
	 * Method: close
	 * 
	 * closes the window
	 */
	close: function()
	{
		if (!this.closed) {
			this.closed = true;
			if(this._winListItem) desktop.ui._windowList.deleteItem(this._winListItem);
			this._winListItem = false;
			var onEnd = dojo.hitch(this, function() {
				this.onClose();
				this.domNode.parentNode.removeChild(this.domNode);
				this.destroy();
			})
			if (desktop.config.fx >= 2) {
				if(desktop.config.fx < 3) this._toggleBody(false);
				var anim = dojo.fadeOut({
					node: this.domNode,
					duration: desktop.config.window.animSpeed
				});
				dojo.connect(anim, "onEnd", this, onEnd);
				anim.play();
			}
			else onEnd();
		}
	},
	/*
	 * Method: resize
	 * 
	 * Explicitly set the window's size (in pixels)
	 * 
	 * Arguments:
	 * 		args - {w: int, h: int, l: int, t: int}
	 */
	resize: function(/*Object?*/args){
		var node = this.domNode;
		
		//first take care of our size if we're maximized
		if(this.maximized) {
			var max = desktop.ui._area.getBox();
			var viewport = dijit.getViewport();
			dojo.style(node, "top", max.T+"px");
			dojo.style(node, "left", max.L+"px");
			dojo.style(node, "width", (viewport.w - max.R - max.L)+"px");
			dojo.style(node, "height", (viewport.h - max.B  - max.T)+"px");
		}
		
		// set margin box size, unless it wasn't specified, in which case use current size
		if(args){
			dojo.marginBox(node, args);

			// set offset of the node
			if(args.t){ node.style.top = args.t + "px"; }
			if(args.l){ node.style.left = args.l + "px"; }
		}
		// If either height or width wasn't specified by the user, then query node for it.
		// But note that setting the margin box and then immediately querying dimensions may return
		// inaccurate results, so try not to depend on it.
		var mb = dojo.mixin(dojo.marginBox(this.containerNode), args||{});

		// Save the size of my content box.
		this._contentBox = dijit.layout.marginBox2contentBox(this.containerNode, mb);

		// Callback for widget to adjust size of it's children
		this.layout();
	},
	/*
	 * Method: layout
	 * 
	 * Layout the widget
	 */
	layout: function(){
		dijit.layout.layoutChildren(this.containerNode, this._contentBox, this.getChildren());
	},
	/*
	 * Method: addChild
	 * 
	 * Add a child to the window
	 * 
	 * Arguments:
	 * 		child - the child to add
	 * 		insertIndex - at what index to insert the widget (optional)
	 */
	addChild: function(/*Widget*/ child, /*Integer?*/ insertIndex){
		dijit._Container.prototype.addChild.apply(this, arguments);
		if(this._started){
			dijit.layout.layoutChildren(this.containerNode, this._contentBox, this.getChildren());
		}
	},
	/*
	 * Method: removeChild
	 * 
	 * Remove a child from the widget
	 * 
	 * Arguments:
	 * 		widget - the widget to remove
	 */
	removeChild: function(/*Widget*/ widget){
		dijit._Container.prototype.removeChild.apply(this, arguments);
		if(this._started){
			dijit.layout.layoutChildren(this.containerNode, this._contentBox, this.getChildren());
		}
	},
	/*
	 * Method: _onResize
	 * 
	 * Event handler
	 * Resizes the window when the screen is resized.
	 */
	_onResize: function(e) {
		if (this.maximized && !this.minimized) {
			var max = desktop.ui._area.getBox();
			var c = dojo.coords(this.domNode);
			var v = dijit.getViewport();
			dojo.style(this.domNode, "width", v.w - max.L - max.R);
			dojo.style(this.domNode, "height", v.h - max.T - max.B);
		}
		else if(this.maximized && this.minimized) {
			var max = desktop.ui._area.getBox();
			var v = dijit.getViewport();
			this.pos.width = v.w - max.L - max.R;
			this.pos.height = v.h - max.T - max.B;
		}
		this.resize();
	},
	/*
	 * Method: startup
	 * 
	 * starts the widget up
	 */
	startup: function() {
		this.inherited("startup", arguments);
		this.resize();
	}
});

dojo.extend(dijit._Widget, {
	// layoutAlign: String
	//		"none", "left", "right", "bottom", "top", and "client".
	//		See the LayoutContainer description for details on this parameter.
	layoutAlign: 'none'
});
