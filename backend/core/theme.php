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
error_reporting(0); //<<<<<<<<<<<<<<<<<<<LEAVE THIS ALONE!!!
require("../lib/includes.php");
import("lib.Json.Json");
if($_GET['section'] == "get")
{
	if($_GET['action'] == "list")
	{
	    $dir = opendir($GLOBALS['path']."/../desktop/themes/");
		$p = array();
		while(($file = readdir($dir)) !== false) {
			if($file == '..' || $file == '.' || $file{0} == '.'){
					continue;
			} else {
				$t = strtolower($file);
				if(is_dir($GLOBALS['path']."/../desktop/themes/" . $file)){
					$json = file_get_contents($GLOBALS['path'].'/../desktop/themes/'.$file.'/meta.json');
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
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)
			&& package::install($target_path)) {
				$out->append("status", "success");
			} else{
			   $out->append("error", "Problem accessing uploaded file");
			}
		} else { $out->append("error", "No File Uploaded"); }
	}
	if($_GET['action'] == "remove") {
		$name = str_replace("..", "", $_POST['name']);
		rmdir($GLOBALS['path']."/../desktop/themes/".$name);
		$out = new intOutput("ok");
	}
}
