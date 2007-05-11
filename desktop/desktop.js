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

window.onbeforeunload = bodyOnBeforeUnload;
document.onclick = leftclick;
var clickcache = 0;
drawtaskbar();

function logout()
{
window.onbeforeunload = null;
window.location = "../backend/logout.php?user="+conf_user;
}

function bodyOnBeforeUnload()
{
  //do this when the page unloads
  return "To exit Psych Desktop properly, you should log out.";
}

function ui_loadingIndicator(action)
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