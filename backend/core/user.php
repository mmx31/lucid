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
	session_start();
	require("../configuration.php");
	require("../lib/output.php");
	require("../lib/util.php");
	require("../models/base.php");
	require("../models/user.php");
	$user = $User->get_current();
	if($_GET['section'] == "info")
	{
		if($user != false)
		{
			if($_GET['action'] == "save")
			{
				$user->email = $_POST['email'];
				if(isset($_POST['password']))
				{
					$user->set_password($_POST['password']);
				}
				$user->save();
			}
		}
		else { die("user not found"); }
	}
	
	if($_GET['section'] == "auth")
	{
		if($_GET['action'] == "login")
		{
			$p = $User->authenticate($_POST['username'], $_POST['password']);
			if($p != FALSE) { $p->login(); echo "0"; }
			else { echo "1"; }
		}
		if($_GET['action'] == "logout")
		{
			$user->logout();
			echo "0";
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
					echo "0";
				}
				else { echo "2"; }
			}
			else { echo "1"; }
		}
		if($_GET['action'] == "register")
		{
			require("../config.php");
			if($conf_public == "yes")
			{
				$u = $User->filter("username", $_POST['username']);
				if(isset($u[0])) { echo "1"; }
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
				echo "1";
			}
		}
		if($_GET['action'] == "public")
		{
			require("../configuration.php");
			echo $GLOBALS['conf']['public'];
		}
	}
?>