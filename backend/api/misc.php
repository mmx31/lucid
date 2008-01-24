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
require("../lib/includes.php");
import("models.user");
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
		$user = $User->get_current();
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
		$user = $User->get_current();
		if($old == $user->password) {
			$user->set_password($_GET['new']);
			$user->save();
			$out = new intOutput();
			$out->set("ok");
		}
		else { echo("1"); }
	}
	if ($_GET['action'] == "changeEmail") {
		$out = new intOutput();
		$user = $User->get_current();
		if($user->check_password($_POST['pass'])) {
			$user->email = $_POST['email'];
			$user->save();
			$out->set("ok");
		}
		else { $out->set("generic_err"); }
	}
	if ($_GET['action'] == "getUserIDFromName") {
		$username = $_GET["username"];
		$user = $User->filter("name", $username);
		echo $user->id;
	}
	if ($_GET['action'] == "getUserEmail") {
		$user = $User->get_current();
		echo $user->email;
	}
	if ($_GET['action'] == "getUserID") {
		$user = $User->get_current();
		echo $user->id;
	}
	if ($_GET['action'] == "getUserLevel") {
		$user = $User->get_current();
		echo $user->level;
	}
}
?>
