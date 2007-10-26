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
		new dijit.layout.ContentPane({id: "windowcontainer"}, div);
		//dojo.widget.createWidget("ContentPane", {id: "windowcontainer"}, div);
		document.body.appendChild(div);
	}
	this.init = this.desktopResize;
}
