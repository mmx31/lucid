<?php
require ("config.php");
echo "Security code: ";
echo $_SESSION['security_code'];

exit();


if($_POST['security_code'])
{
if(($_SESSION['security_code'] == $_POST['security_code']) && (!empty($_SESSION['security_code'])) ) {
      // Insert you code for processing the form here
	  //ok
   } else {
      // Insert your code for showing an error message here
header("Location: ../index.php?page=register&opmessage=Error:+Security+Image+And+Submitted+Data+Are+Not+The+Same");
exit();
   }
}
else
{
header("Location: ../index.php?page=register&opmessage=Error:+No+Security+Code+Entered");
exit();
}


if($_POST['user'])
{
 if($_POST['pass'])
 {
  if($_POST['conf'])
  {
   //ok
  }
  else
  {
  header("Location: ../index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted");
  exit();
  }
 }
 else
 {
 header("Location: ../index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted");
 exit();
 }
}
else
{
header("Location: ../index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted");
exit();
}


if($_POST['email'])
{
}
else
{
header("Location: ../index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted");
}


if($_POST['pass'] == $_POST['conf'])
{
//ok
}
else
{
header("Location: ../index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted");
exit();
}


$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');

//preform username lookup
$query = "SELECT username FROM {$db_prefix}users WHERE username = '${_POST['user']}'";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
$line = mysql_fetch_array($result, MYSQL_ASSOC) ;
if($line)
{


foreach ($line as $col_value)
{
if($_POST["user"] == $col_value)
{
header("Location: ../index.php?page=register&opmessage=Error:+Username+Allready+Exists");
}
}
}
else
{
register_user($_POST['user'] , $_POST['pass'] , $_POST['email']);
}



function register_user($username , $password, $email)
{
require("../backend/config.php");
$password = crypt($password, $conf_secretword);

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');

$query = "INSERT INTO `${db_prefix}users` (`username`, `email`, `password`, `logged`, `ID`, `level`) VALUES ('${username}', '${email}', '${password}', '0', NULL, 'user');";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
header("Location: ../index.php?opmessage=Registration+Successfull");

// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);

session_destroy();

}
?>