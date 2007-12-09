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
require("../configuration.php");
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
		$db_prefix = $GLOBALS['db']['prefix'];
		$query = "SELECT * FROM ${db_prefix}users WHERE ID=\"${userid}\"";
		$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password']) or die('Could not connect: ' . mysql_error());
		mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
			echo($row["username"]);
		}
	}
	if ($_GET['action'] == "changePassword") {
		require("../config.php");
		$username = $_SESSION['username'];
		$old = crypt($_GET['old'], $conf_secretword);
		$new = crypt($_GET['new'], $conf_secretword);
		$db_prefix = $GLOBALS['db']['prefix'];
		$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
		$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password']) or die('Could not connect: ' . mysql_error());
		mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
			if($row["password"] == $old) {
				$query = "UPDATE ${db_prefix}users  SET password=\"${new}\" WHERE username=\"${username}\" LIMIT 1";
				$result = mysql_query($query) or die('Query failed: ' . mysql_error());
				echo("0");
			}
			else {
				die("1");
			}
		}
	}
	if ($_GET['action'] == "changeEmail") {
		require("../config.php");
		$username = $_SESSION['username'];
		$password = crypt($_GET['pass'], $conf_secretword);
		$email = $_GET['email'];
		$db_prefix = $GLOBALS['db']['prefix'];
		$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
		$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password']) or die('Could not connect: ' . mysql_error());
		mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
			if($row["password"] == $password) {
				$query = "UPDATE ${db_prefix}users  SET email=\"${email}\" WHERE username=\"${username}\" LIMIT 1";
				$result = mysql_query($query) or die('Query failed: ' . mysql_error());
				echo("0");
			}
			else {
				die("1");
			}
		}
	}
	if ($_GET['action'] == "getUserIDFromName") {
		$username = $_GET["username"];
		$db_prefix = $GLOBALS['db']['prefix'];
		$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
		$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password']) or die('Could not connect: ' . mysql_error());
		mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
			echo($row["ID"]);
		}
	}
	if ($_GET['action'] == "getUserEmail") {
		$username = $_SESSION['username'];
		$db_prefix = $GLOBALS['db']['prefix'];
		$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
		$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password']) or die('Could not connect: ' . mysql_error());
		mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
			echo($row["email"]);
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