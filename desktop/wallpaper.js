/****************************\
|        Psych Desktop       |
|      Wallpaper Engine      |
|   (c) 2006 Psych Designs   |
\***************************/

document.write('<div id="wallpaper" style="position: absolute; top: 0; left: 0; zindex: -100; height: 100%; width: 100%;"></div>');
//document.write('<div id="wallpaperoverlay" style="position: absolute; top: 0; left: 0; zindex: -50; height: 100%; width: 100%;"></div>');
//setWallpaper("./wallpaper/default.gif");

function setWallpaper(image)
{
if(image)
{
Element.update("wallpaper", "<img width='100%' height='100%' src='"+image+"'>");
}
else
{
Element.update("wallpaper", " ");
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