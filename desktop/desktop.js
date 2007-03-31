/****************************\
|        Psych Desktop       |
|         Main script        |
|   (c) 2006 Psych Designs   |
\****************************/

window.onbeforeunload = bodyOnBeforeUnload;
document.onclick = leftclick;
var clickcache = 0;

setWallpaper('./wallpaper/default.gif');
setWallpaperColor('white');
drawtaskbar();

function logout()
{
window.onbeforeunload = null;
window.location = "/backend/logout.php?user="+conf_user;
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
Effect.Appear("loadingIndicator");
}
if(action == 1)
{
Effect.Fade("loadingIndicator");
}
}