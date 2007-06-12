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
|         Menu Engine        |
|   (c) 2006 Psych Designs   |
\***************************/ 

desktop.menu = new function()
	{
		this.visibility = "closed";
		this.clickcache = 0;
		this.sfHover = function() {
			var sfEls = document.getElementById("nav").getElementsByTagName("LI");
			for (var i=0; i<sfEls.length; i++) {
				sfEls[i].onmouseover=function() {
					this.className+=" sfhover";
				}
				sfEls[i].onmouseout=function() {
					this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
				}
			}
		}
		if (window.attachEvent) window.attachEvent("onload", dojo.lang.hitch(this, this.sfHover));

		this.leftclick = function()
		{
			if(this.clickcache == '1')
			{
				if(this.visibility=="open")
				{
					this.hide();
					this.visibility="closed";
					this.clickcache = 0;
				}
			}
			else
			{
				count=5;
				while(count != 0)
				{
					if(this.visibility=="open")
					{
						this.clickcache = 1;
					}
					count--;
				}
			}
		}
		
		this.button = function()
		{
			if(this.visibility == "closed")
			{
				//Effect.Appear('sysmenu',{duration: 0.6});
				document.getElementById("sysmenu").style.display = "inline";
				setTimeout("dojo.lfx.html.fadeIn('sysmenu', 300).play();", 100);
				this.visibility = "open";
			}
			else
			{
				if(this.visibility == "open")
				{
					//this.visibility = "closed";
				}
			}
		}
		
		this.hide = function()
		{
		//new Effect.Fade('sysmenu',{duration: 0.6});
		dojo.lfx.html.fadeOut('sysmenu', 300).play();
		setTimeout('document.getElementById("sysmenu").style.display = "none";', 350);
		}
		
		//           AJAX Stuff         \\
		
		//this should probably be under menu.js, but whatever...
		this.getApplications = function() {
		desktop.core.loadingIndicator(0);
		var url = "../backend/app.php?action=getPrograms";
		dojo.io.bind({
		    url: url,
		    load: dojo.lang.hitch(this, this.AppListState),
		    error: function(type, data, evt) { desktop.core.loadingIndicator(1) },
		    mimetype: "text/plain"
		});
		}
		
		this.AppListState = function(type, data, evt){
		app_return = data;
		html = '<ul id="nav">';
		rawcode = app_return.split(desktop.app.xml_seperator);
		app_amount = rawcode.length;
		app_amount--;
		app_amount = app_amount/3;
		var x = 0;
		var y = 0;
		var z = 1;
		office_id = new Array();
		office_name = new Array();
		office_count = 0;
		system_id = new Array();
		system_name = new Array();
		system_count = 0;
		internet_id = new Array();
		internet_name = new Array();
		internet_count = 0;
		while (x <= app_amount)
		{
			var app_id = rawcode[y];
			var app_name = rawcode[z];
			var app_category = rawcode[z+1];
			switch(app_category)
			{
				case "Office":
					office_id[office_id.length] = app_id;
					office_name[office_name.length] = app_name;
				break;
				case "System":
					system_id[system_id.length] = app_id;
					system_name[system_name.length] = app_name;			
				break;
				case "Internet":
					internet_id[internet_id.length] = app_id;
					internet_name[internet_name.length] = app_name;
					internet_count++;			
				break;
			}
			x++;
			y++; y++; y++;
			z++; z++; z++;
		}
		html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./images/icons/applications-office.png" />&nbsp;Office<ul>';
		for(count=0;count<=office_id.length-1;count++)
		{
			html += '<li onClick="javascript:desktop.app.launch('+office_id[count]+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+office_name[count]+'</li>';
		}
		html += '</ul>';
		html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./images/icons/applications-internet.png" />&nbsp;Internet<ul>';
		for(count=0;count<=internet_id.length-1;count++)
		{
			html += '<li onClick="javascript:desktop.app.launch('+internet_id[count]+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+internet_name[count]+'</li>';
		}
		html += '</ul>';
		html += '<li style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./images/icons/preferences-system.png" />&nbsp;System<ul>';
		for(count=0;count<=system_id.length-1;count++)
		{
			html += '<li onClick="javascript:desktop.app.launch('+system_id[count]+');" style="border-top: 1px solid white; border-bottom: 1px solid white;">'+system_name[count]+'</li>';
		}
		html += '</ul>';
		html += '<li onClick="javascript:desktop.core.logout();" style="border-top: 1px solid white; border-bottom: 1px solid white;"><img src="./images/icons/system-log-out.png" />&nbsp;Logout</li>';
		html += '</ul>';
		
		document.getElementById("menu").innerHTML = html;
		desktop.core.loadingIndicator(1);
		}
	}