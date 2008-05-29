<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


require("../lib/includes.php");
import("lib.Json.Json");
if($_GET['section'] == "get")
{
	if($_GET['action'] == "list")
	{
	    $dir = opendir($GLOBALS['path']."/../desktop/dojotoolkit/desktop/resources/themes/");
		$p = array();
		while(($file = readdir($dir)) !== false) {
			if($file == '..' || $file == '.' || $file{0} == '.'){
					continue;
			} else {
				$t = strtolower($file);
				if(is_dir($GLOBALS['path']."/../desktop/dojotoolkit/desktop/resources/themes/" . $file)){
					$json = file_get_contents($GLOBALS['path'].'/../desktop/dojotoolkit/desktop/resources/themes/'.$file.'/meta.json');
					$in = Zend_Json::decode($json);
					$in["sysname"] = $file;
					$p[] = $in;
				}
			}
		}
		$out = new jsonOutput($p);
	}
}
if($_GET['section'] == "package") {
	import("models.user");
	$cur = $User->get_current();
}
if($_GET['section'] == "package" && $cur->has_permission("core.administration")) {
	if($_GET['action'] == "install")
	{
		import("lib.package");
		$out = new textareaOutput();	
		if(isset($_FILES['uploadedfile']['name'])) {
			$_FILES['uploadedfile']['name'] = str_replace("..", "", $_FILES['uploadedfile']['name']);
			$target_path = '../../tmp/'.$_FILES['uploadedfile']['name'];
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
				if(package::install($target_path)) $out->append("status", "success");
				else $out->append("error", "Problem installing package");
			} else{
			   $out->append("error", "Problem accessing uploaded package");
			}
		} else { $out->append("error", "No File Uploaded"); }
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
		$name = str_replace("..", "", $_POST['themename']);
		rmdir_recurse($GLOBALS['path']."/../desktop/dojotoolkit/desktop/resources/themes/".$name);
		$out = new intOutput("ok");
	}
}
