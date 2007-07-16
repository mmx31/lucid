/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
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
