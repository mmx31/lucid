<?php


function register_user($username , $password, $email)
{
require("./backend/config.php");
$password = crypt($password, $conf_secretword);

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');

$query = "INSERT INTO `${db_prefix}users` (`username`, `email`, `password`, `logged`, `ID`, `level`) VALUES ('${username}', '${email}', '${password}', '0', NULL, 'user');";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
echo "<script type='text/javascript'> window.location = './index.php?opmessage=Registration+Successfull'</script>";
// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);

session_destroy();

}

if($_POST)
{
require ("./backend/config.php");


if($_POST['security_code'])
{
if(($_SESSION['security_code'] == $_POST['security_code']) && (!empty($_SESSION['security_code'])) ) {
      // Insert you code for processing the form here
	  //ok
   } else {
      // Insert your code for showing an error message here
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Security+Image+And+Submitted+Data+Are+Not+The+Same'</script>";
exit();
   }
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+No+Security+Code+Entered'</script>";
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
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
  exit();
  }
 }
 else
 {
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
 exit();
 }
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
exit();
}


if($_POST['email'])
{
    
if (!eregi("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$", $_POST['email']))
{

echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Invalid+Email+Address'</script>";
       exit(); 
} else {
        
    //ok
        
} 
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
}


if($_POST['pass'] == $_POST['conf'])
{
//ok
}
else
{
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Not+Enough+Information+Submitted'</script>";
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
echo "<script type='text/javascript'> window.location = './index.php?page=register&opmessage=Error:+Username+Allready+Exists'</script>";
}
}
}
else
{
register_user($_POST['user'] , $_POST['pass'] , $_POST['email']);
}


}
else
{
?>

 <center>
<div style="border: 1px grey solid; background-color: #EEEEEE;">
<FORM action="./index.php?page=register" method="post">
<br><br>
    <P>
    <LABEL for="user">Username: </LABEL>
              <INPUT type="text" name="user" id="user"><BR>
    <LABEL for="pass">Password: </LABEL>
              <INPUT type="password" name="pass" id="pass"><BR>
    <LABEL for="conf">Confirm: </LABEL>
              <INPUT type="password" name="conf" id="conf"><BR>
    <LABEL for="email">Email: </LABEL>
              <INPUT type="text" name="email" id="email"><BR>
<p>Enter the text in the image in this feild. <a href="javascript: window.location.reload( false );">Can't Read it?</a></p>
<img src="./backend/captchaimage.php?width=125&height=25&character=5" /><br>
<input id="security_code" name="security_code" type="text" /><br />


<INPUT type="submit" value="Submit"> 
<INPUT type="button" value="Cancel" onClick="window.location='/index.php'">
    </P>
 </FORM>
</div>
<?php
$_SESSION['security_code'] = $code;
}
?>

</center>

