<?php
session_start();
if (!isset($_SESSION['userid'])) { exit(); }
require("config.php");
$userid = $_SESSION['userid'];
$password = $_POST['pass'];
$password = crypt($password, $conf_secretword);
$email = $_POST['email'];
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
$query = "UPDATE ${db_prefix}users SET password = '${password}', email = '${email}' WHERE ID='${userid}'";
echo "0";