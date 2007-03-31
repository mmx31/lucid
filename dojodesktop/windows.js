/****************************\
|        Psych Desktop       |
|    Window Engine Library   |
|   (c) 2006 Psych Designs   |
\****************************/ 

//width and height is set by the div style, content is set by widget.setContent() and title is part of the widget creation process

function newWindow(wintitle, contents, winwidth, winheight)
{
windiv=document.createElement("div");
windiv.style.position="absolute";
windiv.style.width=winwidth;
windiv.style.height=winheight;
windiv.style.zindex="100";
windiv.innerHTML=contents;
document.body.appendChild(windiv);
dojo.debug("Window div created");
widget = dojo.widget.createWidget("FloatingPane", {hasShadow: true, resizable: true, displayCloseAction: true, title: wintitle, displayMaximizeAction: true, displayMinimizeAction: true, taskBarId: "appbar", toggle: "explode", toggleDuration: 300}, windiv);
}