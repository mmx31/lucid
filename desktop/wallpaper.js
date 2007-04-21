/****************************\
|        Psych Desktop       |
|      Wallpaper Engine      |
|   (c) 2006 Psych Designs   |
\***************************/

function loadWallpaperPrefs()
{
api.registry.getValue(0, "bgimg");
setTimeout("setWallpaper(api.registry.value);", 500);

setTimeout("api.registry.getValue(0, 'bgcolor');", 500);
setTimeout("setWallpaperColor(api.registry.value);", 1000);
}

function setWallpaper(image)
{
if(image)
{
setTimeout("document.getElementById(\"wallpaper\").innerHTML=\"<img width='100%' height='100%' src='"+image+"'>\";", 100);
}
else
{
document.getElementById("wallpaper").innerHTML="&nbsp";
}
}

function setWallpaperColor(color)
{
if( document.documentElement && document.documentElement.style ) {
    document.documentElement.style.backgroundColor = color; }
if( document.body && document.body.style ) {
    document.body.style.backgroundColor = color; }
    document.bgColor = color;
}