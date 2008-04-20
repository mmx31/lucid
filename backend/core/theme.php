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
		$blah = new jsonOutput;
		$p = array();
		while(($file = readdir($dir)) !== false) {
			if($file == '..' || $file == '.' || $file{0} == '.'){
					continue;
			} else {
				$t = strtolower($file);
				if(is_dir($GLOBALS['path']."/../desktop/themes/" . $file)){
					$json = file_get_contents($GLOBALS['path'].'/../desktop/themes/'.$file.'/meta.json');
					$in = Zend_Json::decode($json);
					$p[] = array("sysname" => $file, "name" => $in["name"], "author" => $in["author"], "email" => $in["email"], "version" => $in["version"], "wallpaper" => $in["wallpaper"], "preview" => $in["preview"]);
				}
			}
		}
		$blah->set($p);
	}
}
