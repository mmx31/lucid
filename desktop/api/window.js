dojo.require("dojox.layout.ResizeHandle");
dojo.require("dojo.dnd.move");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.fx.easing");
/*
 * Package: window
 * 
 * Summary:
 * 		The window constructor
 * 
 * Example:
 * 		(start code)
 * 		win = new api.window();
 * 		win.title = "foo";
 * 		win.height =  "200px";
 * 		win.width = "20%";
 * 		win.bodyWidget = "ContentPane";
 * 		win.bodyWidgetParams = {parseOnLoad: true};
 * 		widget = new dijit.layout.ContentPane();
 * 		widget.setContent("baz");
 * 		win.addChild(widget, true);
 * 		win.show();
 * 		setTimeout(dojo.hitch(win, win.destroy), 1000*5);
 * 		(end code)
 */
dojo.declare("api.window", [dijit._Widget, dijit._Templated], {
	templateString: "<div class=\"win\" style=\"display: none;\" dojoattachevent=\"onmousedown: bringToFront\"><div class=\"win-tl\"><div class=\"win-tr\"><div class=\"win-tc\" dojoattachevent=\"onmousedown: bringToFront\"><div dojoattachpoint=\"titleNode,handle\" class=\"win-title\">${title}</div><div class=\"win-buttons\"><div dojoattachevent=\"onmouseup: close\" class=\"win-close\"></div><div dojoattachevent=\"onmouseup: _toggleMaximize\" class=\"win-max\"></div><div dojoattachevent=\"onmouseup: minimize\" class=\"win-min\"></div></div></div></div></div><div class=\"win-bmw\"><div class=\"win-ml\"><div class=\"win-mr\"><div class=\"win-mc\" dojoattachpoint=\"body\"></div></div></div><div class=\"win-bl\"><div class=\"win-br\"><div class=\"win-bc\"></div></div></div><div dojoattachpoint=\"resize\" class=\"win-resize\"></div></div></div>",
	/*
	 * Property: closed
	 * 
	 * Summary:
	 * 		Is the window closed?
	 */
	closed: false,
	/*
	 * Property: onClose
	 * 
	 * Summary:
	 * 		What to do on destroying of the window
	 */
	onClose: function() {
		
	},
	/*
	 * Property: onResize
	 * 
	 * Summary:
	 * 		What to do on the resizing of the window
	 */
	onResize: function() {
		
	},
	/*
	 * Property: onMinimize
	 * 
	 * Summary:
	 * 		What to do on the minimizing of the window
	 */
	onMinimize: function() {
		
	},
	/*
	 * Property: onMaximize
	 * 
	 * Summary:
	 * 		What to do upon maximize of window
	 */
	onMaximize: function() {
		
	},
	/*
	 * Property: showMaximize
	 * 
	 * Summary:
	 * 		Show whether or not to show the maximize button
	 */
	showMaximize: true,
	/*
	 * Property: showMinimize
	 * 
	 * Summary:
	 * 		Show whether or not to show the minimize button
	 */
	showMinimize: true,
	/*
	 * Property: showClose
	 * 
	 * Summary:
	 * 		Show whether or not to show the close button
	 */
	showClose: true,
	/*
	 * Property: bodyWidget
	 * 
	 * Summary:
	 * 		The window body's widget type
	 * 
	 * Note:
	 * 		This must be a member of dijit.layout
	 * 
	 * Notes:
	 * 		This is usefull for things like layout container creation
	 * 		To set this after window creation, use <window.setBodyWidget>
	 */
	bodyWidget: "ContentPane",
	 /*
	 * Property: bodyWidgetParams
	 * 
	 * Summary:
	 * 		The window body's widget params
	 */
	bodyWidgetParams: {},
	/*
	 * Property: maximized
	 * 
	 * Summary:
	 * 		Whether or not the window is maximized
	 * 		To set this after window creation, use <window.setBodyWidget>
	 */
	maximized: false,
	/*
	 * Property: height
	 * 
	 * Summary:
	 * 		The window's height in px, or %.
	 */
	height: "400px",
	/*
	 * Property: width
	 * 
	 * Summary:
	 * 		The window's width in px, or %.
	 */
	width: "500px",
	/*
	 * Property: title
	 * 
	 * Summary:
	 * 		The window's title
	 */
	title: "",
	/*
	 * Property: resizable
	 * 
	 * Summary:
	 * 		Weather or not the window is resizable.
	 */
	resizable: true,
	/*
	 * Property: pos
	 * 
	 * Summary:
	 * 		Internal variable used by the window maximizer
	 */
	pos: {},
	postCreate: function() {
		this.body = new dijit.layout[this.bodyWidget](this.bodyWidgetParams, this.body);
		this.domNode.title="";
		this.makeDragger();
		this.resize = new dojox.layout.ResizeHandle({
			targetContainer: this.domNode,
			activeResize: true
		}, this.resize);
		if(!this.resizable)
		{
			this.killResizer();
		}
		dojo.addClass(this.resize.domNode, "win-resize");
		dojo.connect(this.resize.domNode, "onmousedown", this, function(e){
			this._resizeEnd = dojo.connect(document, "onmouseup", this, function(e){
				dojo.disconnect(this._resizeEnd);
				this._resizeBody();
			});
		});
	},
	/*
	 * Method: setBodyWidget
	 * 
	 * Summary:
	 * 		sets the body widget. Cannot use after the window has been shown.
	 * Parameters:
	 * 		widget - the body widget's name. must be a member of dijit.layout
	 * 		widgetParams - The body widget params
	 */
	setBodyWidget: function(widget, widgetParams)
	{
		this.bodyWidget = widget;
		this.bodyWidgetParams = widgetParams;
		this.bodyWidgetParams.id=this.id+"body";
		this.body = new dijit.layout[this.bodyWidget](this.bodyWidgetParams, this.body.domNode);
	},
	/*
	 * Method: show
	 *  
	 * Summary:
	 * 		Shows the window
	 */
	show: function()
	{
			desktop.ui.containerNode.appendChild(this.domNode);
			dojo.style(this.domNode, "width", this.width);
			dojo.style(this.domNode, "height", this.height);
			this.titleNode.innerHTML = this.title;
			this._task = new desktop.ui.task({
				label: this.title,
				icon: this.icon,
				onClick: dojo.hitch(this, this._onTaskClick)
			});
			if(this.maximized == true) this.maximize();
			dojo.style(this.domNode, "display", "block");
			if (desktop.config.fx) {
				if (desktop.config.fx == 1) dojo.style(this.body.domNode, "display", "none");
				dojo.style(this.domNode, "opacity", 0);
				var anim = dojo.fadeIn({
					node: this.domNode,
					duration: desktop.config.window.animSpeed
				});
				dojo.connect(anim, "onEnd", this, function() {
					if (desktop.config.fx == 1) dojo.style(this.body.domNode, "display", "block");
					this._resizeBody();
				});
				anim.play();
			} else this._resizeBody();
	},
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
			var ns = dojo.query("div.win", desktop.ui.containerNode);
			var box;
			var myBox = new Object
			var overlapping = false;
			myBox.l = this.domNode.style.left;
			myBox.t = this.domNode.style.top;
			myBox.b = myBox.t + myBox.h;
			myBox.r = myBox.l + myBox.w;
			for(n = 0; n < ns.length; n++)
			{
				if(ns[n].id != this.id && (ns[n].style.display) != "none")
				{
					//TODO: overlap detection is really bad. rewrite it.
					box = new Object();
					box.l = ns[n].style.left;
					box.t = ns[n].style.top;
					box.w = ns[n].style.width;
					box.h = ns[n].style.height;
					if(box.l <= myBox.r &&
					   box.l >= myBox.l &&
					   box.t <= myBox.b &&
					   box.t >= myBox.t)
					{
						if(desktop.config.debug == true) api.log("windows are overlapping!");
						overlapping = true;
						break;
					}
				}
			}
			var wasontop = this.bringToFront();
			if(desktop.config.debug == true) api.log("onTop: "+wasontop+" overlap: "+overlapping);
			if(overlapping == false)
			{
				this.minimize();
			}
			else if(wasontop == true)
			{
				this.minimize();
				}
			}
		},
	_toggleMaximize: function() {
		if(this.maximized == true) this.unmaximize();
		else this.maximize();
	},
	/*
	 * Method: makeResizer
	 * 
	 * Summary:
	 * 		Internal method that makes a resizer for the window.
	 */
	makeResizer: function() {
		dojo.style(this.resize.domNode, "display", "block");
	},
	/*
	 * Method: killResizer
	 * 
	 * Summary:
	 * 		Internal method that gets rid of the resizer on the window.
	 */
	killResizer: function()
	{
		/*dojo.disconnect(this._dragging);
		dojo.disconnect(this._resizeEvent);
		dojo.disconnect(this._doconmouseup);
		this.resize.style.cursor = "default";*/
		dojo.style(this.resize.domNode, "display", "none");
	},
	/* 
	 * Method: minimize
	 * 
	 * Summary:
	 * 		Minimizes the window to the taskbar
	 */
	minimize: function()
	{
		this.onMinimize();
		if(desktop.config.fx == true)
		{
			dojo.style(this.body.domNode, "display", "none");
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
			});
			anim.play();
		}
		else
		{
			dojo.style(this.domNode, "opacity", 100)
			dojo.style(this.domNode, "display", "none");
		}
	},
	/*
	 * Method: restore
	 * 
	 * Summary:
	 * 		Restores the window from the taskbar
	 */
	restore: function()
	{
		this.domNode.style.display = "inline";
		if(desktop.config.fx == true)
		{
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
				dojo.style(this.body.domNode, "display", "block");
				this._resizeBody();
			});
			anim.play();
		}
	},
	/*
	 * Method: maximize
	 * 
	 * Summary:
	 * 		Maximizes the window
	 */
	maximize: function()
	{
		this.onMaximize();
		this.maximized = true;
		if(this._drag) this._drag.onMouseUp(); this._drag.destroy();
		this.killResizer();
		this.pos.top = dojo.style(this.domNode, "top");
		//this.pos.bottom = dojo.style(this.domNode, "bottom");
		this.pos.left = dojo.style(this.domNode, "left");
		//this.pos.right = dojo.style(this.domNode, "right");
		this.pos.width = dojo.style(this.domNode, "width");
		this.pos.height = dojo.style(this.domNode, "height");
		var win = this.domNode;
		
		if(desktop.config.fx == true)
		{
			//api.log("maximizing... (in style!)");
			dojo.style(this.body.domNode, "display", "none");
			var anim = dojo.animateProperty({
				node: this.domNode,
				properties: {
					top: {end: 0},
					left: {end: 0},
					width: {end: dojo.style(this.domNode.parentNode, "width")},
					height: {end: dojo.style(this.domNode.parentNode, "height")}
				},
				duration: desktop.config.window.animSpeed
			});
			dojo.connect(anim, "onEnd", this, function() {
				dojo.style(this.body.domNode, "display", "block");
				this._hideBorders();
				this._resizeBody();
			});
			anim.play();
		}
		else
		{
			//api.log("maximizing...");
			win.style.top = "0px";
			win.style.left = "0px";
			win.style.width = dojo.style(this.domNode.parentNode, "width");
			win.style.height = dojo.style(this.domNode.parentNode, "height");
			this._hideBorders();
			this._resizeBody();
		}
	},
	_showBorders: function() {
		dojo.forEach([
			"win-tr",
			"win-tl",
			"win-ml",
			"win-mr",
			"win-br",
			"win-bl",
			"win-bc"
		], function(item) {
			dojo.query("."+item+"-hidden", this.domNode).addClass(item).removeClass(item+"-hidden");
		});
	},
	_hideBorders: function() {
		dojo.forEach([
			"win-tr",
			"win-tl",
			"win-ml",
			"win-mr",
			"win-br",
			"win-bl",
			"win-bc"
		], function(item) {
			dojo.query("."+item, this.domNode).addClass(item+"-hidden").removeClass(item);
		});
	},
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
			dojo.style(this.body.domNode, "display", "none");
		}));
		this._dragStopListener = dojo.connect(this._drag, "onMoveStop", dojo.hitch(this, function(mover){
			dojo.style(this.body.domNode, "display", "block");
			this._resizeBody();
		}));
	},
	/*
	 * Method: unmaximize
	 * Summary:
	 * 		UnMaximizes the window
	 */
	unmaximize: function()
	{
		this.makeDragger();
		if(this.resizable == true)
		{		
			this.makeResizer();
		}
		var win = this.domNode;
		if(desktop.config.fx == true)
		{
			this._showBorders();
			dojo.style(this.body.domNode, "display", "none");
			var anim = dojo.animateProperty({
				node: this.domNode,
				properties: {
					top: {end: this.pos.top},
					left: {end: this.pos.left},
					//right: {end: this.pos.right},
					//bottom: {end: this.pos.bottom},
					width: {end: this.pos.width},
					height: {end: this.pos.height}
				},
				duration: desktop.config.window.animSpeed
			});
			dojo.connect(anim, "onEnd", this, function(e) {
				dojo.style(this.body.domNode, "display", "block");
				this._resizeBody();
			});
			void(anim); //fixes a weird ass IE bug. Don't ask me why :D
			anim.play();
		}
		else
		{
			win.style.top = this.pos.top;
			win.style.bottom = this.pos.bottom;
			win.style.left = this.pos.left;
			win.style.right = this.pos.right;
			win.style.height= this.pos.height;
			win.style.width= this.pos.width;
			this._showBorders();
			this._resizeBody();
		}
		this.maximized = false;
	},
	/*
	 * Method: unmaximize
	 * Summary:
	 * 		UnMaximizes the window
	 */
	_resizeBody: function()
	{
		if(this.body.resize) this.body.resize();
		if(this.body.layout) this.body.layout();
		this.onResize();
	},
	/*
	 * Method: bringToFront
	 * 
	 * Summary:
	 * 		Brings the window to the front of the stack
	 * 
	 * Returns:	
	 * 		false - it had to be rased
	 * 		true - it was allready on top.
	 */
	bringToFront: function()
	{
		var ns = dojo.query("div.win", desktop.ui.containerNode);
		var maxZindex = 0;
		for(i=0;i<ns.length;i++)
		{
			if((ns[i].style.display) != "none")
			{
				if((ns[i].style.zIndex) >= maxZindex)
				{
					maxZindex = ns[i].style.zIndex;
				}
			}
		}
		zindex = this.domNode.style.zIndex;
		if(desktop.config.debug == true) { api.log(maxZindex+" != "+zindex); }
		if(maxZindex != zindex)
		{
			maxZindex++;
			dojo.style(this.domNode, "zIndex", maxZindex);
			return false;
		}
		else return true;
	},
	uninitialize: function() {
		if(!this.closed) this.onClose();
		this.body.destroy();
		if(this._task) this._task.destroy();
		if(this._drag) this._drag.destroy();
		if(this.resize) this.resize.destroy();
	},
	/* 
	 * Method: close
	 * 
	 * Summary:
	 * 		closes the window
	 */
	close: function()
	{
		if (!this.closed) {
			this.closed = true;
			this.onClose();
			if (desktop.config.fx) {
				dojo.style(this.body.domNode, "display", "none");
				var anim = dojo.fadeOut({
					node: this.domNode,
					duration: desktop.config.window.animSpeed
				});
				dojo.connect(anim, "onEnd", this, function(){
					this.domNode.parentNode.removeChild(this.domNode);
					this.destroy();
				});
				anim.play();
			}
			else {
				this.domNode.parentNode.removeChild(this.domNode);
				this.destroy();
			}
		}
	},
	/*
	 * Adds a dojo widget or HTML element to the window.
	 * 
	 * Parameters:
	 * 		node - A dojo widget or HTML element.
	 * 
	 * Note:
	 * 		If you are adding widgets in bulk, you should not set restartWidget
	 * 		to 'true' untill adding the very last widget, otherwize the UI will
	 * 		take forever to render
	 */
	addChild: function(node)
	{
		this.body.addChild(node);
	},
	startup: function()
	{
		this.body.startup();
	}
});
