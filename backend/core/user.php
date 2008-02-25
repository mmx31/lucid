<?php
	/*
    Psych Desktop
    Copyright (C) 2006 Psychcf

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
	if($_GET['section'] == "info")
	{
		if ($_GET['action'] == "get") {
			if($_POST['id'] == "0") { $user = $User->get_current(); }
			else { $user = $User->get($_POST['id']); }
			$out = new jsonOutput();
			$out->append("id", $user->id);
			$out->append("name", $user->name);
			$out->append("username", $user->username);
			$out->append("email", $user->email);
			$out->append("level", $user->level);
			$out->append("lastauth", $user->lastauth);
		}
		if($_GET['action'] == "set") {
			$id = $_POST['id'];
			$info = array();
			$cur = $User->get_current();
			if(is_numeric($id) && $cur->level == "admin") {
				$user = $User->get($id);
				if($user === false) internal_error("generic_err");
			}
			else if(is_numeric($id)) internal_error("permission_denied");
			else $user = $cur;
			foreach($_POST as $key => $val){
				if($key == "id"
				|| ($key == "level" && $cur->level != "admin")
				|| ($key == "permissions" && $cur->level != "admin")
				|| ($key == "groups" && $cur->level != "admin")
				|| $key == "username"
				|| $key == "logged"
				|| $key == "lastAuth") continue;
				if($key == "password" && $cur->level != "admin") {
					//this is handled a bit differently...
					//the user had to auth themselves in the past 5 minuites
					if(!$user->lastAuth) continue; //this user has never logged in. wait, how's that possible?
					MDB2::loadFile('Date');
					$now = MDB2_Date::mdbNow();
					$lauth = $user->lastauth;
					if($now['year'] == $lauth['year']
					&& $now['month'] == $lauth['month']
					&& $now['day'] == $lauth['day']
					&& $now['hour'] == $lauth['hour']
					&& ((($now['minuite']*60)+$now['second']) - (($lauth['minuite']*60)+$lauth['second'])) < 5*60) {
						$user->set_password($val);
					}
					continue;
				}
				//decode object fields
				if($key == "permissions" || $key == "groups") $val = json_decode($val);
				$user->$key = $val;
			}
			$user->save();
			$out = new intOutput("ok");
		}
	}
	if($_GET['section'] == "auth")
	{
		if($_GET['action'] == "login")
		{
			$cur = $User->get_current();
			if(!isset($_POST['username'])) $_POST['username'] = $cur->username;
			$p = $User->authenticate($_POST['username'], $_POST['password']);
			if($p != FALSE) {
				if($p->has_permission("core.user.auth.login")) {
					$p->login();
					$out = new intOutput("ok");
				}
				else {
					internal_error("permission_denied");
				}
			}
			else { $out = new intOutput("generic_err"); }
		}
		if($_GET['action'] == "logout")
		{
			$user = $User->get_current();
			$user->logout();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "resetpass")
		{
			$p = $User->filter("username", $_POST['username']);
			if(isset($p[0]))
			{
				$p = $p[0];
				if($p->email == $_POST['email'])
				{
					$pass = $p->generate_password();
					$message= "In response to your forgotten password request, here's your new password.\r\n\r\n" . "New Password: '" . $pass . "'\r\n\r\nLog in with this password, then change your password using the control panel. Thanks!\r\n\r\n--The Management";
					mail($p->email, "Psych Desktop Password Reset", $message, "From: Psych Desktop Account Service");
					$out = new intOutput("ok");
				}
				else { $out = new intOutput(2); }
			}
			else { $out = new intOutput("generic_err"); }
		}
		if($_GET['action'] == "register")
		{
			if($GLOBALS['conf']['public'] == "yes")
			{
				$u = $User->filter("username", $_POST['username']);
				if(isset($u[0])) { $out = new intOutput("generic_err"); }
				else
				{
					$p = new User();
					$p->username = $_POST['username'];
					$p->email = $_POST['email'];
					$p->set_password($_POST['password']);
					$p->level = "user";
					$p->logged = 0;
					$p->save();
					echo "0";
				}
			}
			else
			{
				$out = new intOutput("generic_err");
			}
		}
		if($_GET['action'] == "public")
		{
			require("../configuration.php");
			echo $GLOBALS['conf']['public'];
		}
	}
?>