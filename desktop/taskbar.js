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
			//appbarcontent = "&nbsp;";
			appbarcontent = '<div id="appbar" style="width: 75%; height: 100%; background-color: transparent; border:0px; top: 0px;"></div>';
			dojo.byId("taskbar").innerHTML='<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="30"><img src="./icons/apps.gif" onmousedown ="desktop.menu.button();" border="0"></td><td width="1%"><div class="seperator"></div></td><td width="80%">'+appbarcontent+'</td><td width="1%"><div class="seperator"></div></td><td width="15%"></td></tr><table>';
			//dojo.widget.createWidget("contentPane", {id: "appbar"}, dojo.byId("appbar"));

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
	/*
dojo.widget.defineWidget(
	"desktop.widget.pdTaskBar",
	dojo.widget.contentPane,
	function(){
		this._addChildStack = [];
	},
{
	// summary:
	//	Displays an icon for each associated floating pane, like Windows task bar

	// TODO: this class extends floating pane merely to get the shadow;
	//	it should extend HtmlWidget and then just call the shadow code directly

	addChild: function(child) {
		// summary: add taskbar item for specified FloatingPane
		// TODO: this should not be called addChild(), as that has another meaning.
		if(!this.containerNode){ 
			this._addChildStack.push(child);
		}else if(this._addChildStack.length > 0){
			var oarr = this._addChildStack;
			this._addChildStack = [];
			dojo.lang.forEach(oarr, this.addChild, this);
		}
		var tbi = dojo.widget.createWidget("TaskBarItem",
			{	windowId: child.widgetId, 
				caption: child.title, 
				iconSrc: child.iconSrc
			});
		dojo.widget.pdTaskBar.superclass.addChild.call(this,tbi);
	}
}); */