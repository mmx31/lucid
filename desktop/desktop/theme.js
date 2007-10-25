/*
	Psych Desktop
	Copyright (C) 2006 Psychiccyberfreak

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; version 2 of the License.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along
	with this program; if not, write to the Free Software Foundation, Inc.,
	51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

desktop.theme = new function()
{
	this.init = function()
	{
		dojo.addClass(document.body, "tundra");
		var element = document.createElement("link");
		element.rel = "stylesheet";
		element.type = "text/css";
		element.media = "screen";
		element.href = "./themes/"+(desktop.config.theme ? desktop.config.theme : "green")+"/theme.css";
		element.id = "desktop_theme";
		document.getElementsByTagName("head")[0].appendChild(element);
	}
	this.set = function(theme)
	{
		desktop.config.theme = theme;
		dojo.byId("desktop_theme").href ="./themes/"+desktop.config.theme+"/theme.css";
	}
	this.list = function(callback)
	{
		dojo.xhrGet({
			url: "../backend/theme.php",
			load: function(data, ioArgs)
			{
				data = data.split("\n");
				callback(data);
			}
		});
	}
}