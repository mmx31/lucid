/**
* The window manager
* 
* @memberOf desktop
* @constructor	
*/
desktop.windows = new function()
{
	/**
	 * Provides a counter for making window IDs and such
	 * 
	 * @type {Integer}
	 * @alias desktop.windows.windowcounter
	 * @memberOf desktop.windows
	 */
	this.windowcounter = 0;
	/** 
	* Triggered when the window the desktop is in is resized. 
	* It fixes the window container element's size to fit the window the desktop is in.
	* TODO: for some reason it does not work any more.
	* 
	* @type {Function}
	* @alias desktop.windows.desktopResize
	* @memberOf desktop.windows
	*/
	this.desktopResize = function()
	{
		api.console("resizing desktop...");
		var x;
		var y;
		if(document.body.clientWidth) { x=document.body.clientWidth }
		else if(window.innerWidth) { x=window.innerWidth }
		if(document.body.clientHeight) { y=document.body.clientHeight }
		else if(window.innerHeight) { y=window.innerHeight }
		document.getElementById("windowcontainer").style.width= x;
		if(desktop.config.taskbar.isShown == true) y = y-35;
		if(desktop.config.fx == true)
		{
			dojo.animateProperty({
				node: "windowcontainer",
				properties: { height: { end: y }, width: { end: x } },
				duration: 150
			}).play();
		}
		else
		{
			dojo.byId("windowcontainer").style.height= y;
			dojo.byId("windowcontainer").style.width= x;
		}
		api.console("x: "+x+", y:"+y)
	}
	
	/** 
	* Draws the elements needed for the window manager
	* 
	* @type {Function}
	* @alias desktop.windows.init
	* @memberOf desktop.windows
	*/
	this.draw = function()
	{
		div = document.createElement("div");
		div.id="windowcontainer";
		div.style.overflow="hidden";
		var winc=new dijit.layout.ContentPane({id: "windowcontainer"}, div);
		//dojo.widget.createWidget("ContentPane", {id: "windowcontainer"}, div);
		var filearea = new api.filearea({path: "/Desktop/", textShadow: true, subdirs: false, style: "width: 100%; height: 100%;", overflow: "hidden"});
		filearea.menu.addChild(new dijit.MenuItem({label:"Desktop Options", disabled:true}));
		filearea.menu.addChild(new dijit.MenuItem({label:"Customize Settings", onClick: function() { desktop.app.launch(3) }}));
		filearea.menu.addChild(new dijit.MenuItem({label: "Log Out", iconClass: "icon-16-actions-system-log-out",onClick: desktop.core.logout}));
		filearea.refresh();
		winc.domNode.appendChild(filearea.domNode);
		document.body.appendChild(div);
	}
	this.init = this.desktopResize;
}
