<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.user");
	$curuser = $User->get_current();
	if($curuser->has_permission("core.administration"))
	{
		if($_GET['section'] == "general")
		{
			if($_GET['action'] == "diskspace")
			{
				if(is_dir("/"))
				{
					$free = disk_free_space("/");
					$total = disk_total_space("/");
				}
				else
				{
					//windowze?
					$free = disk_free_space("C:");
					$total = disk_total_space("C:");
				}
				$p = new jsonOutput();
				$free = str_replace(",", ".", strval($free));
				$total = str_replace(",", ".", strval($total));
				$p->append("free", $free);
				$p->append("total", $total);
			}
		}
		if($_GET['section'] == "permissions") {
			if($_GET['action'] == "list") {
				import("models.permission");
				$list = $Permission->all();
				$outList = array();
				foreach($list as $perm) {
					array_push($outList, array(
						"id" => $perm->id,
						"name" => $perm->name,
						"description" => $perm->description,
						"initial" => ($perm->initial == 1)
					));
				}
				$out = new jsonOutput($outList);
			}
			if($_GET['action'] == "setDefault") {
				import("models.permission");
				$perm = $Permission->get($_POST['id']);
				$perm->initial = ($_POST['value'] == "true" ? TRUE : FALSE);
				$perm->save();
				$out = new intOutput("ok");
			}
		}
		if($_GET['section'] == "groups") {
			if($_GET['action'] == "list") {
				import("models.group");
				$list = $Group->all();
				$out = array();
				foreach($list as $group) {
					array_push($out, array(
						"id" => $group->id,
						"name" => $group->name,
						"description" => $group->description,
						"permissions" => $group->permissions,
						"quota" => $group->quota
					));
				}
				$output = new jsonOutput($out);
			}
			if($_GET['action'] == "add") {
				import("models.group");
				import("lib.Json.Json");
				$perms = Zend_Json::decode($_POST['permissions']);
				$p = new $Group(array(
					"name" => $_POST['name'],
					"description" => $_POST['description'],
					"permissions" => $perms
				));
				$p->save();
				$out = new jsonOutput(array(
					"id" => $p->id
				));
			}
			if($_GET['action'] == "set") {
				import("lib.Json.Json");
				import("models.group");
				$p = $Group->get($_POST['id']);
				foreach(array("description", "permissions", "quota") as $key) {
					if(!isset($_POST[$key])) continue;
					if($key == "permissions") $p->$key = Zend_Json::decode($_POST[$key]);
					else $p->$key = $_POST[$key];
				}
				$p->save();
				$out = new intOutput("ok");
			}
			if($_GET['action'] == "delete") {
				import("models.group");
				$p = $Group->get($_POST['id']);
				$p->delete();
				$out = new intOutput("ok");
			}
			if($_GET['action'] == "getMembers") {
				import("models.user");
				import("models.group");
				$g = $Group->get($_POST['id']);
				$users = $User->all();
				$array = array();
				foreach($users as $user) {
					foreach($user->groups as $group) {
						if($group == $g->name) {
							array_push($array, $user);
							break;
						}
					}
				}
				$final = array();
				foreach($array as $user) {
					$item = array();
					foreach(array("id", "name", "username", "email", "logged", "permissions", "groups", "lastAuth") as $key) {
						$item[$key] = $user->$key;
					}
					array_push($final, $item);
				}
				$out = new jsonOutput($final);
			}
			if($_GET['action'] == "addMember") {
				import("models.user");
				import("models.group");
				$user = $User->get($_POST['userid']);
				$group = $Group->get($_POST['groupid']);
				foreach($user->groups as $g) {
					if($g == $group->name) {
						$out = new intOutput("ok");
						die();
					}
				}
				array_push($user->groups, $group->name);
				$user->save();
				$out = new intOutput("ok");
			}
			if($_GET['action'] == "removeMember") {
				import("models.user");
				import("models.group");
				$user = $User->get($_POST['userid']);
				$group = $Group->get($_POST['groupid']);
				foreach($user->groups as $k => $g) {
					if($g == $group->name) {
						array_splice($user->groups, $k, 1);
					}
				}
				$user->save();
				$out = new intOutput("ok");
			}
		}
		if($_GET['section'] == "users")
		{
			if($_GET['action'] == "create") {
				$_POST['username'] = str_replace("..", "", $_POST['username']);
				$_POST['username'] = str_replace("/", "", $_POST['username']);
				$_POST['username'] = str_replace("\\", "", $_POST['username']);
				$exUser = $User->filter("username", $_POST['username']);
				if($exUser != false) {
					$out = new jsonOutput(array(
						"id" => false
					));
					die();
				}
				import("lib.Json.Json");
				$args = array();
				foreach(array(
					"name",
					"username",
					"email",
					"permissions",
					"groups",
					"password"
				) as $key) {
					if(!isset($_POST[$key])) continue;
					$args[$key] = $_POST[$key];
					if($key == "permissions" || $key == "groups") $args[$key] = Zend_Json::decode($args[$key]);
				}
				$user = new $User($args);
				$user->crypt_password();
				$user->save();
				$out = new jsonOutput(array(
					id => $user->id
				));
			}
			if($_GET['action'] == "delete") {
				$p = $User->get($_POST['id']);
				$cur = $User->get_current();
				if($p !== false && $p->id != $cur->id) {
					$p->delete();
				}
			}
			if($_GET['action'] == "list")
			{
				$p = $User->all();
				$out = new jsonOutput();
				$val = array();
				foreach($p as $d => $v)
				{
					$o = array();
					foreach(array(
						"id",
						"username",
						"name",
						"logged",
						"email",
						"permissions",
						"groups",
						"lastauth",
						"quota"
					) as $key) {
						$o[$key] = $v->$key;
					}
					array_push($val, $o);
				}
				$out->set($val);
			}
			if($_GET['action'] == "online")
			{
				$online = 0;
				$total = 0;
				$p = $User->all();
				foreach($p as $u)
				{
					$total++;
					if($u->logged == 1) $online++;
				}
				$o = new jsonOutput;
				$o->append("online", $online);
				$o->append("total", $total);
			}
		}
		if($_GET['section'] == "quota")
		{
			if($_GET['action'] == "list") {
				import("models.quota");
				$list = $Quota->all();
				$fin = array();
				foreach($list as $item) {
					array_push($fin, array(
						"type" => $item->type,
						"size" => $item->size
					));
				}
				$out = new jsonOutput($fin);
			}
			if($_GET['action'] == "set") {
				import("models.quota");
				import("lib.Json.Json");
				$values = Zend_Json::decode($_POST['quotas']);
				foreach($values as $key => $value) {
					$p=$Quota->filter("type", $key);
					if($p == false) continue;
					$p[0]->size = (int)$value;
					$p[0]->save();
				}
				$out = new intOutput("ok");
			}
		}
	}
	else internal_error("permission_denied");
