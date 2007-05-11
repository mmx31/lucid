<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
require ("config.php");
if($_POST)
{
$user = $_POST['user'];
$email = $_POST['email'];
$link = mysql_connect($db_host, $db_username, $db_password);
mysql_select_db($db_name) or die('Could not select database');
$query = "SELECT email FROM {$db_prefix}users WHERE username = '${user}' LIMIT 1";
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
echo "2"; //email on file and username don't match
exit();
}
}
}
else
{
echo "1"; //no such user
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
			$code .= substr($possible, mt_rand(0, strlen($possible)-1), 1);
			$i++;
		}
require("config.php");
$cryptme = $code;
$new_pass = crypt($cryptme, $conf_secretword);
$link2 = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');
$query = "UPDATE ${db_prefix}users SET password = '${new_pass}' WHERE username='${user}'";
mysql_query($query) or die('Query failed: ' . mysql_error());
mysql_close($link2);
return $code;
}

function sendpass($newpass, $email)
{
//send the new password to $email and redirect to index with an OP message confirming the email was sent.
$message= "In response to your forgotten password request, here's your new password.\r\n\r\n" . "New Password: '" . $newpass . "'\r\n\r\nLog in with this password, then change it once logged in. Thanks!\r\n\r\n--The Management";
mail ($email, "Psych Desktop Password Change Script", $message, "From: Psych Desktop Account Service");
echo "0";
}

?>