<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.app");
	import("models.user");
	
	function jsSearch($path, $strip = "") {
		$files = array();
		$dir = opendir($path);
		while(($file = readdir($dir)) !== false){
			if($file{0} == '.'){
				continue;
			}
			else {
				$newFile = str_replace($strip, $strip === "" ? "" : "/", $path . "/" . $file);
				if(is_dir($path . "/" . $file)) {
					$files[$file] = jsSearch($path . "/" . $file, $strip);
				}
				else
					$files[] = $file;
			}
		}
		return $files;
	}
	
    if($_GET['section'] == "install")
	{
		$cur = $User->get_current();
		if($_GET['action'] == "package" && $cur->has_permission("core.app.write"))
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
				$_POST['filename'] = str_replace("..", "", $_POST['filename']);
				$file = $GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['filename'];
				$content = file_get_contents($file);
				$out = new jsonOutput(array(
					"contents" => $content
				));
			}
			else {
				$_POST['sysname'] = str_replace("..", "", $_POST['sysname']);
				$files=array();
				$files[$_POST['sysname']] = jsSearch($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['sysname'],
									$GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/");
				$files[] = $_POST['sysname'].".js";
				$out = new jsonOutput($files);
			}
		}
		if($_GET['action'] == "list")
		{
			$p = $App->all();
			$out = new jsonOutput();
			$list = array();
			foreach($p as $d => $v)
			{
				//check permission metadata
				//if the user does not have the right permissions, skip it
				if(!empty($v->permissions)) {
					$continue = false;
					$user = $User->get_current();
					foreach($v->permissions as $perm) {
						if(!$user->has_permission($perm)) $continue = true;
					}
					if($continue) continue;
				}
				$item = array();
				foreach(array("sysname", "name", "author", "email", "maturity", "category", "version", "icon", "filetypes", 'compatible') as $key) {
					$item[$key] = $v->$key;
				}
				array_push($list, $item);
			}
			$out->set($list);
		}
		if($_GET['action'] == "listAll")
		{
			$p = $App->all();
			$out = new jsonOutput();
			$list = array();
			foreach($p as $d => $v)
			{
				$item = array();
				foreach(array("sysname", "name", "author", "email", "maturity", "category", "version", "filetypes", "compatible") as $key) {
					$item[$key] = $v->$key;
				}
				$item["files"] = array();
				if(is_dir($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$item['sysname']))
					$item["files"][$v->sysname] = jsSearch($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$v->sysname,
												$GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/");
				$item["files"][] = $v->sysname.".js";
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
			if(!$user->has_permission("core.app.write")) internal_error("permission_denied");
			//if(!isset($_POST['filename'])) {
				$_POST['sysname'] = str_replace("..", "", $_POST['sysname']);
				$p = $App->filter("sysname", $_POST['sysname']);
				if($p === false) { $app = new App(array(sysname => $_POST['sysname'])); }
				else { $app = $p[0]; }
				foreach(array('name', 'author', 'email', 'version', 'maturity', 'category') as $item) {
					if(isset($_POST[$item]))
						$app->$item = $_POST[$item];
				}
				$app->save();
			//}
			if(isset($_POST['filename'])) {
				$_POST['filename'] = str_replace("..", "", $_POST['filename']);
				file_put_contents($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['filename'], $_POST['content']);
			}
			$out = new jsonOutput(array(status => "ok"));
			if($app) $out->append("sysname", $app->sysname);
		}
		if($_GET['action'] == "createFolder") {
			import("models.user");
			$user = $User->get_current();
			if(!$user->has_permission("core.app.write")) internal_error("permission_denied");
			$_POST['dirname'] = str_replace("..", "", $_POST['dirname']);
			mkdir($GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['dirname'], 0777);
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "remove") {
			function rmdir_recurse($file) {
			    if (is_dir($file) && !is_link($file)) {
			        foreach(glob($file.'/*') as $sf) {
			            if ( !rmdir_recurse($sf) ) {
			                return false;
			            }
			        }
			        return rmdir($file);
			    } else {
			        return unlink($file);
			    }
			}
			
			import("models.user");
			$user = $User->get_current();
			if(!$user->has_permission("core.app.write")) internal_error("permission_denied");
			if($_POST['sysname']) {
				//delete the whole app
				$app = $App->filter("sysname", $_POST['sysname']);
				$app = $app[0];
				$app->delete();
				$_POST['sysname'] = str_replace("..", "", $_POST['sysname']);
				foreach(array(
					$GLOBALS['path']."/../apps/".$_POST['sysname'],
					$GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['sysname'],
					$GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['sysname'].".js"
				) as $dir) {
					if(is_dir($dir)) rmdir_recurse($dir);
					else if(is_file($dir)) unlink($dir);
				}
			}
			else {
				//delete just that file
				
				//first, check to see if it's the main file
				//this cannot be removed
				
				$parts = explode("/", $_POST['filePath']);
				if(!(count($parts) >= 2 && $parts[0] != "")) internal_error("generic_err");
				
				//if it's all good, delete it.
				$_POST['filePath'] = str_replace("..", "", $_POST['filePath']);
				$dir = $GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/".$_POST['filePath'];
				if(is_dir($dir)) rmdir_recurse($dir);
				else if(is_file($dir)) unlink($dir);
			}
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "rename") {
			//cannot rename the main file
			$parts = explode("/", $_POST['origName']);
				if(!(count($parts) >= 2 && $parts[0] != "")) internal_error("generic_err");
			
			function recursive_rename( $source, $target )
		    {
		        if ( is_dir( $source ) )
		        {
		            @mkdir( $target, 0777 );
		           
		            $d = dir( $source );
		           
		            while ( FALSE !== ( $entry = $d->read() ) )
		            {
		                if ( $entry{0} == '.' )
		                {
		                    continue;
		                }
		               
		                $Entry = $source . '/' . $entry;           
		                if ( is_dir( $Entry ) )
		                {
		                    recursive_rename( $Entry, $target . '/' . $entry );
		                    continue;
		                }
		                rename( $Entry, $target . '/' . $entry );
		            }
		           
		            $d->close();
		        }else
		        {
		            return rename( $source, $target );
		        }
				return true;
		    }
			
			$_POST['origName'] = $GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/"
				. str_replace("..", "", $_POST['origName']);
			$_POST['newName'] = $GLOBALS['path']."/../desktop/dojotoolkit/desktop/apps/" 
				. str_replace("..", "", $_POST['newName']);
			$out = new intOutput(recursive_rename($_POST['origName'], $_POST['newName']) ? "ok":"generic_err");
		}
	}
