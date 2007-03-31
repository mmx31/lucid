/****************************\
|        Psych Desktop       |
|         Menu Engine        |
|   (c) 2006 Psych Designs   |
\***************************/ 

menuvisibility = "closed";


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
Effect.Appear('sysmenu',{duration: 0.6});
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
new Effect.Fade('sysmenu',{duration: 0.6});
}