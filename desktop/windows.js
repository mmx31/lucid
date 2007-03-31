/****************************\
|        Psych Desktop       |
|    Window Engine Library   |
|   (c) 2006 Psych Designs   |
\****************************/ 

var winidcounter = 1;

function newWindow(wintitle, contents, winwidth, winheight)
{
var win = new Window({id: "win"+winidcounter, width: winwidth, height: winheight, title: wintitle});
win.getContent().innerHTML= contents;
win.setDestroyOnClose();
win.showCenter();
winidcounter++;
}