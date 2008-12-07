dojo.provide("desktop.widget.Window");
dojo.require("dojox.layout.ResizeHandle");
dojo.require("dojo.dnd.move");
dojo.require("dojox.fx.easing");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Menu");
dojo.requireLocalization("desktop.widget", "window");

dojo.declare("desktop.widget.Window", [dijit.layout.BorderContainer, dijit._Templated], {
	//	summary:
	//		The window widget
	//	example:
	//	|	var win = new desktop.widget.Window({
	//	|		title: "Foo",
	//	|		height: "200px",
	//	|		width: "400px"
	//	|	});
	//	|	var widget = new dijit.layout.ContentPane();
	//	|	widget.setContent("baz");
	//	|	win.addChild(widget);
	//	|	win.show();
	//	|	win.startup();
	//	|	setTimeout(dojo.hitch(win, "close"), 1000*5);
	templatePath: dojo.moduleUrl("desktop.widget", "templates/Window.html"),
	//	_winListItem: storeItem
	//		The store item that represents this window on desktop.ui._windowList
	_winListItem: null,
	_started: false,
	//	closed: Boolean
	//		Is the window closed?
	closed: false,
    //  shown: Boolean
    //      Is the window shown?
    shown: false,
	//	iconClass: String?
	//		the class to give the icon node
	iconClass: "",
	//	liveSplitters: Boolean
	//		specifies whether splitters resize as you drag (true) or only upon mouseup (false)
	liveSplitters: false,
	onClose: function(){
		//	summary:
		//		What to do on destroying of the window
	},
	onResize: function(){
		//	summary:
		//		What to do on the resizing of the window
	},
	onMinimize: function(){
		//	summary:
		//		What to do on the minimizing of the window
	},
	/*
	 * Property: onMaximize
	 * 
	 * What to do upon maximize of window
	 */
	onMaximize: function(){
		//	summary:
		//		What to do upon maximize of window
	},
	gutters: false,
	//	showMaximize: Boolean
	//		Whether or not to show the maximize button
	showMaximize: true,
	//	showMinimize: Boolean
	//		Whether or not to show the minimize button
	showMinimize: true,
	//	showClose: Boolean
	//		Whether or not to show the close button
	showClose: true,
	//	maximized: Boolean
	//		Whether or not the window is maximized
	maximized: false,
	//	minimized: Boolean
	//		Whether or not the window is minimized
	minimized: false,
	//	allwaysOnTop: boolean
	//		Whether or not the window is to always stay on top of other windows
	alwaysOnTop: false,	 	 	 
	//	height: String
	//		The window's height in px, or %.
	height: "480px",
	//	width: String
	//		The window's width in px, or %.
	width: "600px",
	//	title: String
	//		The window's title
	title: "(untitled)",
	//	resizable: Boolean
	//		Weather or not the window is resizable.
	resizable: true,
    //  alwaysOnTop: Boolean
    //      Weather or not the window stays on top of all the other windows.
    alwaysOnTop: false,
	//	pos: Object
	//		Internal variable used by the window maximizer
	pos: {top: 0, left: 0, width: 0, height: 0},
	//	_minimizeAnim: Boolean
	//		Set to true when the window is in the middle of a minimize animation.
	//		This is to prevent a bug where the size is captured mid-animation and restores weird.
	_minimizeAnim: false,
	postCreate: function(){
		dojo.setSelectable(this.titleNode, false);
		this.domNode.title="";
		this.makeDragger();
        this.shown = false;
		this.sizeHandle = new dojox.layout.ResizeHandle({
			targetContainer: this.domNode,
			activeResize: (desktop.config.fx >= 2),
			animateSizing: false,
			animateDuration: desktop.config.window.animSpeed
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
			this.connect(this.domNode,'onresize',"_onResize");
		}
		this.connect(window,'onresize',"_onResize");
		dojo.style(this.domNode, "position", "absolute"); //override /all/ css values for this one
        this.pos = {top: 0, left: 0, width: 0, height: 0};
        this._makeMenu();
		this.inherited(arguments);
	},
    _makeMenu: function(){
        //  summary:
        //      Makes the context menu for the window title
        var nls = dojo.i18n.getLocalization("desktop.widget", "window");
        var menu = this._menu = new dijit.Menu();
        this._menuItems = {};
        menu.addChild(this._menuItems.min = new dijit.MenuItem({
            label: nls.minimize,
            onClick: dojo.hitch(this, "minimize")
        }));
        menu.addChild(this._menuItems.max = new dijit.MenuItem({
            label: nls.maximize,
            onClick: dojo.hitch(this, "maximize")
        }));
        menu.addChild(new dijit.MenuSeparator({}));
        menu.addChild(new dijit.CheckedMenuItem({
            label: nls.alwaysOnTop,
            onChange: dojo.hitch(this, function(val){
                this.alwaysOnTop = val;
                this.bringToFront();
            })
        }));
        menu.addChild(new dijit.MenuSeparator({}));
        menu.addChild(new dijit.MenuItem({
            label: nls.close,
            onClick: dojo.hitch(this, "close")
        }));
        menu.bindDomNode(this.titleNode);
        this._fixMenu();
    },
    _fixMenu: function(){
        var nls = dojo.i18n.getLocalization("desktop.widget", "window");
        var items = this._menuItems;
        if(this.maximized){
            items.max.attr("label", nls.unmaximize);
            items.max.onClick = dojo.hitch(this, "unmaximize");
        }else{
            items.max.attr("label", nls.maximize);
            items.max.onClick = dojo.hitch(this, "maximize");
        }
        if(this.minimized){
            items.min.attr("label", nls.restore);
            items.min.onClick = dojo.hitch(this, "restore");
        }else{
            items.min.attr("label", nls.minimize);
            items.min.onClick = dojo.hitch(this, "minimize");
        }
    },
	show: function()
	{
		//	summary:
		//		Shows the window
        if(this.shown)
           return;
        this.shown = true;
		desktop.ui._area.addChild(this);
		this.titleNode.innerHTML = this.title;
		this._winListItem = desktop.ui._windowList.newItem({
			label: this.title,
			icon: this.iconClass,
			id: this.id
		});
		if(this.maximized == true) this.maximize();
		dojo.style(this.domNode, "display", "block");
        this.resize({
            width: this.width,
            height: this.height
        });
		//calculate the middle of the desktop.ui.Area container
        var calcWidth = this.domNode.offsetWidth;
		var calcHeight = this.domNode.offsetHeight;
		var bodyWidth = this.containerNode.offsetWidth;
		var bodyHeight = this.containerNode.offsetHeight;
		var viewport = dijit.getViewport();
		var topCount = 0;
		dojo.query(".desktopPanelTop", "desktop_ui_Area_0").forEach(function(panel){
			topCount += panel.offsetHeight;
		});
		var topStyle = ((viewport.h/2) - (((calcHeight - bodyHeight)+calcHeight)/2));
		dojo.style(this.domNode, {
			top: (topStyle > topCount ? topStyle : topCount)+"px",
			left: ((viewport.w/2) - (((calcWidth - bodyWidth)+calcWidth)/2))+"px"
		});
		if (desktop.config.fx >= 2){
			if (desktop.config.fx < 3) this._toggleBody(false);
			dojo.style(this.domNode, "opacity", 0);
			var anim = dojo.fadeIn({
				node: this.domNode,
				duration: desktop.config.window.animSpeed
			});
			dojo.connect(anim, "onEnd", this, function(){
				if (desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
			});
			anim.play();
		} else this.resize();
		this.bringToFront();
        if(!this._started){
			this.startup();
		}
	},
	_toggleBody: function(/*Boolean*/show){
		//	summary:
		//		Toggles the display of the window's body
		//	show:
		//		If true the body is shown, if false then the body is hidden.
		if(show){
			dojo.style(this.containerNode, "display", "block");
			dojo.style(this.dragContainerNode, "display", "none");
		}
		else {
			dojo.style(this.containerNode, "display", "none");
			dojo.style(this.dragContainerNode, "display", "block");
		}
	},
	_setTitleAttr: function(/*String*/title){
		//	summary:
		//		Sets window title after window creation
		//	title:
		//		The new title
		this.titleNode.innerHTML = title;
		if(this._winListItem)
			desktop.ui._windowList.setValue(this._winListItem, "label", title);
		this.title = title;
	},
	setTitle: function(/*String*/title){
		if(dojo.version.major >= 1 && dojo.version.minor >= 2)
			dojo.deprecated("window.setTitle", "setTitle is deprecated. Please use dojo.attr(\"title\", \"value\");", "1.1");
		return this._setTitleAttr(title);
	},
	_getPoints: function(/*Object*/box){
		//	summary:
		//		Get the points of a box (as if it were on an xy plane)
		//	box:
		//		the box. {x: 24 (x position), y: 25 (y position), w: 533 (width), h: 435 (height)}
		return {
			tl: {x: box.x, y: box.y},
			tr: {x: box.x+box.w, y: box.y},
			bl: {x: box.x, y: box.y+box.h},
			br: {x: box.x+box.w, y: box.y+box.h}
		}
	},
	_onTaskClick: function()
	{
		//	summary:
		//		Called when the task button on a panel is clicked on
		//		Minimizes/restores the window
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
	_toggleMaximize: function(){
		//	summary:
		//		Toggles the window being maximized
		if(this.maximized == true) this.unmaximize();
		else this.maximize();
	},
	makeResizer: function(){
		//	summary:
		//		Internal method that makes a resizer for the window.
		dojo.style(this.sizeHandle.domNode, "display", "block");
	},
	killResizer: function()
	{
		//	summary:
		//		Internal method that gets rid of the resizer on the window.
		/*dojo.disconnect(this._dragging);
		dojo.disconnect(this._resizeEvent);
		dojo.disconnect(this._doconmouseup);
		this.sizeHandle.style.cursor = "default";*/
		dojo.style(this.sizeHandle.domNode, "display", "none");
	},
	minimize: function()
	{
		//	summary:
		//		Minimizes the window to the taskbar
		if(this._minimizeAnim && desktop.config.fx >= 2) return;
		this.onMinimize();
		if(desktop.config.fx >= 2)
		{
			this._minimizeAnim = true;
			if(desktop.config.fx < 3) this._toggleBody(false);
			var pos = dojo.coords(this.domNode, true);
			this.pos.left = pos.x;
			this.pos.top = pos.y;
			var win = this.domNode;
			this.pos.width = dojo.style(win, "width");
			this.pos.height = dojo.style(win, "height");
			var taskbar = dijit.byNode(dojo.query(".desktopTaskbarApplet")[0].parentNode);
			if(taskbar) var pos = dojo.coords(taskbar._buttons[this.id], true);
			else var pos = {x: 0, y: 0, w: 0, h: 0};
			var anim = dojo.animateProperty({
				node: this.domNode,
				duration: desktop.config.window.animSpeed,
				properties: {
					opacity: {end: 0},
					top: {end: pos.y},
					left: {end: pos.x},
					height: {end: pos.h},
					width: {end: pos.w}
				},
				easing: dojox.fx.easing.easeIn
			});
			dojo.connect(anim, "onEnd", this, function(){
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
        this._fixMenu();
	},
	restore: function()
	{
		//	summary:
		//		Restores the window from the taskbar
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
					top: {end: this.pos.top},
					left: {end: this.pos.left},
					height: {end: this.pos.height},
					width: {end: this.pos.width}
				},
				easing: dojox.fx.easing.easeOut
			});
			dojo.connect(anim, "onEnd", this, function(){
				if(desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
				this._minimizeAnim = false;
			});
			anim.play();
		}
		this.minimized = false;
        this._fixMenu();
	},
	maximize: function()
	{
		//	summary:
		//		Maximizes the window
		this.onMaximize();
		this.maximized = true;
        this._fixMenu();
		var viewport = dijit.getViewport();
		dojo.addClass(this.domNode, "win-maximized");
		if(this._drag) /*this._drag.onMouseUp(window.event);*/ this._drag.destroy();
		this.killResizer();
		this.pos.top = dojo.style(this.domNode, "top");
		this.pos.left = dojo.style(this.domNode, "left");
		this.pos.width = dojo.style(this.domNode, "width");
		this.pos.height = dojo.style(this.domNode, "height");
		var win = this.domNode;
		var max = desktop.ui._area.getBox();
		if(desktop.config.fx >= 2)
		{
			//desktop.log("maximizing... (in style!)");
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
			dojo.connect(anim, "onEnd", this, function(){
				if(desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
			});
			anim.play();
		}
		else
		{
			//desktop.log("maximizing...");
            dojo.style(win, {
                top: max.T+"px",
                left: max.L+"px",
                width: (viewport.w - max.R - max.L)+"px",
                height: (viewport.h - max.B - max.T)+"px"
            });
			this.resize();
		}
	},
	makeDragger: function()
	{
		//	summary:
		//		internal method to make the window moveable
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
			if (desktop.config.fx < 3){
				this._toggleBody(true);
				this.resize();
			}
		}));
	},
	unmaximize: function()
	{
		//	summary:
		//		Unmaximizes the window
		dojo.removeClass(this.domNode, "win-maximized");
		this.makeDragger();
		if(this.resizable == true)
		{		
			this.makeResizer();
		}
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
			dojo.connect(anim, "onEnd", this, function(e){
				if(desktop.config.fx < 3) this._toggleBody(true);
				this.resize();
			});
			void(anim); //fixes a weird ass IE bug. Don't ask me why :D
			anim.play();
		}
		else
		{
			dojo.style(this.domNode, {
				top: this.pos.top+"px",
				left: this.pos.left+"px",
				height: this.pos.height+"px",
				width: this.pos.width+"px"
			});
			setTimeout(dojo.hitch(this, "resize"), 100)
		}
		this.maximized = false;
        this._fixMenu();
	},
	bringToFront: function()
	{
		//	summary:
		//		Brings the window to the front of the stack
		//	returns:
		//		true if it had to be raised
		//		false if it was already on top
		var maxZindex = 11;
		var alwaysOnTopNum = 0;		// Number of wins with 'alwaysOnTop' property set to true
		var topWins = [];	// Array of reffernces to win widgets with 'alwaysOnTop' property set to true
		var winWidget;			// Reffernce to window widget by dom node
		dojo.forEach(this.getParent().getChildren(), function(wid){
            if(typeof wid == "undefined") return;
			var node = wid.domNode;
			var zindex = dojo.style(node, "zIndex")
			if(zindex > maxZindex && zindex != "auto"){
				maxZindex = zindex;
			}
			if (wid.alwaysOnTop == true){
				alwaysOnTopNum++;
				topWins.push(winWidget);
			}
		});
		var zindex = dojo.style(this.domNode, "zIndex");
		if(maxZindex != zindex)
		{
			maxZindex++;
			dojo.style(this.domNode, "zIndex", maxZindex);
			// Check for win widgets with 'alwaysOnTop' property set to true
			if ( topWins.length > 0 ){
				dojo.forEach(topWins, function(win){
					maxZindex++;
					dojo.style(win.domNode, "zIndex", maxZindex);
				});
			}
			return true;
		}
		return false;
	},
	uninitialize: function(){
		if(!this.closed) this.onClose();
		if(this._winListItem) desktop.ui._windowList.deleteItem(this._winListItem);
		if(this._drag) this._drag.destroy();
        if(this._menu) this._menu.destroy();
		if(this.sizeHandle) this.sizeHandle.destroy();
	},
	close: function()
	{
		//	summary:
		//		closes the window
		if (!this.closed){
			this.closed = true;
			if(this._winListItem) desktop.ui._windowList.deleteItem(this._winListItem);
			this._winListItem = false;
			this.onClose();
			if (desktop.config.fx >= 2){
				if(desktop.config.fx < 3) this._toggleBody(false);
				var anim = dojo.fadeOut({
					node: this.domNode,
					duration: desktop.config.window.animSpeed,
                    onEnd: dojo.hitch(this, function(){
                        this.destroy();
                    })
				});
				anim.play();
			}
			else this.destroy();
		}
	},
	layout: function(){
		//	summary:
		//		Layout the widgets
		
		//hack so we don't have to deal with BorderContainer's method using this.domNode
		var oldNode = this.domNode;
		this.domNode = this.containerNode;
		this.inherited(arguments);
		this.domNode = oldNode;
	},
	resize: function(/*Object?*/size){
        // resize the window
        if(size){
            dojo.style(this.domNode, {
                width: size.width,
                height: size.height
            });
            // offset the window size so that the container is the exact size specified
		    var calcWidth = this.domNode.offsetWidth;
		    var calcHeight = this.domNode.offsetHeight;
		    var bodyWidth = this.containerNode.offsetWidth;
		    var bodyHeight = this.containerNode.offsetHeight;
		    dojo.style(this.domNode, "width", ((calcWidth - bodyWidth)+calcWidth)+"px");
		    dojo.style(this.domNode, "height", ((calcHeight - bodyHeight)+calcHeight)+"px");
        }
		//hack so we don't have to deal with BorderContainer's method using this.domNode
		var oldNode = this.domNode;
		this.domNode = this.containerNode;
		this.inherited(arguments);
		this.domNode = oldNode;
		dojo.forEach(this.getChildren(), function(wid){
            if(typeof wid != "undefined" && typeof wid.resize == "function")
                wid.resize();
        });
	},
	_onResize: function(e){
		//	summary:
		//		Event handler. Resizes the window when the screen is resized.
		if(this.maximized && !this.minimized){
			var max = desktop.ui._area.getBox();
			var c = dojo.coords(this.domNode);
			var v = dijit.getViewport();
            dojo.style(this.domNode, {
                width: (v.w - max.L - max.R)+"px",
                height: (v.h - max.T - max.B)+"px"
            });
		}
		else if(this.maximized && this.minimized){
			var max = desktop.ui._area.getBox();
			var v = dijit.getViewport();
			this.pos.width = v.w - max.L - max.R;
			this.pos.height = v.h - max.T - max.B;
		}
		this.resize();
	},
	startup: function(){
		//	summary:
		//		starts the widget up
		if(this._started) return;
		this.inherited(arguments);
		//this.resize();
		this._started = true;
	}
});
