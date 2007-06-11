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
/****************************\
|        Psych Desktop       |
|    Window Engine Library   |
|   (c) 2006 Psych Designs   |
\****************************/ 

window.onresize = desktop.windows.desktopResize;
setTimeout("desktop.windows.desktopResize();", 1500);
dojo.lang.extend(desktop, {
	windows: function()
	{
		this.windowcounter = 0;
		this.desktopResize = function()
		{
			if(document.body.clientWidth) { x=document.body.clientWidth }
			if(window.innerWidth) { x=window.innerWidth }
			if(document.body.clientHeight) { y=document.body.clientHeight }
			if(window.innerHeight) { y=window.innerHeight }
			document.getElementById("windowcontainer").style.width= x;
			if(taskbarvisibility == "show")
			{
				document.getElementById("windowcontainer").style.height= y-35;
			}
			else
			{
				document.getElementById("windowcontainer").style.height= y;
			}
		}
	}
});