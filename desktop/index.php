<?php
if (session_id() == "") session_start(); // if no active session we start a new one
$user = $_SESSION['username'];
if($_SESSION['userloggedin'] == true)
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