var desktop = {
	detect: false,
	loginForm:	 "<div class='desktop-login-form'>"
				+"	<div name='error'></div>"
				+"	<form onSubmit='desktop.login(); return false;' action='#' method='POST'>"
				+"		<span class='desktop-inputlabel'>Username:</span>"
				+"		<input type='text' name='username' /><br />"
				+"		<span class='desktop-inputlabel'>Password:</span>"
				+"		<input type='password' name='password' />"
				+"		<input type='submit' value='Submit' />"
				+"	</form>"
				+"</div>",
	init: function()
	{
		if(typeof window.onLoad!="function"){
			window.onLoad=psychdesktop.start;
		}
		else
		{
			desktop.oldonload=window.onLoad;
			window.onLoad=function(){
				desktop.oldonload();
				psychdesktop_initloginform();
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
		document.getElementById("psychdesktop_login").innerHTML = desktop.loginForm;
	},
	xhr: function()
	{
		if(window.XMLHttpRequest)
		{
			var http=new XMLHttpRequest();
			http.overrideMimeType("text/plain");
		}
		else if(window.ActiveXObject)
		{
			var http=new ActiveXObject("Microsoft.XMLHTTP");
		}
		return http;
	},
	bind: function(options)
	{
		var content = "";
		var i = 1;
		var p = options.content.length;
		if(options.content) for(c in options.content)
		{
			content += escape(c)+"="+escape(options.content[c]);
			if(i > p) content += "&";
			i++;
		}
		desktop._http = desktop.xhr();
		desktop._http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		desktop._callback=options.load;
		var t = function() {
			if(desktop._http.readyState==4){
				if(desktop._http.status==200){
					data=desktop._http.responseText;
					desktop._callback(data);
				}else{
					desktop.error("Could not connect to server");
				}
			}
		}
		if(ActiveXObject)
		{
			desktop._http.onreadystatechange=t;
			desktop._http.open("POST",options.url,true);
		}
		else
		{
			desktop._http.open("POST",options.url,true);
			desktop._http.onreadystatechange=t;
		}
		desktop._http.send((options.content ? content : null));
	},
	login: function()
	{
		var form = document.getElementById("psychdesktop_login").getElementsByTagName("div")[0].getElementsByTagName("form")[0];
		desktop.bind({
			url: "",
			content: {
				username: form.username.value,
				password: form.password.value
			},
			load: function(data)
			{
				if(data == "0")
				{
					desktop.popUp();
					desktop.loggedin();
					desktop.detect=true;
				}
				else
				{
					desktop.error("Incorrect username or password");
				}
			}
		});
	},
	error: function(msg)
	{
		var form = document.getElementById("psychdesktop_login").getElementsByTagName("div")[0];
		form.error.innerHTML = "<span style='color: red;'>"+msg+"</span>";
	},
	loggedin: function()
	{
		
	},
	popUp: function()
	{
		
	}
};
desktop.init();