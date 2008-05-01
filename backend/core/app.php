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
		if($_GET['action'] == "full")
		{
			if(isset($_POST['filename'])) {
				$p = $App->filter("sysname", $_POST['sysname']);
				$p = $p[0];
				$out = new jsonOutput();
				foreach(array("sysname", "name", "author", "email", "maturity", "category", "version", "filetypes") as $key) {
					$out->append($key, $p->$key);
				}
			}
			else {
				function jsSearch($path) {
					$files = array();
					while(($file = readdir($dir)) !== false){
						if($file{0} == '.'){
							continue;
						}
						else {
							if(is_dir($path . "/" . $file)) {
								$search = rsearch($path . "/" . $file);
							}
							else if(is_file($path . "/" . $file) && count(preg_match("/*\.js$/", $file) > 0)){
								$files[] = $path . "/" . $file;
							}
						}
					}
					return $files;
				}
				$files = jsSearch($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['sysname']."/");
				$files[] = $GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['sysname'].".js";
				$finalList = array();
				foreach($files as $file) {
					$finalList[] = str_replace($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/", "/", $file);
				}
				$out = new jsonOutput($finalList);
			}
		}
		if($_GET['action'] == "list")
		{
			$p = $App->all();
			$out = new jsonOutput();
			$list = array();
			foreach($p as $d => $v)
			{
				$item = array();
				foreach(array("sysname", "name", "author", "email", "maturity", "category", "version", "filetypes") as $key) {
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
			$_POST['sysname'] = str_replace("..", "", $_POST['sysname']);
			$p = $App->filter("sysname", $_POST['sysname']);
			if($p === false) { $app = new App(array(sysname => $_POST['sysname'])); }
			else { $p = $p[0]; }
			foreach(array('name', 'author', 'email', 'version', 'maturity', 'category') as $item) {
				$app->$item = $_POST[$item];
			}
			$app->save();
			//TODO: implement saving changes back to files
			$out = new jsonOutput();
			$out->append("sysname", $app->sysname);
		}
		if($_GET['action'] == "remove") {
			import("models.user");
			$_POST['sysname'] = str_replace("..", "", $_POST['sysname']);
			$user = $User->get_current();
			if(!$user->has_permission("api.ide")) internal_error("permission_denied");
			$app = $App->filter($_POST['sysname']);
			$app = $app[0];
			$app->delete();
			rmdir($GLOBALS['path']."/../apps/".$_POST['sysname']);
			rmdir($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['sysname']);
			$out = new intOutput("ok");
		}
	}