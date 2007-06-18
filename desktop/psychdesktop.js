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
var desktop = new Object();
var PsychDesktop = {
  require: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
  },
  load: function() {
 PsychDesktop.require('api.js');
 PsychDesktop.require('app.js');
 PsychDesktop.require('appbar.js');
 PsychDesktop.require('console.js');
 PsychDesktop.require('icon.js');
 PsychDesktop.require('menu.js');
 PsychDesktop.require('rightclick.js');
 PsychDesktop.require('screensaver.js');
 PsychDesktop.require('shortcuts.js');
 PsychDesktop.require('taskbar.js');
 PsychDesktop.require('tasktray.js');
 PsychDesktop.require('theme.js');
 PsychDesktop.require('wallpaper.js');
 PsychDesktop.require('widget.js');
 PsychDesktop.require('windows.js');
 PsychDesktop.require('desktop.js');
  }
}

PsychDesktop.load();