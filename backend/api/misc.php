<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
session_start();
require("../config.php");
if (isset($_GET['action'])) {
// get password will NEVER be implamented
 if ($_GET['action'] == "getStatus") {
if(isset($_SESSION['userid'])) {
echo("OK");
}
else {
echo("FAIL");
}
}
 if ($_GET['action'] == "getUserName") {
 echo $_SESSION['username'];
 }
 if ($_GET['action'] == "getUserNameFromID") {
 $userid = $_GET["userid"]; 
	$query = "SELECT * FROM ${db_prefix}users WHERE ID=\"${userid}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		echo($row["username"]);
		}
 }
  if ($_GET['action'] == "changePassword") {
 $username = $_SESSION['username'];
 $old = $_GET['old'];
 $new = $_GET['new'];
	$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		if($row["password"] == $old) {
		$query = "UPDATE ${db_prefix}users  SET password=\"${new}\" WHERE username=\"${username}\" LIMIT 1";
		echo("0");
		}
		else {
		die("1");
		}
 }
 }
 if ($_GET['action'] == "getUserIDFromName") {
 $username = $_GET["username"]; 
	$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		echo($row["ID"]);
		}
 }
 if ($_GET['action'] == "getUserID") {
 echo $_SESSION['userid'];
 }
  if ($_GET['action'] == "getUserLevel") {
  echo $_SESSION['userlevel'];
  }
  }
?>