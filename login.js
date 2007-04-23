/***********Login Form***********\
          Configuration
Path to desktop:*/
var psychdesktop_path= "./desktop/";
/*
\********************************/
var psychdesktop_http = getHTTPObject();

psychdesktop_home();

function psychdesktop_login()
{
	username = document.getElementById("psychdesktop_username").value;
	password = document.getElementById("psychdesktop_password").value;
	remember = document.getElementById("psychdesktop_remeber").checked;
	response = 0; //simulate an XMLHTTP request for now...
	if(responce == 0)
	{
		psychdesktop_popUp();
	}
}
function psychdesktop_continue()
{
	login = "<table><tr><td><b>You are allready logged in.</b><br />";
	login += "<input type='button' value='Continue to desktop' onClick='psychdesktop_popUp()' />";
	login += "</td></tr></table>";
}
function psychdesktop_home()
{
	login  = "<table style='width: 100%; height: 100%; border: 0px;'><tr><td colspan='2' style='text-align: center; font-weight: bold;'>Sign in to desktop</td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Username:</td><td><input type='text' id='psychdesktop_username' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Password:</td><td><input type='password' id='psychdesktop_password' /></td></tr>\n";
	login += "<tr><td colspan='2' style='font-size: 14px; font-weight: bold;'><span style='float: right'><input type='button' value='Login' onClick='psychdesktop_login();' /></span>";
	login += "<b>Remember me:</b><input type='checkbox' id='psychdesktop_remember' /></td></tr>";
	login += "<tr><td colspan='2' style='text-align: center; color: red; font-size: 14px; font-weight: bold;' id='psychdesktop_errorbox'></td></tr>";
	login += "<tr><td colspan='2' style='font-size: 14px; text-align: center;'><a href='javascript:psychdesktop_forgotpass();'>Forgot Password?</a></td></tr>";
	login += "<tr><td colspan='2' style='font-size: 14px; text-align: center;'><a href='javascript:psychdesktop_register();'>Don't have an account?</a></td></tr>";
	login += "</table>";
	
	try{ document.getElementById("psychdesktop_login").innerHTML = login; }
	catch(error) { alert("Error: "+error); }	
}
function psychdesktop_forgotpass()
{
	login  = "<table style='width: 100%; height: 100%; border: 0px;'><tr><td colspan='2' style='text-align: center; font-weight: bold;'>Reset your password</td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Username:</td><td><input type='text' id='psychdesktop_resetpass_username' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Email:</td><td><input type='text' id='psychdesktop_resetpass_email' /></td></tr>\n";
	login += "<tr><td colspan='2'><span style='float: right'><input type='button' value='Cancel' onClick='psychdesktop_home();' /><input type='button' value='Submit' onClick='psychdesktop_resetpass();' /></span></td></tr>";	
	login += "<tr><td colspan='2' style='text-align: center; color: red; font-size: 14px; font-weight: bold;' id='psychdesktop_errorbox'></td></tr>";	
	login += "</table>";
	try{ document.getElementById("psychdesktop_login").innerHTML = login; }
	catch(error) { alert("Error: "+error); }	
}

function psychdesktop_register()
{
	login  = "<table style='width: 100%; height: 100%; border: 0px;'><tr><td colspan='2' style='text-align: center; font-weight: bold;'>Register</td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Username:</td><td><input type='text' id='psychdesktop_register_username' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Email:</td><td><input type='text' id='psychdesktop_register_email' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Password:</td><td><input type='password' id='psychdesktop_register_password' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Confirm Password:</td><td><input type='password' id='psychdesktop_register_password2' /></td></tr>\n";
	login += "<tr><td colspan='2' style='text-align: center; color: red; font-size: 14px; font-weight: bold;' id='psychdesktop_errorbox'></td></tr>";	
	login += "<tr><td colspan='2'><span style='float: right'><input type='button' value='Cancel' onClick='psychdesktop_home();' /><input type='button' value='Submit' onClick='psychdesktop_doregister();' /></span></td></tr>";	
	login += "</table>";
	try{ document.getElementById("psychdesktop_login").innerHTML = login; }
	catch(error) { alert("Error: "+error); }	
}

function psychdesktop_doregister()
{
	username = document.getElementById("psychdesktop_register_username").value;
	email = document.getElementById("psychdesktop_register_email").value;
	password = document.getElementById("psychdesktop_register_password").value;
	password2 = document.getElementById("psychdesktop_register_password2").value;
	if(password2 != password)
	{
		psychdestkop_error("Passwords don't match");
	}
	else if(email && password && username && password2)
	{
		response = 0; //simulate an XMLHTTP request for now...
		if(response == 0)
		{
			psychdesktop_home();
			psychdesktop_error("Registration Successfull");
		}
		else
		{
			psychdesktop_error("Username allready taken");
		}
	}
}

function psychdestkop_error(msg)
{
	document.getElementById("psychdesktop_errorbox").innerHTML = msg;
}

function psychdesktop_resetpassword()
{
	username = document.getElementById("psychdesktop_resetpass_username").value;
	email = document.getElementById("psychdesktop_resetpass_email").value;
}

function psychdesktop_popUp() {
	URL = psychdesktop_path+"/desktop/";
	day = new Date();
	id = day.getTime();
	eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1024,height=768,left = 0,top = 0,fullscreen=1');");
}

function getHTTPObject() {
	var http_object;
	/*@cc_on
	@if (@_jscript_version >= 5)
		try { http_object = new ActiveXObject("Msxml2.XMLHTTP"); }
		catch (e) {
			try { http_object = new ActiveXObject("Microsoft.XMLHTTP"); }
			catch (E) { http_object = false; }
		}
	@else
		xmlhttp = http_object;
	@end @*/
	if (!http_object && typeof XMLHttpRequest != 'undefined') {
		try { http_object = new XMLHttpRequest(); }
		catch (e) {	http_object = false; }
	}
	return http_object;
}
