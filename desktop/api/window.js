api.windowcounter = 0;
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
 * 		win.write("bar");
 * 		//you can't use addChild before the window is shown...
 * 		win.show();
 * 		widget = new dijit.layout.ContentPane();
 * 		widget.setContent("baz");
 * 		win.addChild(widget, true);
 * 		setTimeout(dojo.hitch(win, win.destroy), 1000*5);
 * 		(end code)
 */
api.window = function(params)
{
	if(typeof params != "object") params = {};
	/*
	 * Property: _id
	 *
	 * Summary:
	 * 		A unique ID for the window
	 */
	this._id = "win"+api.windowcounter;
	api.windowcounter++;
	/*
	 * Property: _innerHTML
	 * 
	 * Summary:
	 * 		The window's contents. Use <window.write> to write content to a window.
	 */
	this._innerHTML = ((typeof params.innerHTML == "string") ? params.innerHTML : "");
	/*
	 * Property: destroyed
	 * 
	 * Summary:
	 * 		Is the window destroyed?
	 */
	this.destroyed = false;
	/*
	 * Property: onDestroy
	 * 
	 * Summary:
	 * 		What to do upon destroy of window
	 */
	this.onDestroy = "NONE";
	/*
	 * Property: onMinimize
	 * 
	 * Summary:
	 * 		What to do upon minimize of window
	 */
	this.onMinimize = "NONE";
	/*
	 * Property: onMaximize
	 * 
	 * Summary:
	 * 		What to do upon maximize of window
	 */
	this.onMaximize = "NONE";
	/*
	 * Property: showMaximize
	 * 
	 * Summary:
	 * 		Show whether or not to show the maximize button
	 */
	this.showMaximize = true;
	/*
	 * Property: showMinimize
	 * 
	 * Summary:
	 * 		Show whether or not to show the minimize button
	 */
	this.showMinimize = true;
	/*
	 * Property: showClose
	 * 
	 * Summary:
	 * 		Show whether or not to show the close button
	 */
	this.showClose = true;
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
	this.bodyWidget = ((typeof params.bodyWidget == "string") ? params.bodyWidget : "ContentPane");
	 /*
	 * Property: bodyWidgetParams
	 * 
	 * Summary:
	 * 		The window body's widget params
	 */
	this.bodyWidgetParams = ((typeof params.bodyWidgetParams == "object") ? params.bodyWidgetParams : {});
	/*
	 * Property: maximized
	 * 
	 * Summary:
	 * 		Whether or not the window is maximized
	 * 		To set this after window creation, use <window.setBodyWidget>
	 */
	this.maximized = ((typeof params.maximized == "boolean") ? params.maximized : false);
	/*
	 * Property: height
	 * 
	 * Summary:
	 * 		The window's height in px, or %.
	 */
	this.height = ((typeof params.height == "string") ? params.height : "400px");
	/*
	 * Property: width
	 * 
	 * Summary:
	 * 		The window's width in px, or %.
	 */
	this.width = ((typeof params.width == "string") ? params.width : "500px");
	/*
	 * Property: title
	 * 
	 * Summary:
	 * 		The window's title
	 */
	this.title = ((typeof params.title == "string") ? params.title : "");
	/*
	 * Property: resizable
	 * 
	 * Summary:
	 * 		Weather or not the window is resizable.
	 */
	this.resizable = ((typeof params.resizable != "undefined") ? params.resizable : true);
	for(p in params)
	{
		this[p] = params[p];
	}
	/*
	 * Property: pos
	 * 
	 * Summary:
	 * 		Internal variable used by the window maximizer
	 */
	this.pos = {};
	/*
	 * Property: body
	 * 
	 * Summary:
	 * 		The window's body widget
	 */
	this.body = new dijit.layout[this.bodyWidget](this.bodyWidgetParams, dojo.doc.createElement('div'));
	this.body.id=this._id+"body";
	/*
	 * Method: setBodyWidget
	 * 
	 * Summary:
	 * 		sets the body widget. Cannot use after the window has been shown.
	 * Parameters:
	 * 		widget - the body widget's name. must be a member of dijit.layout
	 * 		widgetParams - The body widget params
	 */
	this.setBodyWidget = function(widget, widgetParams)
	{
		this.bodyWidget = widget;
		this.bodyWidgetParams = widgetParams;
		this.bodyWidgetParams.id=this._id+"body";
		this.body = new dijit.layout[this.bodyWidget](this.bodyWidgetParams, dojo.doc.createElement('div'));
	};
	/*
	 * Method: empty
	 * 
	 * Summary:
	 * 		Emptys the window's contents
	 */
	this.empty = function()
	{
		this._innerHTML = "";
		if(document.getElementById(this._id+"body"))
		{
			document.getElementById(this._id+"body").innerHTML = "";
		}
	}
	/*
	 * Method: write
	 * 
	 * Summary:
	 * 		Writes HTML to the window
	 * 
	 * Parameters:
	 * 		string - the HTML to append to the window
	 */
	this.write = function(/*String*/string)
	{
		//TODO: would this interfere with addChild?
		this._innerHTML += string;
		if(this.bodyWidget == "ContentPane") this.body.setContent(this.body.domNode.innerHTML+string);
		else this.body.domNode.innerHTML += string;
	}
	/*
	 * Method: show
	 *  
	 * Summary:
	 * 		Shows the window
	 */
	this.show = function()
	{
		if(document.getElementById(this._id) == null) //dojo.byId allways seems to return an objecct...
		{
			windiv=document.createElement("div");
			windiv.id=this._id;
			windiv.style.width=this.width;
			windiv.style.height=this.height;
			windiv.style.top="50px";
			windiv.style.left="50px";
			windiv.style.zIndex=api.windowcounter+100;
			dojo.addClass(windiv, "win");			

			wintitlebar = document.createElement("div");
			wintitlebar.id = this._id+"titlebar";
			dojo.addClass(wintitlebar, "wintitlebar");			

			winrightcorner = document.createElement("div");
			dojo.addClass(winrightcorner, "winrightcorner");
			wintitlebar.appendChild(winrightcorner);
			
			winleftcorner = document.createElement("div");
			dojo.addClass(winleftcorner, "winleftcorner");
			wintitlebar.appendChild(winleftcorner);
			
			winhandle = document.createElement("div");
			winhandle.id = this._id+"handle";
			winhandle.innerHTML = this.title;
			dojo.addClass(winhandle, "winhandle");
			wintitlebar.appendChild(winhandle);
	
			winbuttons = document.createElement("div");
			winbuttons.id = this._id+"buttons";
			winbuttons.style.position="absolute";
			dojo.addClass(winbuttons, "winbuttons");
				
				closebutton = document.createElement("div");
				closebutton.id = this._id+"closebutton";
				dojo.addClass(closebutton, "winclosebutton");
				if(this.showClose) {
				winbuttons.appendChild(closebutton);
				}
				maximizebutton = document.createElement("div");
				maximizebutton.id = this._id+"maximizebutton";
				dojo.addClass(maximizebutton, "winbuttonmaximize");
				if(this.showMaximize) {
				winbuttons.appendChild(maximizebutton);
				}
				minimizebutton = document.createElement("div");
				minimizebutton.id = this._id+"minimizebutton";
				dojo.addClass(minimizebutton, "winbuttonminimize");
				if(this.showMinimize) {
				winbuttons.appendChild(minimizebutton);
				}
			wintitlebar.appendChild(winbuttons);
			
			windiv.appendChild(wintitlebar);
			
			this.body.id=this._id+"body";
			if(this.bodyWidget == "ContentPane") this.body.setContent(this._innerHTML);
			
			dojo.addClass(this.body.domNode, "winbody")
			
			windiv.appendChild(this.body.domNode);
			
			if(this.resizable == true)
			{
				winresize = document.createElement("div");
				winresize.id=this._id+"resize";
				dojo.addClass(winresize, "winresize");
				windiv.appendChild(winresize);
			}
			document.getElementById("windowcontainer").appendChild(windiv);
			
			//this.body.startup();
			//this.bodyWidgetParams.id = this._id+"body";
			//this.body = new dijit.layout[this.bodyWidget](this.bodyWidgetParams, this.winbody);
			
			this._drag = new dojo.dnd.Moveable(this._id, {
				handle: this._id+"handle",
				mover: dojo.dnd.parentConstrainedMover("border", true)
			});
			if(this.resizable == true)
			{
				this.makeResizer();
			}
			dojo.connect(closebutton, "onmouseup", dojo.hitch(this, this.destroy));
			dojo.connect(minimizebutton, "onmouseup", dojo.hitch(this, this.minimize));
			dojo.connect(maximizebutton, "onmouseup", dojo.hitch(this, function() {
				if(this.maximized == true) this.unmaximize();
				else this.maximize();
			}));
			dojo.connect(windiv, "onmousedown", dojo.hitch(this, this.bringToFront));
			dojo.connect(winhandle, "onmousedown", dojo.hitch(this, this.bringToFront));
			
			this._task = new desktop.taskbar.task({
				label: this.title,
				icon: this.icon,
				winid: this._id,
				onclick: dojo.hitch(this, function()
				{
					var s = dojo.byId(this._id).style.display;
					if(s == "none")
					{
						this.restore();
						this.bringToFront();
					}
					else
					{
						var ns = document.getElementById("windowcontainer").getElementsByTagName("div");
						var box;
						var myBox = new Object
						var overlapping = false;
						myBox.l = dojo.byId(this._id).style.left;
						myBox.t = dojo.byId(this._id).style.top;
						myBox.b = myBox.t + myBox.h;
						myBox.r = myBox.l + myBox.w;
						for(n = 0; n < ns.length; n++)
						{
							if(ns[n].id != this._id && (ns[n].style.display) != "none")
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
									if(desktop.config.debug == true) api.console("windows are overlapping!");
									overlapping = true;
									break;
								}
							}
						}
						var wasontop = this.bringToFront();
						if(desktop.config.debug == true) api.console("onTop: "+wasontop+" overlap: "+overlapping);
						if(overlapping == false)
						{
							this.minimize();
						}
						else if(wasontop == true)
						{
							this.minimize();
						}
					}
				})
			});
			if(this.maximized == true) this.maximize();
		}
	}
	/*
	 * Method: makeResizer
	 * 
	 * Summary:
	 * 		Internal method that makes a resizer for the window.
	 */
	this.makeResizer = function() {
		dojo.byId(this._id+"resize").style.cursor = "se-resize";
		this._resizeEvent = dojo.connect(dojo.byId(this._id+"resize"), "onmousedown", this, function(e) {
			this._dragging = dojo.connect(document, "onmousemove", this, function(f) {
				//TODO: use the computed style technique instead of this
				var win = dojo.byId(this._id);
				var x = f.clientX;
				var y = f.clientY;
				var width = win.style.width.replace(/px/g, "");
				var height = win.style.height.replace(/px/g, "");
				var t = width.indexOf("%");
				var s = height.indexOf("%");
				if((s != -1 && t != -1) ||
				   (s != -1 || t != -1))
				{
					width = parseInt(width);
					height = parseInt(height);
				}
				if(t != -1){
					width = width.replace(/%/g, "");
					width = (parseInt(win.parentNode.style.width.replace(/px/g, ""))/100)*width;
				}
				if(s != -1){
					height = height.replace(/%/g, "");
					height = (parseInt(win.parentNode.style.height.replace(/px/g, ""))/100)*height;
				}
				var top = win.style.top.replace(/px/g, "");
				var left = win.style.left.replace(/px/g, "");
				top = parseInt(top);
				left = parseInt(left);
				var winx = left+parseInt(width);
				var winy = top+parseInt(height);
				if(width >= 30 && height >= 30)
				{
					win.style.width = ((winx+(x-winx))-(left-2))+"px";
					win.style.height = ((winy+(y-winy))-(top-2))+"px";
				}
				else {
					win.style.width = "30px";
					win.style.height = "30px";
				}
			});
			if(desktop.config.fx === true) this._resizeBody();
			this._doconmouseup = dojo.connect(document, "onmouseup", this, function(e) {
				dojo.disconnect(this._dragging);
				dojo.disconnect(this._doconmouseup);
				this._resizeBody();
			});
		});
	}
	/*
	 * Method: killResizer
	 * 
	 * Summary:
	 * 		Internal method that gets rid of the resizer on the window.
	 */
	this.killResizer = function()
	{
		dojo.disconnect(this._dragging);
		dojo.disconnect(this._resizeEvent);
		dojo.disconnect(this._doconmouseup);
		dojo.byId(this._id+"resize").style.cursor = "default";
	}
	/* 
	 * Method: minimize
	 * 
	 * Summary:
	 * 		Minimizes the window to the taskbar
	 */
	this.minimize = function()
	{
		if(this.onMinimize != "NONE") {
		this.onMinimize();
		}
		if(desktop.config.fx == true)
		{
			var pos = dojo.coords(this._id, true);
			this.left = pos.x;
			this.top = pos.y;
			var win = dojo.byId(this._id);
			var width = win.style.width.replace(/px/g, "");
			var height = win.style.height.replace(/px/g, "");
			var t = width.indexOf("%");
			var s = height.indexOf("%");
			width = parseInt(width);
			height = parseInt(height);
			if(t != -1){
				width = width.replace(/%/g, "");
				width = (parseInt(win.parentNode.style.width.replace(/px/g, ""))/100)*width;
			}
			if(s != -1){
				height = height.replace(/%/g, "");
				height = (parseInt(win.parentNode.style.height.replace(/px/g, ""))/100)*height;
			}
			this._width = width;
			this._height = height;
			var pos = dojo.coords("task_"+this._id, true);
			
			var fade = dojo.fadeOut({ node: this._id, duration: 200 });
			var slide = dojo.fx.slideTo({ node: this._id, duration: 200, top: pos.y, left: pos.x});
			var squish = dojo.animateProperty({
				node: this._id,
				duration: 200,
				properties: {
					height: {end: 26}, //TODO: is there a way of detecting this?
					width: {end: 191} //and this?
				}
			});
			var anim = dojo.fx.combine([fade, slide, squish]);
			dojo.connect(anim, "onEnd", this, function() {
				dojo.byId(this._id).style.display = "none";
			});
			anim.play();
		}
		else
		{
			dojo.style(this._id, "opacity", 100)
			dojo.byId(this._id).style.display = "none";
		}
	}
	/*
	 * Method: restore
	 * 
	 * Summary:
	 * 		Restores the window from the taskbar
	 */
	this.restore = function()
	{
		dojo.byId(this._id).style.display = "inline";
		if(desktop.config.fx == true)
		{
			var fade = dojo.fadeIn({ node: this._id, duration: 200 });
			var slide = dojo.animateProperty({
				node: this._id,
				duration: 200,
				properties: {
					top: {end: this.top},
					left: {end: this.left},
					height: {end: this._height},
					width: {end: this._width}
				}
			});
			var anim = dojo.fx.combine([fade, slide]);
			anim.play();
		}
	}
	/*
	 * Method: maximize
	 * 
	 * Summary:
	 * 		Maximizes the window
	 */
	this.maximize = function()
	{
		if(this.onMaximize != "NONE") {
		this.onMaximize();
		}
		this.maximized = true;
		this._drag.destroy();
		if(this.resizable == true)
		{
			this.killResizer();
		}
		this.pos.top = dojo.byId(this._id).style.top.replace(/px/g, "");
		this.pos.bottom = dojo.byId(this._id).style.bottom.replace(/px/g, "");
		this.pos.left = dojo.byId(this._id).style.left.replace(/px/g, "");
		this.pos.right = dojo.byId(this._id).style.right.replace(/px/g, "");
		this.pos.width = dojo.byId(this._id).style.width.replace(/px/g, "");
		this.pos.height = dojo.byId(this._id).style.height.replace(/px/g, "");
		var win = dojo.byId(this._id);
		
		if(desktop.config.fx == true)
		{
			api.console("maximizing... (in style!)");
			//win.style.height= "auto";
			//win.style.width= "auto";
			//this._resizeBody();
			var anim = dojo.animateProperty({
				node: win,
				properties: {
					top: {end: 0},
					left: {end: 0},
					width: {end: dojo.byId(this._id).parentNode.style.width.replace(/px/g, "")},
					height: {end: dojo.byId(this._id).parentNode.style.height.replace(/px/g, "")}
				},
				duration: 150
			});
			dojo.connect(anim, "onEnd", this, function() {
				this._resizeBody();
			});
			anim.play();
		}
		else
		{
			api.console("maximizing...");
			win.style.top = "0px";
			win.style.left = "0px";
			win.style.width = "100%";
			win.style.height = "100%";
			this._resizeBody();
		}
	}
	/*
	 * Method: unmaximize
	 * Summary:
	 * 		UnMaximizes the window
	 */
	this.unmaximize = function()
	{
		this._drag = new dojo.dnd.Moveable(this._id, {
			handle: this._id+"handle",
			mover: dojo.dnd.parentConstrainedMover("border", true)
		});
		if(this.resizable == true)
		{		
			this.makeResizer();
		}
		var win = dojo.byId(this._id);
		if(desktop.config.fx == true)
		{
			var anim = dojo.animateProperty({
				node: win,
				properties: {
					top: {end: this.pos.top},
					left: {end: this.pos.left},
					right: {end: this.pos.right},
					bottom: {end: this.pos.bottom},
					width: {end: this.pos.width},
					height: {end: this.pos.height}
				},
				duration: 150
			});
			dojo.connect(anim, "onEnd", this, function() {
				this._resizeBody();
			});
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
			this._resizeBody();
		}
		this.maximized = false;
	}
	/*
	 * Method: unmaximize
	 * Summary:
	 * 		UnMaximizes the window
	 */
	this._resizeBody = function()
	{
		if(this.body.resize) this.body.resize();
		if(this.body.layout) this.body.layout();
	}
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
	this.bringToFront = function()
	{
		var ns = document.getElementById("windowcontainer").getElementsByTagName("div");
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
		zindex = dojo.byId(this._id).style.zIndex;
		if(desktop.config.debug == true) { api.console(maxZindex+" != "+zindex); }
		if(maxZindex != zindex)
		{
			maxZindex++;
			dojo.style(this._id, "zIndex", maxZindex);
			return false;
		}
		else return true;
	};
	/* 
	 * Method: destroy
	 * 
	 * Summary:
	 * 		Destroys the window (or closes it)
	 */
	this.destroy = function()
	{
		this.destroyed = true;
		if(this.onDestroy != "NONE") {
		this.onDestroy();
		}
		var anim = dojo.fadeOut({ node: this._id, duration: 200 });
		dojo.connect(anim, "onEnd", null, dojo.hitch(this, function() {
			this._drag.destroy();
			if(dojo.byId(this._id)) { dojo.byId(this._id).parentNode.removeChild(dojo.byId(this._id)); }
			else { api.console("Warning in app: No window shown."); }
		}));
		this._task.destroy();
		anim.play();
	}
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
	this.addChild = function(node)
	{
		this.body.addChild(node);
	};
	this.startup = function()
	{
		this.body.startup();
	};
};
