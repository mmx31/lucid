		<?php

function editaccount($user, $email, $pass)
{
require("./backend/config.php");

$cryptpass = crypt($pass, $conf_secretword);

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
$query = "UPDATE ${db_prefix}users SET password = '${cryptpass}', email = '${email}' WHERE username='${user}'";
mysql_query($query) or die('Query failed: ' . mysql_error());
mysql_free_result($result);
mysql_close($link);
}


		function login_check($user, $pass)
{

	require ("./backend/config.php");

// Connecting, selecting database
		$link = mysql_connect($db_host, $db_username, $db_password)
		or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');

// Performing SQL query
		$query = "SELECT password FROM ${db_prefix}users WHERE username='${user}'";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());

//do compare
		$line = mysql_fetch_array($result, MYSQL_ASSOC);

if($line)
{

	$pass = crypt($pass, $conf_secretword);

	foreach ($line as $col_value)
	{

		if($col_value == $pass)
		{
// Free resultset
		mysql_free_result($result);

// Closing connection
		mysql_close($link);
//ok.
		}
		else
		{
			echo "<script type='text/javascript'> window.location = './index.php?page=editaccount&opmessage=Error:+Bad+Account+Info'</script>";
			exit();
		}
	}
}
else
{
// Free resultset
		mysql_free_result($result);

// Closing connection
		mysql_close($link);
echo "<script type='text/javascript'> window.location = './index.php?page=editaccount&opmessage=Error:+Bad+Account+Info'</script>";
exit();
}
}

if($_POST)
{
	$user = $_POST['user'];
	$email = $_POST['email'];
	$oldpass = $_POST['oldpass'];
	$newpass = $_POST['newpass'];
	$confnewpass = $_POST['confnewpass'];
	$captcha = $_POST['security_code'];

	if($user && $email && $oldpass && $newpass && $confnewpass && captcha)
	{

		if (!eregi("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$", $email))
		{
			echo "<script type='text/javascript'> window.location = './index.php?page=editaccount&opmessage=Error:+Invalid+Email+Address'</script>";
			exit(); 
		}
		else
		{
			if($newpass == $confnewpass)
			{
				if(($_SESSION['security_code'] == $_POST['security_code']) && (!empty($_SESSION['security_code'])) )
				{
//ok
				}
				else
				{
					echo "<script type='text/javascript'> window.location = './index.php?page=editaccount&opmessage=Error:+Security+Image+And+Submitted+Data+Are+Not+The+Same'</script>";
					exit();
				}

			}
			else
			{
				echo "<script type='text/javascript'> window.location = './index.php?page=editaccount&opmessage=ERROR:+Two+Passwords+Are+Not+The+Same'</script>";
			}
		}
	}
	else
	{
		echo "<script type='text/javascript'> window.location = './index.php?page=editaccount&opmessage=ERROR:+Not+All+Forms+Filled+Out'</script>";
		exit();
	}

	login_check($user, $oldpass);

editaccount($user, $email, $newpass);

		echo "<script type='text/javascript'> window.location = './index.php?opmessage=Account+Edited+Successfully'</script>";

}
	else
{
	?>
<center>
<div style="border: 1px grey solid; background-color: #EEEEEE; width: 40%; align: center;">
<FORM action="./index.php?page=editaccount" method="post">
<LABEL for="user">Username: </LABEL>
<INPUT type="text" name="user" id="user"><BR>
<LABEL for="email">Email: </LABEL>
<INPUT type="text" name="email" id="email"><BR>
<LABEL for="email">Old Password: </LABEL>
<INPUT type="password" name="oldpass" id="oldpass"><BR>
<LABEL for="email">New Password: </LABEL>
<INPUT type="password" name="newpass" id="newpass"><BR>
<LABEL for="email">Confirm New Password: </LABEL>
<INPUT type="password" name="confnewpass" id="confnewpass"><BR>
<p>Enter the text in the image in this feild.</p>
<img src="/backend/captchaimage.php?width=125&height=25&character=5" /><br>
<input id="security_code" name="security_code" type="text" /><br />
<INPUT type="submit" value="Submit"><INPUT type="button" value="Cancel" onClick="window.location='/index.php'">
</FORM>
</div>
</center>

<?php
}
?>