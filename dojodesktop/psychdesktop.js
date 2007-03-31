var PsychDesktop = {
  require: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
  },
  load: function() {
 PsychDesktop.require('api.js');
 PsychDesktop.require('app.js');
 PsychDesktop.require('appbar.js');
 PsychDesktop.require('icon.js');
 PsychDesktop.require('menu.js');
 PsychDesktop.require('rightclick.js');
 PsychDesktop.require('screensaver.js');
 PsychDesktop.require('shortcuts.js');
 PsychDesktop.require('taskbar.js');
 PsychDesktop.require('tasktray.js');
 PsychDesktop.require('tooltip.js');
 PsychDesktop.require('wallpaper.js');
 PsychDesktop.require('widget.js');
 PsychDesktop.require('windows.js');
 PsychDesktop.require('desktop.js');
  }
}

PsychDesktop.load();