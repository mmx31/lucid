<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.user");
	if($_GET['section'] == "info")
	{
		if ($_GET['action'] == "get") {
            $x = null;
            $y = null;
			if(array_key_exists('username', $_POST)) { $x = "username"; $y = $_POST['username']; }
			if(array_key_exists('name', $_POST)) { $x = "name"; $y = $_POST['name']; }
			if(array_key_exists('email', $_POST)) { $x = "email"; $y = $_POST['email']; }
			if($x && $y) $user = $User->filter($x, $y);
			else if($_POST['id'] == "0") { $user = $User->get_current(); }
			else { $user = $User->get($_POST['id']); }
            if($user !== false) {
                if(is_array($user)) {
                    $user = $user[0];
                }
			    $out = new jsonOutput();
			    $out->append("id", $user->id);
			    $out->append("name", $user->name);
			    $out->append("username", $user->username);
			    $out->append("email", $user->email);
			    $out->append("lastauth", $user->lastauth);
                $out->append("exists", true);
            }
            else {
                $out = new jsonOutput();
                $out->append("exists", false);
            }
		}
        if($_GET['action'] == "isAdmin") {
            $u = $User->get_current();
            $out = new jsonOutput();
            $out->append("isAdmin", $u->has_permission("core.administration"));
        }
		if($_GET['action'] == "set") {
			$id = $_POST['id'];
			$info = array();
			$cur = $User->get_current();
			if(is_numeric($id) && $cur->has_permission("core.administration")) {
				$user = $User->get($id);
				if($user === false) internal_error("generic_err");
			}
			else if(is_numeric($id)) internal_error("permission_denied");
			else $user = $cur;
			foreach($_POST as $key => $val){
				if($key == "id"
				|| ($key == "permissions" && !$cur->has_permission("core.administration"))
				|| ($key == "groups" && !$cur->has_permission("core.administration"))
				|| ($key == "username" && !$cur->has_permission("core.administration"))
				|| $key == "logged"
				|| $key == "lastAuth") continue;
				if($key == "password" && !$cur->has_permission("core.administration")) {
					//this is handled a bit differently...
					//the user had to auth themselves in the past 5 minuites
					if(!$user->lastAuth) continue; //this user has never logged in. wait, how's that possible?
					$now = date('Y-m-d H:i:s');
					$lauth = $user->lastauth;
					if($now['year'] == $lauth['year']
					&& $now['month'] == $lauth['month']
					&& $now['day'] == $lauth['day']
					&& $now['hour'] == $lauth['hour']
					&& ((($now['minuite']*60)+$now['second']) - (($lauth['minuite']*60)+$lauth['second'])) < 5*60/*$user->has_permission("core.user.set.password")*/) {
						$user->set_password(base64_decode($val));
					}
					continue;
				}
				//decode object fields
				if($key == "permissions" || $key == "groups"){
					import("lib.Json.Json");
					$val = Zend_Json::decode($val);
				}
				if($key == "password") {
					$user->set_password(base64_decode($val));
					continue;
				}
				if($key == "username") {
					//rename their userdir
					rename("../../files/" . $user->$key, "../../files/" . $val);
				}
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
			if(!isset($_POST['username'])) {
				$cur = $User->get_current();
				$_POST['username'] = $cur->username;
				$_POST['password'] = base64_decode($_POST['password']);
			}
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
        if($_GET['action'] == "quickLogout")
		{
			$user = $User->get_current();
			$user->logged = 0;
            $user->save();
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
			if($GLOBALS['conf']['public'] == true)
			{
				$_POST['username'] = str_replace("..", "", $_POST['username']);
				$_POST['username'] = str_replace("/", "", $_POST['username']);
				$_POST['username'] = str_replace("\\", "", $_POST['username']);
				$u = $User->filter("username", $_POST['username']);
				if(isset($u[0])) { $out = new intOutput("generic_err"); }
				else
				{
					$p = new User();
					$p->username = $_POST['username'];
					$p->email = $_POST['email'];
					$p->set_password($_POST['password']);
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
