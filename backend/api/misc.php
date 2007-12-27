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
require("../lib/includes.php");
require("../models/user.php");
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
		$user = $User->getCurrent();
		echo $user->username;
	}
	if ($_GET['action'] == "getUserNameFromID") {
		$user = $User->get($_GET['userid']);
		echo $user->username;
	}
	if ($_GET['action'] == "changePassword") {
		require("../config.php");
		$username = $_SESSION['username'];
		$old = crypt($_GET['old'], $conf_secretword);
		//$new = crypt($_GET['new'], $conf_secretword);
		$user = $User->getCurrent();
		if($old == $user->password) {
			$user->set_password($_GET['new']);
			$user->save();
			echo("0");
		}
		else { echo("1"); }
	}
	if ($_GET['action'] == "changeEmail") {
		require("../config.php");
		$user = $User->getCurrent();
		$pass = crypt($_GET['pass'], $conf_secretword);
		if($pass == $user->password) {
			$user->email = $_GET['email'];
			$user->save();
		}
		else { echo("1"); }
	}
	if ($_GET['action'] == "getUserIDFromName") {
		$username = $_GET["username"];
		$user = $User->filter("name", $username);
		echo $user->id;
	}
	if ($_GET['action'] == "getUserEmail") {
		$user = $User->getCurrent();
		echo $user->email;
	}
	if ($_GET['action'] == "getUserID") {
		$user = $User->getCurrent();
		echo $user->id;
	}
	if ($_GET['action'] == "getUserLevel") {
		$user = $User->getCurrent();
		echo $user->level;
	}
}
?>
