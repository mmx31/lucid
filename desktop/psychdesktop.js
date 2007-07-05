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
* Contains all the functions of the desktop
*
* @classDescription	Contains all the functions of the desktop
* @constructor	
*/
var desktop = new Object();

var PsychDesktop = {
  require: function(libraryName, version) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
	if(version == "1.7") document.write('<script type="application/javascript;version=1.7" src="'+libraryName+'"></script>');
	else document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
  },
  link: function(file, id)
  {
  	document.write('<link id="'+id+'" rel="stylesheet" href="'+file+'" type="text/css" media="screen" />');
  },
  load: function() {
 PsychDesktop.require('api.js');
 PsychDesktop.require('app.js');
 PsychDesktop.require('console.js');
 PsychDesktop.require('icon.js');
 PsychDesktop.require('menu.js');
 PsychDesktop.require('rightclick.js');
 PsychDesktop.require('screensaver.js');
 PsychDesktop.require('taskbar.js');
 PsychDesktop.require('thread.js', "1.7");
 PsychDesktop.require('wallpaper.js');
 PsychDesktop.require('widget.js');
 PsychDesktop.require('windows.js');
 PsychDesktop.require('desktop.js');
 PsychDesktop.link("./themes/default/theme.css", "desktop_theme");
 PsychDesktop.link("./themes/default/window.css", "window_theme");
 PsychDesktop.link("desktop.css", "corestyle");
}
}
PsychDesktop.load();