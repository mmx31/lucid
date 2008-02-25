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
		}
		if($_GET['action'] == "save")
		{
			$user = $User->get_current();
			if($user != false)
			{
				$user->email = $_POST['email'];
				if(isset($_POST['password']))
				{
					$user->set_password($_POST['password']);
				}
				$user->save();
			}
		}
	}
	if($_GET['section'] == "auth")
	{
		if($_GET['action'] == "login")
		{
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