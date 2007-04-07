<?php
function douservalidation($user, $email)
{
require ("./backend/config.php");
$link = mysql_connect($db_host, $db_username, $db_password);
mysql_select_db($db_name) or die('Could not select database');
$query = "SELECT email FROM {$db_prefix}users WHERE username = '${user}'";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$line = mysql_fetch_array($result, MYSQL_ASSOC) ;
if($line)
{
foreach ($line as $col_value)
{
if($email == $col_value)
{
$newpass = changepass($user);
sendpass($newpass, $email);
exit();
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+Email+Submitted+And+Email+On+File+Do+Not+Match!'</script>";
exit();
}
}
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+Username+Does+Not+Exist!'</script>";
exit();
}
}

function changepass($user)
{
//change the password and return the new password
		$characters = 10;
		$possible = '23456789bcdfghjkmnpqrstvwxyz'; 
		$code = '';
		$i = 0;
		while ($i < $characters) { 
			$code .= substr($possible, mt_rand(0, trlen($possible)-1), 1);
			$i++;
		}
require("./backend/config.php");
$cryptme = $code;
$new_pass = crypt($cryptme, $conf_secretword);
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');

$query = "UPDATE ${db_prefix}users SET password = '${new_pass}' WHERE username='${user}'";
mysql_query($query) or die('Query failed: ' . mysql_error());
/*
// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);
*/
		return $code;
}

function sendpass($newpass, $email)
{
//send the new password to $email and redirect to index with an OP message confirming the email was sent.
$message= "In response to your forgotten password request, here's your new password.\r\n\r\n" . "New Password: '" . $newpass . "'\r\n\r\nLog in with this password, then change it once logged in. Thanks!\r\n\r\n--The Management";
mail ($email, "Psych Desktop Password Change Script", $message, "From: Psych Desktop Account Service");
echo "<script type='text/javascript'> window.location = './index.php?opmessage=New+Password+Sent'</script>";
}


require ("./backend/config.php");
if($_POST)
{

if($_POST['email'])
{
    
if (!eregi("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$", $_POST['email']))
{

echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+Invalid+Email+Address'</script>";
       exit(); 
} else {
        
    //ok
        
} 
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
}


if($_POST['security_code'])
{
if(($_SESSION['security_code'] == $_POST['security_code']) && (!empty($_SESSION['security_code'])) ) {
      // Insert you code for processing the form here
	  //ok
   } else {
      // Insert your code for showing an error message here
echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+Security+Image+And+Submitted+Data+Are+Not+The+Same'</script>";
exit();
   }
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+No+Security+Code+Entered'</script>";
exit();
}

if($_POST['user'])
  {
   //ok
  }
  else
  {
echo "<script type='text/javascript'> window.location = './index.php?page=forgotpass&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
  exit();
  }


douservalidation($_POST['user'], $_POST['email']);

}
else
{
?>
<center>
<div style="border: 1px grey solid; background-color: #EEEEEE; width: 40%;">
<FORM action="./index.php?page=forgotpass" method="post">
    <P>
    <LABEL for="user">Username: </LABEL>
              <INPUT type="text" name="user" id="user"><BR>
    <LABEL for="email">Email: </LABEL>
              <INPUT type="text" name="email" id="email"><BR>
<p>Enter the text in the image in this feild.</p>
<img src="./backend/captchaimage.php?width=125&height=25&character=5" /><br>
<input id="security_code" name="security_code" type="text" /><br />
<INPUT type="submit" value="Submit"><INPUT type="button" value="Cancel" onClick="window.location='./index.php'">
    </P>
 </FORM>
</div>
</center>
<?php
}
?>