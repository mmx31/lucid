<?php
require("config.php");
/******Configuration******
$db = Array();
	$db["type"] = "mysql"; //the type of DB to use
	$db["user"] = "mysql"; //the user for the mysql connection
	$db["password"] = "mysql"; //the password for the mysql connection
	$db["database"] = "desktop"; //the name of the database
	$db["prefix"] = "dsktp_"; //the database table prefix
	$db["host"] = "localhost"; //host of the mysql server
	$db["nowrite"] = Array("password", "pass"); //never write the values of these columns
	$conf = Array();
	$conf["salt"] = "92bcedf6dc19357d751ef8e5c3c9ea28"; //salt used for hashing passwords
	$conf["public"] = "yes"; //Public registration enabled?(yes/no)
/*************************/
	$db["type"] = $db_type;
	$db["user"] = $db_username;
	$db["password"] = $db_password;
	$db["database"] = $db_name;
	$db["prefix"] = $db_prefix;
	$db["host"] = $db_host;
	$db["nowrite"] = Array("password", "pass"); //never write the values of these columns
	$conf = Array();
	$conf["salt"] = $conf_secretword;
	$conf["public"] = $conf_public;
?>