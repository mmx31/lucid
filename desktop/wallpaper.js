/****************************\
|        Psych Desktop       |
|      Wallpaper Engine      |
|   (c) 2006 Psych Designs   |
\***************************/

function loadWallpaperPrefs()
{
api.registry.getValue(0, "bgimg");
setTimeout("setWallpaper(api.registry.value);", 250);

api.registry.getValue(0, "bgcolor");
setTimeout("setWallpaperColor(api.registry.value);", 250);
}

function setWallpaper(image)
{
if(image)
{
setTimeout("document.getElementById(\"wallpaper\").innerHTML=\"<img width='100%' height='100%' src='"+image+"'>\";", 100);
api.registry.saveValue(0, "bgimg", image);
}
else
{
document.getElementById("wallpaper").innerHTML="&nbsp";
api.registry.saveValue(0, "bgimg", "");
}
}

function setWallpaperColor(color)
{
if( document.documentElement && document.documentElement.style ) {
    document.documentElement.style.backgroundColor = color; }
if( document.body && document.body.style ) {
    document.body.style.backgroundColor = color; }
    document.bgColor = color;
    api.registry.saveValue(0, "bgcolor", color);
}

setTimeout("loadWallpaperPrefs();", 1000);