<?

session_start();

$user = array();

// after $timeout seconds of inactivity the login session ends
$timeout = 3600; 

// Please specify the users which can access the webgui
$user[0]['username'] = "root";
$user[0]['password'] = "root";
//$user[1]['username'] = "...";
//$user[1]['password'] = "...";
//$user[2]['username'] = "...";
//$user[2]['password'] = "...";

if (isset($_GET['logout']) && $_GET['logout'] == '1') {
	if( getPHPVersion() >= 4.1 ) {
		$_SESSION["USERNAME"] = '';
		$_SESSION["PASSWORD"] = '';
	} else {
		$HTTP_SESSION_VARS["USERNAME"] = '';
		$HTTP_SESSION_VARS["PASSWORD"] = '';
	}
}

if (isset($_POST['username']) && isset($_POST['password'])) {	
	$username = $_POST['username'];
	$password = $_POST['password'];
	$timestamp = time();
	$phpself = isset($_SERVER['PHP_SELF']) ? $_SERVER['PHP_SELF'] : '';
	$querystring = isset($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : '';
	if( getPHPVersion() >= 4.1 ) {
		$_SESSION["USERNAME"] = $username;
		$_SESSION["PASSWORD"] = $password;
		$_SESSION["TIMESTAMP"] = time();
	} else {
		$HTTP_SESSION_VARS["USERNAME"] = $username;
		$HTTP_SESSION_VARS["PASSWORD"] = $password;
		$HTTP_SESSION_VARS["TIMESTAMP"] = time();
	}

} else if( getPHPVersion() >= 4.1 ) {
	$username = isset($_SESSION["USERNAME"]) ? $_SESSION["USERNAME"] : '';
	$password = isset($_SESSION["PASSWORD"]) ? $_SESSION["PASSWORD"] : '';
	$timestamp = isset($_SESSION["TIMESTAMP"]) ? $_SESSION["TIMESTAMP"] : '';
	$phpself = isset($_SERVER['PHP_SELF']) ? $_SERVER['PHP_SELF'] : '';
	$querystring = isset($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : '';

} else {
	$username = isset($HTTP_SESSION_VARS["USERNAME"]) ? $HTTP_SESSION_VARS["USERNAME"] : '';
	$password = isset($HTTP_SESSION_VARS["PASSWORD"]) ? $HTTP_SESSION_VARS["PASSWORD"] : '';
	$timestamp = isset($HTTP_SESSION_VARS["TIMESTAMP"]) ? $HTTP_SESSION_VARS["TIMESTAMP"] : '';
	$phpself = isset($HTTP_SERVER_VARS['PHP_SELF']) ? $HTTP_SERVER_VARS['PHP_SELF'] : '';
	$querystring = isset($HTTP_SERVER_VARS['QUERY_STRING']) ? $HTTP_SERVER_VARS['QUERY_STRING'] : '';
}

$isLoginNeeded = true;

if ($username != '' && $password != '') {
	for ($i = 0; $i < count($user); $i++) {
		if ($user[$i]['username'] == $username && $user[$i]['password'] == $password)
			$isLoginNeeded = false;
	}

	if (time() - $timestamp > $timeout)
		$isLoginNeeded = true;

	if (!$isLoginNeeded) {
		if( getPHPVersion() >= 4.1 )
			$_SESSION["TIMESTAMP"] = time();
		else
			$HTTP_SESSION_VARS["TIMESTAMP"] = time();
	}
}

if ($isLoginNeeded) {

?>
<html>
<head>
<style>
body, p, td, tr, table, input { font-family: verdana, arial, helvetica; color: #0B5979; font-size: 12px;}
.title { font-size: 26px; font-weight: bold;}
</style>
</head>
<body>
<form action="<?=$phpself?>?<?=$querystring?>" method="post">
	<table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">
		<tr>
			<td align="center" valign="middle">
				<div style="text-align: left; border: solid #0B5979 1px; width: 300px; height: 180px; background-color: #D0DCE0;">
					<table width="300" height="180" cellspacing="5" cellpadding="5" border="0">
					<tr><td valign="top" colspan="2"><span class="title">Webgui Login</span></td></tr>
					<tr><td width="70">Username:</td><td><input name="username"></td></tr>
					<tr><td width="70">Password:</td><td><input name="password" type="password"></td></tr>
					<tr><td colspan="2"><input type="submit" name="submitted" value="Login"></td></tr>
					</table>
				</div>
			</td>
		</tr>
	</table>
</form>


<SCRIPT LANGUAGE="JavaScript">
<!--
document.forms[0].username.select();
document.forms[0].username.focus();
//-->
</SCRIPT>
</body>
</html>

<?

exit;

}


function getPHPVersion()
{
	$regs = array();
	if( ereg("^([0-9])\.([0-9])", phpversion(), $regs) ) {
		$version = (float)( $regs[1] . "." . $regs[2] );
	} else
		$version = 2;

	return $version;
}


?>