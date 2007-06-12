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
|       Taskbar Engine       |
|   (c) 2006 Psych Designs   |
\***************************/ 
desktop.taskbar = new function()
	{
		this.visibility = "show";
		
		this.hider = function()
		{
			if(this.visibility == "show")
			{
				//new Effect.Fade('taskbar');
				dojo.lfx.html.fadeOut('taskbar', 300).play();
				this.visibility = "hide";
				document.getElementById("taskbarhider").innerHTML='<img src="./icons/showtask.gif">';
				if(this.visibility == "open")
				{
					//menubutton();
				}
			}
			else
			{
				if(this.visibility == "hide")
				{
					//new Effect.Appear('taskbar');
					dojo.lfx.html.fadeIn('taskbar', 300).play();
					this.visibility = "show";
					document.getElementById("taskbarhider").innerHTML='<img src="./icons/hidetask.gif">';
				}
			}
			desktop.windows.desktopResize();
		}
		
		this.draw = function()
		{
			appbarcontent = "&nbsp;";
			//appbarcontent = '<div dojoType="TaskBar" id="appbar"></div>';
			setTimeout("document.getElementById(\"taskbar\").innerHTML='<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr><td width=\"30\"><img src=\"./icons/apps.gif\" onmousedown =\"desktop.menu.button();\" border=\"0\"></td><td width=\"1%\"><div class=\"seperator\"></div></td><td>"+appbarcontent+"</td><td width=\"1%\"><div class=\"seperator\"></div></td><td width=\"15%\"></td></tr><table>';", 100);
			
			/*
			bar=document.createElement("div");
			bar.ID="appbar";
			bar.style.height="50px";
			bar.style.width="80%";
			document.body.appendChild(bar);
			widget = dojo.widget.createWidget("TaskBar", {hasShadow: false, resizable: false}, bar);
			*/
		}
	}