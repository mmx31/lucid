/**
* Contains all the context menu functions of the desktop
* 
* @classDescription	Contains all the context menu functions of the desktop
* @memberOf desktop
* @constructor	
*/
desktop.rightclick = new function()
{
	/** 
	* Sets up the context menus for each desktop element
	* 
	* @alias desktop.rightclick.init
	* @type {Function}
	* @memberOf desktop.rightclick
	*/
	this.init = function()
	{
		this.menu = new dijit.PopupMenuItem({targetNodeIds: ["windowcontainer", "taskbar", "taskbarhider"], children: [
			new dijit.MenuItem({caption: "right click"})
		]});
		////this.menu.addChild(new dijit.MenuItem({caption: "right click"}));
		//this.menu = dojo.widget.createWidget("PopupMenu2", {targetNodeIds: ["windowcontainer", "taskbar", "taskbarhider"]});
		//this.menu.addChild(dojo.widget.createWidget("MenuItem2", {caption: "right click"}));
	}
}
