<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.app");
	import("models.user");
    if($_GET['section'] == "install")
	{
		$cur = $User->get_current();
		if($_GET['action'] == "package" && $cur->has_permission("api.ide"))
		{
			import("lib.package");
			$out = new textareaOutput();	
			if(isset($_FILES['uploadedfile']['name'])) {
				$target_path = '../../tmp/'.$_FILES['uploadedfile']['name'];
				if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)
				&& package::install($target_path)) {
					$out->append("status", "success");
				} else{
				   $out->append("error", "Problem accessing uploaded file");
				}
			} else { $out->append("error", "No File Uploaded"); }
		}
	}
    if($_GET['section'] == "fetch")
	{
		if($_GET['action'] == "id")
		{
			$appname = $_POST["name"];
			$p = $App->filter("name", $appname);
			$p = $p[0];
			$out = new jsonOutput();
			$out->append("appid", $p->id);
		}
		if($_GET['action'] == "full")
		{
			header("Content-type: text/json");
			$p = $App->get($_POST['id']);
			echo $p->make_json();
		}
		if($_GET['action'] == "list")
		{
			$p = $App->all();
			$out = new jsonOutput();
			$list = array();
			foreach($p as $d => $v)
			{
				$item = array();
				foreach(array("id", "name", "author", "email", "maturity", "category", "version", "filetypes") as $key) {
					$item[$key] = $v->$key;
				}
				array_push($list, $item);
			}
			$out->set($list);
		}
	}
	if($_GET['section'] == "write")
	{
		if($_GET['action'] == "save")
		{
			import("models.user");
			$user = $User->get_current();
			if(!$user->has_permission("api.ide")) internal_error("permission_denied");
			if($_POST['id'] == -1) { $app = new App(); }
			else { $app = $App->get($_POST['id']); }
			foreach(array('name', 'author', 'email', 'code', 'version', 'maturity', 'category') as $item) {
				$app->$item = $_POST[$item];
			}
			$app->save();
			$out = new jsonOutput();
			$out->append("id", $app->id);
		}
		if($_GET['action'] == "remove") {
			import("models.user");
			$user = $User->get_current();
			if(!$user->has_permission("api.ide")) internal_error("permission_denied");
			$app = $App->get($_POST['id']);
			$app->delete();
			rmdir($GLOBALS['path']."/../apps/".$_POST['id']);
			$out = new intOutput("ok");
		}
	}