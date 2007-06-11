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
|      Wallpaper Engine      |
|   (c) 2006 Psych Designs   |
\***************************/

dojo.lang.extend(desktop, {
	wallpaper: function()
	{
		this.loadPrefs = function()
		{
			api.registry.getValue(0, "bgimg", setWallpaper);
			api.registry.getValue(0, "bgcolor", setWallpaperColor);
		}
		
		this.set = function(image)
		{
			if(image)
			{
				setTimeout("document.getElementById(\"wallpaper\").innerHTML=\"<img width='100%' height='100%' src='"+image+"'>\";", 100);
			}
			else
			{
				document.getElementById("wallpaper").innerHTML="&nbsp;";
			}
		}

		this.setColor = function(color)
		{
			if( document.documentElement && document.documentElement.style ) {
			    document.documentElement.style.backgroundColor = color; }
			if( document.body && document.body.style ) {
			    document.body.style.backgroundColor = color; }
			    document.bgColor = color;
		}
	}
});