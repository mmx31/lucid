//			Login Form			\\
var http = getHTTPObject();

psychdesktop_home();

function psychdesktop_login()
{
	username = document.getElementById("psychdesktop_username").value;
	password = document.getElementById("psychdesktop_password").value;
}
function psychdesktop_home()
{
	login  = "<table style='width: 100%; height: 100%; border: 0px;'><tr><td colspan='2' style='text-align: center; font-weight: bold;'>Sign in to desktop</td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Username:</td><td><input type='text' id='psychdesktop_username' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Password:</td><td><input type='password' id='psychdesktop_password' /></td></tr>\n";
	login += "<tr><td colspan='2' style='font-size: 14px; font-weight: bold;'><span style='float: right'><input type='button' value='Login' onClick='psychdesktop_login();' /></span>";
	login += "<b>Remember me:</b><input type='checkbox' id='psychdesktop_remember' /></td></tr>";
	login += "<tr><td colspan='2' style='font-size: 14px; text-align: center;'><a href='javascript:psychdesktop_forgotpass();'>Forgot Password?</a></td></tr>";
	login += "</table>";
	
	try{ document.getElementById("psychdesktop_login").innerHTML = login; }
	catch(error) { alert("Error: "+error); }	
}
function psychdesktop_forgotpass()
{
	login  = "<table style='width: 100%; height: 100%; border: 0px;'><tr><td colspan='2' style='text-align: center; font-weight: bold;'>Reset your password</td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Username:</td><td><input type='text' id='psychdesktop_resetpass_username' /></td></tr>\n";
	login += "<tr><td style='font-size: 14px; font-weight: bold;'>Email:</td><td><input type='text' id='psychdesktop_resetpass_email' /></td></tr>\n";
	login += "<tr><td colspan='2'><span style='float: right'><input type='button' value='Cancel' onClick='psychdesktop_home();' /><input type='button' value='Submit' onClick='psychdesktop_resetpass();' /></span>";	
	login += "</table>";
	try{ document.getElementById("psychdesktop_login").innerHTML = login; }
	catch(error) { alert("Error: "+error); }	
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