var desktop = {
	formid: "psychdesktop_login",
	detect: false,
	elements: new Object(),
	loginForm:	"<div name='error'></div>"
				+"<div style='color: red;' id='desktop_formerror'></div>"
				+"<div><span class='desktop-inputlabel'>Username:</span>"
				+"<input type='text' name='username' /></div>"
				+"<div><span class='desktop-inputlabel'>Password:</span>"
				+"<input type='password' name='password' /></div>"
				+"<input type='submit' name='submit' value='Submit' />",
	init: function()
	{
		
		if(typeof window.onload!="function"){
			window.onload=desktop.start;
		}
		else
		{
			desktop.oldonload=window.onLoad;
			window.onload=function(){
				desktop.oldonload();
				desktop.start();
			};
		}
	},
	start: function()
	{
		var _1;
		var _2;
		var _3=document.getElementsByTagName("script");
		for(var i=0;i<_3.length;i++){
			if(_3[i].src&&_3[i].src.match(/login\.js$/)){
				desktop.path=_3[i].src.replace(/login\.js$/,"");
			}
		}
		if(desktop.path==""){
			desktop.path="./";
		}
		if(typeof dojo == "undefined"){
			var element = document.createElement("script");
			element.type = "text/javascript";
			element.src = desktop.path+"/desktop/dojo/dojo/dojo.js";
			element.id = "";
			document.getElementsByTagName("head")[0].appendChild(element);
		}
		desktop.setOnLoad();
	},
	setOnLoad: function() {
		if(typeof dojo != "undefined"){
			dojo.require("dijit.form.Form");
			dojo.require("dijit.form.TextBox")
			desktop.elements.loginform = new dijit.form.Form({}, dojo.byId(desktop.formid));
			desktop.elements.loginform.domNode.innerHTML = desktop.loginForm;
			desktop.elements.onExecuteForm = dojo.connect(desktop.elements.loginform, "execute", desktop, desktop.login);
			new dijit.form.TextBox({
				name: "username"
			}, desktop.elements.loginform.domNode.username);
			new dijit.form.TextBox({
				type: "password",
				name: "password"
			}, desktop.elements.loginform.domNode.password);
		}
		else setTimeout(desktop.setOnLoad, 10);
	},
	login: function(contents)
	{
		dijit.byId(desktop.formid).domNode.submit.disabled=true;
		dojo.xhrPost({
			url: desktop.path+"/backend/login.php",
			content: contents,
			load: function(data)
			{
				if(data == "0")
				{
					desktop.popUp();
					desktop.loggedin();
					dojo.disconnect(desktop.elements.onExecuteForm);
				}
				else
				{
					desktop.error("Incorrect username or password");
					dijit.byId(desktop.formid).domNode.submit.disabled=false;
				}
			}
		});
	},
	error: function(msg)
	{
		dojo.byId("desktop_formerror").innerHTML=msg;
	},
	loggedin: function()
	{
		if(desktop.elements.popup.closed == false) setTimeout(desktop.loggedin, 10);
		else {
			dijit.byId(desktop.formid).domNode.submit.disabled=false;
			desktop.elements.onExecuteForm = dojo.connect(desktop.elements.loginform, "execute", desktop, desktop.login);
		}
	},
	popUp: function()
	{
		var URL=desktop.path+"/desktop/";
		var day=new Date();
		var id=day.getTime();
		desktop.elements.popup=window.open(URL,id,"toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1000000,height=1000000,left = 0,top = 0");
	}
};
desktop.init();