var desktop = {
	formid: "psychdesktop_login",
	detect: false,
	elements: {},
	loginForm:	"<div id='desktop_message'>Desktop Login</div>"
				+ "<div style='color: red;' id='desktop_formerror'></div>"
				+"<div><span class='desktop-inputlabel'>Username:</span>"
				+"<input type='text' class='desktop-input' name='username' /></div>"
				+"<div><span class='desktop-inputlabel'>Password:</span>"
				+"<input type='password' class='desktop-input' name='password' /></div>"
				+"<input type='submit' name='submit' class='desktop-input' value='Submit' />"
				+"<div><a href='javascript: desktop.registerDialog();'>Register</a></div>"
				+"<div><a href='javascript: desktop.forgotPassDialog();'>Reset Password</a></div>",
	registerForm:	"<div style='color: red;' id='desktop_registerformerror'></div>"
					+"<div><span class='desktop-inputlabel'>Username:</span>"
					+"<input type='text' name='username' /></div>"
					+"<div><span class='desktop-inputlabel'>Email:</span>"
					+"<input type='text' name='email' /></div>"
					+"<div><span class='desktop-inputlabel'>Password:</span>"
					+"<input type='text' name='password' /></div>"
					+"<div><span class='desktop-inputlabel'>Confirm Password:</span>"
					+"<input type='text' name='confPassword' /></div>"
					+"<input type='submit' name='submit' value='Submit' />",
	forgotForm: "<div style='color: red;' id='desktop_forgotformerror'></div>"
				+"<div><span class='desktop-inputlabel'>Username:</span>"
				+"<input type='text' name='user' /></div>"
				+"<div><span class='desktop-inputlabel'>Email:</span>"
				+"<input type='text' name='email' /></div>"
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
		if(desktop.path===""){
			desktop.path="./";
		}
		if(typeof dojo == "undefined"){
			var element = document.createElement("script");
			element.type = "text/javascript";
			element.src = desktop.path+"/desktop/dojo/dojo/dojo.js";
			element.id = "";
			document.getElementsByTagName("head")[0].appendChild(element);
			
			element = document.createElement("link");
			element.rel = "stylesheet";
			element.type = "text/css";
			element.media = "screen";
			element.href = desktop.path+"/desktop/dojo/dijit/themes/tundra/tundra_rtl.css";
			document.getElementsByTagName("head")[0].appendChild(element);
			
			element = document.createElement("link");
			element.rel = "stylesheet";
			element.type = "text/css";
			element.media = "screen";
			element.href = desktop.path+"/desktop/dojo/dijit/themes/tundra/tundra.css";
			document.getElementsByTagName("head")[0].appendChild(element);
		}
		desktop.setOnLoad();
	},
	setOnLoad: function() {
		if(typeof dojo != "undefined"){
			dojo.require("dijit.form.Form");
			dojo.require("dijit.form.TextBox");
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
		else {setTimeout(desktop.setOnLoad, 10);}
	},
	login: function(contents)
	{
		dojo.byId("desktop_formerror").innerHTML = "";
		dijit.byId(desktop.formid).domNode.submit.disabled=true;
		if(contents.username && contents.password)
		{
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
						dijit.byId(desktop.formid).domNode.username.value = "";
						dijit.byId(desktop.formid).domNode.password.value = "";
					}
					else
					{
						dojo.byId("desktop_formerror").innerHTML = "Incorrect username or password.";
						dijit.byId(desktop.formid).domNode.submit.disabled=false;
					}
				}
			});
		}
		else
		{
			dojo.byId("desktop_formerror").innerHTML = "Please provide both a username and a password";
			dijit.byId(desktop.formid).domNode.submit.disabled=false;
		}
	},
	loggedin: function()
	{
		if(desktop.elements.popup.closed === false) {setTimeout(desktop.loggedin, 10);}
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
	},
	registerDialog: function() {
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.setAttribute("class", "tundra");
		div.style.backgroundColor="white";
		desktop.elements.registerDialogForm = new dijit.form.Form({});
		desktop.elements.registerDialogForm.domNode.innerHTML = desktop.registerForm;
		
		new dijit.form.TextBox({name: "username"}, desktop.elements.registerDialogForm.domNode.username);
		new dijit.form.TextBox({name: "email"}, desktop.elements.registerDialogForm.domNode.email);
		new dijit.form.TextBox({name: "password", type: "password"}, desktop.elements.registerDialogForm.domNode.password);
		new dijit.form.TextBox({name: "confPassword", type: "password"}, desktop.elements.registerDialogForm.domNode.confPassword);
		
		div.appendChild(desktop.elements.registerDialogForm.domNode);
		dojo.doc.body.appendChild(div);
		desktop.elements.registerDialog = new dijit.Dialog({title: "Register"}, div);
		desktop.elements.registerDialog.show();
		dojo.connect(desktop.elements.registerDialogForm, "execute", desktop, function(contents){
			desktop.elements.registerDialogForm.domNode.submit.disabled=true;
			dojo.byId("desktop_registerformerror").innerHTML = "";
			if(contents.username && contents.email && contents.password && contents.confPassword)
			{
				if(contents.password == contents.confPassword)
				{
					dojo.require("dojox.validate.web");
					if(dojox.validate.isEmailAddress(contents.email))
					{
						dojo.xhrPost({
							url: desktop.path+"/backend/register.php",
							content: contents,
							load: function(data, ioArgs)
							{
								if(data == "User registration disabled")
								{
									desktop.elements.registerDialog.hide();
									dojo.byId("desktop_formerror").innerHTML = "Public registations are disabled";
								}
								if(data == "1")
								{
									dojo.byId("desktop_registerformerror").innerHTML = "Username allready exists";
									desktop.elements.registerDialogForm.domNode.submit.disabled=false;
								}
								else if(data == "0")
								{
									desktop.elements.registerDialog.hide();
									dojo.byId("desktop_formerror").innerHTML = "You may now log in";
								}
							}
						});
					}
					else
					{
						dojo.byId("desktop_registerformerror").innerHTML = "Please enter a valid email";
						desktop.elements.registerDialogForm.domNode.submit.disabled=false;
					}
				}
				else
				{
					dojo.byId("desktop_registerformerror").innerHTML = "Two passwords don't match";
					desktop.elements.registerDialogForm.domNode.submit.disabled=false;
				}
			}
			else
			{
				dojo.byId("desktop_registerformerror").innerHTML = "Please fill in all fields";
				desktop.elements.registerDialogForm.domNode.submit.disabled=false;
			}
		});
	},
	forgotPassDialog: function() {
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.setAttribute("class", "tundra");
		div.style.backgroundColor="white";
		desktop.elements.forgotDialogForm = new dijit.form.Form({});
		desktop.elements.forgotDialogForm.domNode.innerHTML = desktop.forgotForm;
		
		new dijit.form.TextBox({name: "user"}, desktop.elements.forgotDialogForm.domNode.user);
		new dijit.form.TextBox({name: "email"}, desktop.elements.forgotDialogForm.domNode.email);
			
		div.appendChild(desktop.elements.forgotDialogForm.domNode);
		dojo.doc.body.appendChild(div);
		desktop.elements.forgotDialog = new dijit.Dialog({title: "Reset Password"}, div);
		desktop.elements.forgotDialog.show();
		dojo.connect(desktop.elements.forgotDialogForm, "execute", desktop, function(contents){
			desktop.elements.forgotDialogForm.domNode.submit.disabled=true;
			dojo.byId("desktop_forgotformerror").innerHTML = "";
			if(contents.email && contents.user)
			{
				dojo.require("dojox.validate.web");
				if(dojox.validate.isEmailAddress(contents.email))
				{
					dojo.xhrPost({
						url: desktop.path+"/backend/forgotpass.php",
						content: contents,
						load: function(data, ioArgs) {
							if(data == "2")
							{
								dojo.byId("desktop_forgotformerror").innerHTML = "Email on file and username don't match";
								desktop.elements.forgotDialogForm.domNode.submit.disabled=false;
							}
							else if(data == "1")
							{
								dojo.byId("desktop_forgotformerror").innerHTML = "No such user";
								desktop.elements.forgotDialogForm.domNode.submit.disabled=false;
							}
							else if(data == "0")
							{
								desktop.elements.forgotDialog.hide();
								dojo.byId("desktop_formerror").innerHTML = "A new password has been sent"
							}
						}
					});
				}
				else
				{
					dojo.byId("desktop_forgotformerror").innerHTML = "Please enter a valid email";
					desktop.elements.forgotDialogForm.domNode.submit.disabled=false;
				}
			}
			else
			{
				dojo.byId("desktop_forgotformerror").innerHTML = "Please fill out all fields";
				desktop.elements.forgotDialogForm.domNode.submit.disabled=false;
			}
		});
	}
};
desktop.init();