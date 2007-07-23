/**
 * A counter for assigning window IDs
 * 
 * @type {Integer}
 * @memberOf api
 */
api.windowcounter = 0;
/** 
* The window constructor
* 
* @memberOf api
* @constructor
*/
api.window = function()
{
	/**
	 * A unique ID for the window
	 * 
	 * @type {String}
	 * @alias api.window.id
	 * @memberOf api.window
	 */
	this._id = "win"+api.windowcounter;
	api.windowcounter++;
	/**
	 * The window's contents
	 * 
	 * @type {String}
	 * @alias api.window._innerHTML
	 * @memberOf api.window
	 */
	this._innerHTML = "";
	/**
	 * The window body's widget type (usefull for things like layout container creation)
	 * 
	 * @type {Object}
	 * @alias api.window.bodyWidget
	 * @memberOf api.window
	 */
	this.bodyWidget = "LayoutContainer";
	/**
	 * The window body's widget params
	 * 
	 * @type {Object}
	 * @alias api.window.bodyWidgetParams
	 * @memberOf api.window
	 */
	this.bodyWidgetParams = {};
	/**
	 * Whether or not the window is maximized
	 * 
	 * @type {Boolean}
	 * @alias api.window.maximized
	 * @memberOf api.window
	 */
	this.maximized = false;
	/**
	 * The window's height in px, or %.
	 * 
	 * @type {String}
	 * @alias api.window.height
	 * @memberOf api.window
	 */
	this.height = "400px";
	/**
	 * The windows width in px, or %.
	 * 
	 * @type {String}
	 * @alias api.window.width
	 * @memberOf api.window
	 */
	this.width = "500px";
	/**
	 * The window's title
	 * 
	 * @type {String}
	 * @alias api.window.title
	 * @memberOf api.window
	 */
	this.title = "";
	/**
	 * Weather or not the window is resizable.
	 * 
	 * @type {Boolean}
	 * @alias api.window.resizable
	 * @memberOf api.window
	 */
	this.resizable = true;
	/**
	 * Internal variable used by the window maximizer
	 * 
	 * @type {Object}
	 * @alias api.window.pos
	 * @memberOf api.window
	 */
	this.pos = new Object();
	/** 
	* Emptys the window's contents
	* 
	* @method
	* @alias api.window.empty
	* @memberOf api.window
	*/
	this.empty = function()
	{
		this._innerHTML = "";
		if(document.getElementById(this._id+"body"))
		{
			document.getElementById(this._id+"body").innerHTML = "";
		}
	}
	/** 
	* Writes HTML to the window
	* 
	* @method
	* @param {String} string	the HTML to append to the window
	* @alias api.window.write
	* @memberOf api.window
	*/
	this.write = function(string)
	{
		this._innerHTML += string;
		if(document.getElementById(this._id+"body"))
		{
			document.getElementById(this._id+"body").innerHTML += string;
		}		
	}
	/** 
	* Shows the window
	* 
	* @method
	* @alias api.window.show
	* @memberOf api.window
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
			windiv.setAttribute("class", "win");
			
			wintitlebar = document.createElement("div");
			wintitlebar.id = this._id+"titlebar";
			wintitlebar.setAttribute("class", "wintitlebar");
			
			winrightcorner = document.createElement("div");
			winrightcorner.setAttribute("class", "winrightcorner");
			wintitlebar.appendChild(winrightcorner);
			
			winleftcorner = document.createElement("div");
			winleftcorner.setAttribute("class", "winleftcorner");
			wintitlebar.appendChild(winleftcorner);
			
			winhandle = document.createElement("div");
			winhandle.id = this._id+"handle";
			winhandle.innerHTML = this.title;
			winhandle.setAttribute("class", "winhandle");
			wintitlebar.appendChild(winhandle);
	
			winbuttons = document.createElement("div");
			winbuttons.id = this._id+"buttons";
			winbuttons.style.position="absolute";
			winbuttons.setAttribute("class", "winbuttons");
				
				closebutton = document.createElement("div");
				closebutton.id = this._id+"closebutton";
				closebutton.setAttribute("class", "winbuttonclose");
				winbuttons.appendChild(closebutton);
				
				maximizebutton = document.createElement("div");
				maximizebutton.id = this._id+"closebutton";
				maximizebutton.setAttribute("class", "winbuttonmaximize");
				winbuttons.appendChild(maximizebutton);
				
				minimizebutton = document.createElement("div");
				minimizebutton.id = this._id+"closebutton";
				minimizebutton.setAttribute("class", "winbuttonminimize");
				winbuttons.appendChild(minimizebutton);
				
			wintitlebar.appendChild(winbuttons);
			
			windiv.appendChild(wintitlebar);
			
			winbody=document.createElement("div");
			winbody.id=this._id+"body";
			winbody.innerHTML=this._innerHTML;
			winbody.setAttribute("class", "winbody");
			
			windiv.appendChild(winbody);
			
			if(this.resizable == true)
			{
				winresize = document.createElement("div");
				winresize.id=this._id+"resize";
				winresize.setAttribute("class", "winresize")
				windiv.appendChild(winresize);
			}
			document.getElementById("windowcontainer").appendChild(windiv);
			
			this.bodyWidgetParams.id = this._id+"body";
			this.body = new dijit.layout[this.bodyWidget](this.bodyWidgetParams, winbody);
			
			this._drag = new dojo.dnd.Moveable(this._id, {
				handle: this._id+"handle",
				mover: dojo.dnd.parentConstrainedMover("border", true)
			});
			if(this.resizable == true)
			{
				this._resize = new dojo.dnd.Moveable(this._id+"resize", {});
				//TODO: figure out a way that we can get it so it will resize during the drag
				dojo.subscribe("dndMoveStop",dojo.hitch(this, function(elem){
					if(elem.id ==  this._id+"resize")
					{
						var dragger = dojo.byId(this._id+"resize");
						var win = dojo.byId(this._id);
						var y = dragger.style.top.replace(/px/g, "");
						var x = dragger.style.left.replace(/px/g, "");
						y = parseInt(y)+5;
						x = parseInt(x)+5;
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
						var top = win.style.top.replace(/px/g, "");
						var left = win.style.left.replace(/px/g, "");
						top = parseInt(top);
						left = parseInt(left);
						var winx = left+width;
						var winy = top+height;
						console.log(width+"+("+(x-winx)+")");
						win.style.width = (winx+(x-winx))+"px";
						win.style.height = (winy+(y-winy))+"px";
					}
				}));
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
	/** 
	* Minimizes the window to the taskbar
	* 
	* @method
	* @alias api.window.minimize
	* @memberOf api.window
	* @return {Boolean}	returns true if it had to be rased, false if it was allready on top.
	*/
	this.minimize = function()
	{
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
			dojo.connect(anim, "onEnd", null, dojo.hitch(this, function() {
				dojo.byId(this._id).style.display = "none";
			}));
			anim.play();
		}
		else
		{
			dojo.style(this._id, "opacity", 100)
			dojo.byId(this._id).style.display = "none";
		}
	}
	/** 
	* Restores the window from the taskbar
	* 
	* @method
	* @alias api.window.restore
	* @memberOf api.window
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
	/** 
	* Maximizes the window
	* 
	* @method
	* @alias api.window.maximize
	* @memberOf api.window
	*/
	this.maximize = function()
	{
		this.maximized = true;
		this._drag.destroy();
		if(this.resizable == true)
		{
			this._resize.destroy();
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
			dojo.animateProperty({
				node: win,
				properties: {
					top: {end: 0},
					left: {end: 0},
					width: {end: dojo.byId(this._id).parentNode.style.width.replace(/px/g, "")},
					height: {end: dojo.byId(this._id).parentNode.style.height.replace(/px/g, "")}
				},
				duration: 150
			}).play();
		}
		else
		{
			api.console("maximizing...");
			win.style.top = "0px";
			win.style.left = "0px";
			win.style.width = "100%";
			win.style.height = "100%";
		}
	}
	/** 
	* UnMaximizes the window
	* 
	* @method
	* @alias api.window.umaximize
	* @memberOf api.window
	*/
	this.unmaximize = function()
	{
		if(this.resizable == true)
		{		
			this._resize = new dojo.dnd.Moveable(this._id+"resize", {});
		}
		this._drag = new dojo.dnd.Moveable(this._id, {
			handle: this._id+"handle",
			mover: dojo.dnd.parentConstrainedMover("border", true)
		});
		var win = dojo.byId(this._id);
		if(desktop.config.fx == true)
		{
			dojo.animateProperty({
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
			}).play();
		}
		else
		{
			win.style.top = this.pos.top;
			win.style.bottom = this.pos.bottom;
			win.style.left = this.pos.left;
			win.style.right = this.pos.right;
			win.style.height= this.pos.height;
			win.style.width= this.pos.width;
		}
		this.maximized = false;
	}
	/** 
	* Brings the window to the front of the stack
	* 
	* @method
	* @alias api.window.bringToFront
	* @memberOf api.window
	* @return {Boolean}	returns false if it had to be rased, true if it was allready on top.
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
		if(desktop.config.debug == true) api.console(maxZindex+" != "+zindex);
		if(maxZindex != zindex)
		{
			maxZindex++;
			dojo.style(this._id, "zIndex", maxZindex);
			return false;
		}
		else return true;
	}
	/** 
	* Destroys the window (or closes it)
	* 
	* @method
	* @alias api.window.destroy
	* @memberOf api.window
	*/
	this.destroy = function()
	{
		var anim = dojo.fadeOut({ node: this._id, duration: 200 });
		dojo.connect(anim, "onEnd", null, dojo.hitch(this, function() {
			this._drag.destroy();
			if(dojo.byId(this._id)) { dojo.byId(this._id).parentNode.removeChild(dojo.byId(this._id)); }
			else { api.console("Warning in app: No window shown."); }
		}));
		this._task.destroy();
		anim.play();
	}
	/** 
	* Adds a dojo widget or HTML element to the window.
	* 
	* @method
	* @param {Node} node	A dojo widget or HTML element.
	* @alias api.window.addChild
	* @memberOf api.window
	*/
	this.addChild = function(node)
	{
		dijit.byId(this._id+"body").addChild(node);
	}
}