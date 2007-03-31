/***********************************************
* Bottom slide tooltip- by Ron Grafe (mailto:grafer@REMOVETHIScolumbus.rr.com)
* Website URL: http://www.gdevresources.com
* Script modified by and available at Dynamic Drive: http://www.dynamicdrive.com/
* Modified for a menu on Psych Desktop by psychiccyberfreak
***********************************************/

//SET TOOLTIP DESCRIPTIONS BELOW
//Extend or contract array as needed
description[1]='<b>This is tool-tip descrition 2'
description[2]='<i>This is tool-tip description 3'

//Do not edit below here

iens6=document.all||document.getElementById
ns4=document.layers

<!--GLOBAL VARIABLES-->
var thename
var theobj
var thetext
var winHeight
var winPositionFromTop
var winWidth
var startH=2
var openTimer
<!--END GLOBAL VARIABLES-->

<!--GLOBAL FUNCTIONS-->

function ietruebody(){
return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function setObj(text,theswitch,inwidth,inheight) {
	thetext=text
	if(iens6){
		thename = "viewer"
		theobj=document.getElementById? document.getElementById(thename):document.all.thename
		winHeight=100
			if(iens6&&document.all) {
				winPositionFromTop=!window.opera? ietruebody().clientHeight : document.body.clientHeight
				winWidth=(ietruebody().clientWidth-ietruebody().leftMargin)
			}
			if(iens6&&!document.all) {
				winPositionFromTop=window.innerHeight
				winWidth=(window.innerWidth-(ietruebody().offsetLeft+30))
			}
			if(theswitch=="override") {
				winWidth=inwidth
				winHeight=inheight
			}
		theobj.style.width=winWidth+"px"
		theobj.style.height=startH+"px"
			if(iens6&&document.all) {
				theobj.style.top=ietruebody().scrollTop+winPositionFromTop+"px"
				//window.status=winPositionFromTop
				theobj.innerHTML = ""
				theobj.insertAdjacentHTML("BeforeEnd","<table cellspacing=0 width="+winWidth+" height="+winHeight+" border=1><tr><td width=100% valign=top><font type='times' size='2' style='color:black;font-weight:normal'>"+thetext+"</font></td></tr></table>")
			}
			if(iens6&&!document.all) {
				theobj.style.top=window.pageYOffset+winPositionFromTop+"px"
				theobj.innerHTML = ""
				theobj.innerHTML="<table cellspacing=0 width="+winWidth+" height="+winHeight+" border=1><tr><td width=100% valign=top><font type='times' size='2' style='color:black;font-weight:normal'>"+thetext+"</font></td></tr></table>"
			}
	}
	if(ns4){
		thename = "nsviewer"
		theobj = eval("document."+thename)
		winPositionFromTop=window.innerHeight
		winWidth=window.innerWidth
		winHeight=100
			if(theswitch=="override") {
				winWidth=inwidth
				winHeight=inheight
			}
		theobj.moveTo(0,eval(window.pageYOffset+winPositionFromTop))
		theobj.width=winWidth
		theobj.clip.width=winWidth
		theobj.document.write("<table cellspacing=0 width="+winWidth+" height="+winHeight+" border=1><tr><td width=100% valign=top><font type='times' size='2' style='color:black;font-weight:normal'>"+thetext+"</font></td></tr></table>")
		theobj.document.close()
	}
	viewIt()
}

function viewIt() {
	if(startH<=winHeight) {
		if(iens6) {
			theobj.style.visibility="visible"
				if(iens6&&document.all) {
					theobj.style.top=(ietruebody().scrollTop+winPositionFromTop)-startH+"px"
				}
				if(iens6&&!document.all) {
					theobj.style.top=(window.pageYOffset+winPositionFromTop)-startH+"px"
				}
			theobj.style.height=startH+"px"
			startH+=2
			openTimer=setTimeout("viewIt()",10)
		}
		if(ns4) {
			theobj.visibility = "visible"
			theobj.moveTo(0,(eval(window.pageYOffset+winPositionFromTop)-startH))
			theobj.height=startH
			theobj.clip.height=(startH)
			startH+=2
			openTimer=setTimeout("viewIt()",10)
		}
	}else{
		clearTimeout(openTimer)
	}
}

function stopIt() {
	if(iens6) {
		theobj.innerHTML = ""
		theobj.style.visibility="hidden"
		startH=2
	}
	if(ns4) {
		theobj.document.write("")
		theobj.document.close()
		theobj.visibility="hidden"
		theobj.width=0
		theobj.height=0
		theobj.clip.width=0
		theobj.clip.height=0
		startH=2
	}
}
<!--END GLOBAL FUNCTIONS-->

function showMenu()
{
if(menuopen==0)
{
setObj(description[0],'override',150,400)
menuopen=1
}
else
{
clearTimeout(openTimer);stopIt()
menuopen=0
}
}