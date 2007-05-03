<?php
require ("../backend/config.php");

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');

//preform username lookup
$query = "SELECT username FROM {$db_prefix}users WHERE username = '${_POST['user']}'";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());

if($_POST['user'])
{
if($_POST['pass'])
{
if($_POST['level'])
{
if($_POST['conf'])
{
if($_POST['email'])
{
//ok
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Bad+User+Level'</script>";
exit();
}
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Bad+User+Level'</script>";
exit();
}
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
exit();
}
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
exit();
}
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
exit();
}


if($_POST['pass'] == $_POST['conf'])
{
//ok
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Two+Passwords+Don't+Match!'</script>";
exit();
}

//check user level here
if($_POST['level'] == "user" || $_POST['level'] == "admin" || $_POST['level'] == "dev")
{
//ok
}
else
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
}


$line = mysql_fetch_array($result, MYSQL_ASSOC) ;
if($line)
{


foreach ($line as $col_value)
{
if($_POST["user"] == $col_value)
{
echo "<script type='text/javascript'> window.location = './index2.php?backend=newuser&opmessage=Error:+Username+Already+Exists!'</script>";
}
}
}
else
{
register_user($_POST['user'] , $_POST['pass'] , $_POST['level'], $_POST['email']);
}


// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);


function register_user($username , $password , $level, $email)
{
require("../backend/config.php");
$password = crypt($password, $conf_secretword);

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');

$query = "INSERT INTO `${db_prefix}users` (`username`, `email`, `password`, `logged`, `ID`, `level`) VALUES ('${username}', '${email}', '${password}', '0', NULL, '${level}');";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
echo "<script type='text/javascript'> window.location = './index2.php?backend=users&opmessage=Registration+Successfull.'</script>";
}
/*
// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);
*/
?>