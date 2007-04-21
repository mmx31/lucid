<?php
if (session_id() == "") session_start(); // if no active session we start a new one
if ($_POST['user'])
{
    if(isset($_POST['pass']) || isset($_POST['passhash']))
    {
        if($_POST['autologin'] == "1") {
            $pass = $_POST['passhash'];
        }
        else
        {
            $pass = $_POST['pass'];
        }
         // The submitted data is there, so process it
         login_check($_POST['user'], $pass);
    } else {
         // The form wasn't submitted, so go back
         login_go_back();
    }
} else {
     // The form wasn't submitted, so go back
     login_go_back();
}

function login_check($user, $pass)
{

    require ("../backend/config.php");

    // Connecting, selecting database
    $link = mysql_connect($db_host, $db_username, $db_password)
       or die('Could not connect: ' . mysql_error());
    mysql_select_db($db_name) or die('Could not select database');

    // Performing SQL query
    $query = "SELECT * FROM ${db_prefix}users WHERE username='${user}' LIMIT 1";
    $result = mysql_query($query) or die('Query failed: ' . mysql_error());

    //do compare
    $line = mysql_fetch_array($result, MYSQL_ASSOC);

    if($line)
    {
    if($_POST['autologin'] == "0") {
        $pass = crypt($pass, $conf_secretword);
    }
    foreach ($line as $col_value)
    {

    if($line["password"] == $pass)
    {
            $_SESSION['userid'] = $line['ID'];
            $_SESSION['username'] = $line['username'];
            $_SESSION['userloggedin'] = TRUE;
    //mysql_free_result($result);

    // Closing connection
    //mysql_close($link);

    //set autologin cookie
    if($_POST['remember'] == "yes")
    {
        setcookie("autologin", $user.",".$pass, time()+2592000, "/");
    }
    login_ok($user);
    }
    else
    {
    login_go_back();
    }
}
}
else
{
// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);
login_go_back();
}
}

function login_go_back()
{
setcookie("autologin", $user.",".$pass, time()-2592000, "/");
header("Location: ../backend/desktop_login.php?opmessage=Incorrect+Username+or+Password");
}

function login_ok($user)
{
require("../backend/config.php");

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');

$query = "UPDATE `${db_prefix}users` SET `logged` = '1' WHERE username ='${user}'";

mysql_query($query) or die('Query failed: ' . mysql_error());

mysql_close($link);
global $conf_user;
$conf_user = $user;
require("desktop.php");
}

?>