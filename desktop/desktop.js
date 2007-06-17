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
|         Main script        |
|   (c) 2006 Psych Designs   |
\****************************/

desktop.core = new function()
	{
		this.init = function()
		{
		    dojo.require("dojo.lfx.*");
			dojo.require("dojo.widget.*");
			dojo.require("dojo.widget.TaskBar");
			dojo.require("dojo.widget.LayoutContainer");
			dojo.require("dojo.widget.FloatingPane");
			dojo.require("dojo.widget.ResizeHandle");
			dojo.require("dojo.widget.DomWidget");
			dojo.require("dojo.widget.Toaster");
			dojo.lang.extend(dojo.widget.TaskBarItem, {
				templateCssPath: dojo.uri.Uri("./themes/default/taskbar.css"),
				templateCssString: ""
			});
			dojo.lang.extend(dojo.widget.FloatingPane, {
				templateCssPath: dojo.uri.Uri("./themes/default/window.css"),
				templateCssString: ""
			});
			desktop.taskbar.draw();
			desktop.menu.getApplications();
			desktop.wallpaper.loadPrefs();
			desktop.windows.desktopResize();
			window.onresize = desktop.windows.desktopResize;
			document.body.onmouseup = dojo.lang.hitch(desktop.menu, desktop.menu.leftclick);
			dojo.widget.createWidget("TaskBar", {id: "appbar", width: "100%", templateCssPath: dojo.uri.dojoUri("../themes/default/taskbar.css")}, dojo.byId("appbar"));
			dojo.byId("appbar_container").style.border="0px";
			dojo.byId("appbar_container").style.margin="2px";
			dojo.byId("appbar_container").style.backgroundColor="transparent";
			dojo.byId("appbar_container").style.padding="2px";
			dojo.byId("appbar_container").style.width="100%";
			dojo.byId("appbar_container").style.height="100%";
			dojo.byId("appbar_container").style.overflow="hidden";
			api.registry.getValue(-1,"taskbarVisibility",desktop.taskbar.setVisibility);
			api.user.getUserName(function(data){
				dojo.byId("menu_name").innerHTML = "<i>"+data+"</i>";
			});
			window.onbeforeunload = function()
			{
			  desktop.core.logout();
			  return "To exit Psych Desktop properly, you should log out.";
			}
			document.onkeydown = desktop.core.toggleconsole;
		}
		dojo.addOnLoad(this.init);
		this.debug = function()
		{
				win = new api.window;
				win.write("<input type='text' id='eval' /><input type='button' onClick = 'eval(dojo.byId(\"eval\").value);' />");
				win.height="57px";
				win.width="208px";
				win.title="debug";
				win.show();
		}
		this.logout = function()
		{
			api.user.getUserName(function(data){
				dojo.io.bind({
    				url: "../backend/logout.php?user="+data,
    				load: function(type, data, evt){
						if(data == "0")
						{
							window.onbeforeunload = null;
							window.close();
						}
						else
						{
							api.toaster("Error communicating with server, could not log out");
						}
					},
   					mimetype: "text/plain"
				});
			});
		}
		this.loadingIndicator = function(action)
		{
			if(action == 0)
			{
			//Effect.Appear("loadingIndicator");
			dojo.lfx.html.fadeIn('loadingIndicator', 300).play();
			document.getElementById("loadingIndicator").style.display = "inline";
			}
			if(action == 1)
			{
			//Effect.Fade("loadingIndicator");
			dojo.lfx.html.fadeOut('loadingIndicator', 300).play();
			document.getElementById("loadingIndicator").style.display = "none";
			}
		}
		this.toggleconsole = function(e)
		{
			if (document.all)
		    {
		    	var evnt = window.event;
		        x = evnt.keyCode;
		    }
		    else
		    {
		    	x = e.keyCode;
		    }
			if(x == "192")
			{
				if(dojo.byId("console").style.display == "block")
				{
					dojo.byId("console").style.display = "none";
				}
				else
				{
					dojo.byId("console").style.display = "block";
					setTimeout("dojo.byId('consoleinput').focus();", 400);
				}
			}
		}
		this.consoleHistory = new Array();
		this.consoleHistory[0] = " ";
		this.consoleHist = 1;
		this.consoleAliases = {
			clear: function(params)
			{
				dojo.byId('consoleoutput').innerHTML = '';
			},
			logout: function(params)
			{
				desktop.core.logout();
			},
			exit: function(params)
			{
				this.toggleconsole();
			},
			reload: function(params)
			{
				window.onbeforeunload = null;
				window.location = window.location;
			},
			help: function()
			{
				api.console("--Psych Desktop Console--<br />");
				api.console("You can type any javascript you want to evaluate into this.<br />");
				api.console("Or, you can use these commands:<br />");
				api.console("&nbsp;&nbsp;reload- reload the desktop without logging out<br />");
				api.console("&nbsp;&nbsp;clear- clear the screen<br />");
				api.console("&nbsp;&nbsp;logout- logs you out of the desktop<br />");
				api.console("&nbsp;&nbsp;exit- close the console<br />");
			}
		}
		this.consoleKey = function(e)
		{
			if(e.keyCode == "38") //up arrow
			{
				if(this.consoleHistory[this.consoleHist-1] != undefined && this.consoleHist != 1)
				{
					this.consoleHist--;
					if(this.consoleHist != this.consoleHistory.length) dojo.byId('consoleinput').value = this.consoleHistory[this.consoleHist];
					else this.consoleHist++;
				}
			}
			if(e.keyCode == "40") //down arrow
			{
				if(this.consoleHist != this.consoleHistory.length)
				{
					if(this.consoleHist+1 >= this.consoleHistory.length)
					{
						this.consoleHist = this.consoleHistory.length;
						if(this.consoleHistory[0] == " ") dojo.byId('consoleinput').value = "";
						else dojo.byId('consoleinput').value = this.consoleHistory[0];
					}
					else
					{
						this.consoleHist++;
						if(this.consoleHistory[this.consoleHist] == " ") dojo.byId('consoleinput').value = "";
						else dojo.byId('consoleinput').value = this.consoleHistory[this.consoleHist];
					}
				}
			}
		}
		this.consolesubmit = function()
		{
			if(dojo.byId('consoleinput').value == undefined) dojo.byId('consoleinput').value = " ";
			this.consoleHistory[this.consoleHistory.length] = dojo.byId('consoleinput').value;
			this.consoleHist = this.consoleHistory.length;
			try{
				dojo.byId('consoleoutput').innerHTML += '<b>~$ </b>'+dojo.byId('consoleinput').value+'<br />';
				if(this.consoleAliases[dojo.byId('consoleinput').value.split(" ")[0]] == undefined) eval(dojo.byId('consoleinput').value);
				else
				{
					start = dojo.byId('consoleinput').value.indexOf(" ")+1;
					params = dojo.byId('consoleinput').value.substring(start);
					this.consoleAliases[dojo.byId('consoleinput').value.split(" ")[0]](params);
				}
				dojo.byId('consoleinput').value = '';
				dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
			}
			catch(e){
				if(e==undefined)
				{
					e='An unknown error has occurred';
					dojo.byId('consoleoutput').innerHTML += e+'<br />\n';
					dojo.byId('consoleinput').value = '';
					this.consoleHist = this.consoleHistory.length;
				}
				else
				{
					dojo.byId('consoleoutput').innerHTML += e+'<br />\n';
					dojo.byId('consoleinput').value = '';
					this.consoleHist = this.consoleHistory.length;
				}
				dojo.byId('console').scrollTop = dojo.byId('console').scrollHeight;
			}
		}
	}