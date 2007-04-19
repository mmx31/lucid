/****************************\
|        Psych Desktop       |
|         Menu Engine        |
|   (c) 2006 Psych Designs   |
\***************************/ 

menuvisibility = "closed";

sfHover = function() {
	var sfEls = document.getElementById("nav").getElementsByTagName("LI");
	for (var i=0; i<sfEls.length; i++) {
		sfEls[i].onmouseover=function() {
			this.className+=" sfhover";
		}
		sfEls[i].onmouseout=function() {
			this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
		}
	}
}
if (window.attachEvent) window.attachEvent("onload", sfHover);

function leftclick()
{
if(clickcache == '1')
{
if(menuvisibility=="open")
{
hidemenu();
menuvisibility="closed";
clickcache = 0;
}
}
else
{
count=5;
while(count != 0)
{
if(menuvisibility=="open")
{
clickcache = 1;
}
count--;
}
}
}


function menubutton()
{
if(menuvisibility == "closed")
{
//Effect.Appear('sysmenu',{duration: 0.6});
document.getElementById("sysmenu").style.display = "inline";
setTimeout("dojo.lfx.html.fadeIn('sysmenu', 300).play();", 100);
menuvisibility = "open";
}
else
{
if(menuvisibility == "open")
{
//menuvisibility = "closed";
}
}
}

function hidemenu()
{
//new Effect.Fade('sysmenu',{duration: 0.6});
dojo.lfx.html.fadeOut('sysmenu', 300).play();
setTimeout('document.getElementById("sysmenu").style.display = "none";', 350);
}

//           AJAX Stuff         \\

//this should probably be under menu.js, but whatever...
function app_getApplications() {
ui_loadingIndicator(0);
var url = "../backend/app.php?action=getPrograms";
dojo.io.bind({
    url: url,
    load: app_AppListState,
    error: ui_loadingIndicator(1),
    mimetype: "text/plain"
});
}

function app_AppListState(type, data, evt){
app_return = data;
html = '<ul id="nav">';
rawcode = app_return.split(xml_seperator);
app_amount = rawcode.length;
app_amount--;
app_amount = app_amount/3;
var x = 0;
var y = 0;
var z = 1;
while (x <= app_amount)
   {
   var app_id = rawcode[y];
   var app_name = rawcode[z];
   html += '<li onClick="javascript:app_launch(' + app_id + ');" style="border-top: 1px solid white;">' + app_name + '<ul><li>Submenu!!!</li><li>W00T!!!</li></ul></li>';
   x++;
   y++; y++; y++;
   z++; z++; z++;
   }
html += '<li onClick="javascript:logout();" style="border-top: 1px solid white; border-bottom: 1px solid white;">Logout</li>';
html += '</ul>';

document.getElementById("menu").innerHTML = html;
ui_loadingIndicator(1);
}
