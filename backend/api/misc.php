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
	if ($_GET['action'] == "get") {
		if($_GET['id'] == "0") { $user = $User->get_current(); }
		else { $user = $User->get($_GET['id']); }
		$out = new jsonOutput();
		$out->append("id", $user->id);
		$out->append("username", $user->username);
		$out->append("email", $user->email);
		$out->append("level", $user->level);
	}
	if ($_GET['action'] == "changePassword") {
		require("../config.php");
		$username = $_SESSION['username'];
		$old = crypt($_GET['old'], $conf_secretword);
		$user = $User->get_current();
		if($old == $user->password) {
			$user->set_password($_GET['new']);
			$user->save();
			$out = new intOutput();
			$out->set("ok");
		}
		else { $out->set("generic_err"); }
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
}
?>
