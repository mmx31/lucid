/****************************\
|        Psych Desktop       |
|     Screensaver Engine     |
|   (c) 2006 Psych Designs   |
\***************************/

function saverStop()
{
  document.removeChild(document.getElementById("b"));
  clearInterval(saverinterval);
}

function screenSaver(choice)
{
  var saverdiv = document.createElement("div");
  saverdiv.id="b";
  saverdiv.style.width="100%";
  saverdiv.style.height="100%";
  saverdiv.style.zindex="1000000000";
  saverdiv.style.position="fixed";
  saverdiv.style.left="0px";
  saverdiv.style.top="0px";
  if(choice == 1) { var saverinterval = setInterval("starFeild",9); }
}

function starFeild()
{
c=Math.cos;
for(a=0;a<65;) {
m='<p style=position:absolute;top:'+(50+(z=399/(73-(++a+saverinterval++&63)))*c(a*.9))+'%;left:'+(50+z*c(a))+(z>>4?'%>·':'%;color:#456>.';
document.getElementById('B').innerHTML=m;
}
}