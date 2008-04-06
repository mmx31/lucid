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
import("api.vfs.Base");
import("models.user");
if($_GET['section'] == "io")
{
	if(isset($_GET['path'])) $sentpath = $_GET['path'];
	else $sentpath = $_POST['path'];
	$_POST['path'] = str_replace("..", "", $_POST['path']); // fix to stop hacking.
	//parse url for the protocol
	$protocolPart = explode("://", $sentpath, 2);
	if($protocolPart[0] == $_POST['path']) { $protocol = "file"; }
	else { $sentpath = $protocolPart[1]; $protocol = $protocolPart[0]; }
	
	//construct the class
	$class = ucwords($protocol);
	import("api.vfs." . $class);
	$class .= "Fs";
	$module = new $class($_POST['path'] ? $_POST['path'] : $_GET['path']);
	
	if($module->_type == "server") {
		//strip the server URL out of $sentpath
		$sentpath = explode("/", $sentpath, 2);
		$sentpath = isset($sentpath[1]) ? $sentpath[1] : "/";
		
		//check for permissions
		$c = $User->get_current();
		if(!$c->has_permission("api.fs.remote")) internal_error("permission_denied");
	}
	$sentpath = "/" . $sentpath;
	
	//if there's a new path, figure out what protocol it's using as well
	if(isset($_POST['newpath'])) {
		$protocolPart = explode("://", $_POST['newpath'], 2);
		if($protocolPart[0] == $_POST['newpath']) { $newprotocol = "file"; }
		else { $sentnewpath = $protocolPart[1]; $newprotocol = $protocolPart[0]; }
		if($protocol != $newprotocol) {
			$class = ucwords($newprotocol);
			import("api.vfs." . $class);
			$class .= "Fs";
			$newmodule = new $class($_POST['newpath']);
			if($newmodule->_type == "server") {
				//strip the server URL out of $sentnewpath
				$sentnewpath = explode("/", $sentnewpath, 2);
				$sentnewpath = isset($sentnewpath[1]) ? $sentnewpath[1] : "/";
				if(isset($newmodule) && $newmodule->_type == "server") {
					//strip the server URL out of $sentnewpath
					$sentnewpath = explode("/", $sentnewpath, 2);
					$sentnewpath = isset($sentnewpath[1]) ? $sentnewpath[1] : "/";
				}
				
				//check for permissions
				$c = $User->get_current();
				if(!$c->has_permission("api.fs.remote")) internal_error("permission_denied");
			}
		}
		$sentnewpath = "/" . $sentnewpath;
	}
	
	//figure out what do do
	if ($_GET['action'] == "createDirectory") {
	    $module->createDirectory($sentpath);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "copyFile") {
		if(isset($newmodule)) {
			$content = $module->read($sentpath);
			$newmodule->write($sentnewpath, $content);
		}
		else $module->copy($sentpath, $sentnewpath);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "removeFile" || $_GET['action'] == "removeDir") {
		$module->remove($sentpath);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "renameFile") {
		if(isset($newmodule)) {
			$content = $module->read($sentpath);
			$p = $newmodule->write($sentnewpath, $content);
			$module->remove($sentpath);
		}
		else $module->rename($sentpath, $sentnewpath);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "getFolder") {
			$arr = $module->listPath($sentpath);
			$out = new jsonOutput($arr);
	}
	if ($_GET['action'] == "getFile") {
		$content = $module->read($sentpath);
		$out = new jsonOutput(array(contents => $content));
	}
	if ($_GET['action'] == "writeFile") {
		$module->write($sentpath, $_POST['content']);
		$out = new intOutput("ok");
	}
	if($_GET['action'] == "upload") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.upload")) { 
			$out = new textareaOutput(array(
				status => "failed",
				details => "Contact administrator; Your account lacks uploading permissions."
			));
		}
		if(!isset($_SESSION['userid'])) {
			$out = new textareaOutput(array(
				status => "failed",
				details => "Session is dead, please log in again"
			));
		}
		if(isset($_FILES['uploadedfile']['name'])) {
			if($content = file_get_contents($_FILES['uploadedfile']['tmp_name'])
			&& $module->write($sentpath . "/" . basename( $_FILES['uploadedfile']['name']), $content)) {
				$out = new textareaOutput(array(
					status => "success",
					details => $_FILES['uploadedfile']['name']
				));
			} else{
				$out = new textareaOutput(array(
					status => "failed",
					details => "Contact administrator; could not write to disk"
				));
			}
		}
		else {
			$out = new textareaOutput(array(
				status => "failed",
				details => "No file uploaded"
			));
		}
	}
	if($_GET['action'] == "downloadFolder") {
		import("models.user");
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) {
			die("<script type='text/javascript'>alert('Contact administrator; Your account lacks download permissions.');</script>");
		}
		import("lib.zip");
		if($_GET["as"] == "zip") { $newzip = new zip_file("folder.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("folder.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("folder.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files(array("../../files/".$username."/".$sentpath."/*"));
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "compressDownload") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { 
			die("<script type='text/javascript'>alert('Contact administrator; Your account lacks download permissions.');</script>");
		}
		import("lib.zip");
		if($_GET["as"] == "zip") { $newzip = new zip_file("compressed.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("compressed.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("compressed.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files($module->getRealPath($sentpath));
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "download") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) {
			die("<script type='text/javascript'>alert('Contact administrator; Your account lacks download permissions.');</script>");
		}
		$info = $module->getFileInfo($sentpath);
		$type = $info['type'];
		$size = $info['size'];
		$name = $info['name'];
		header("Content-type: $type");
		header("Content-Disposition: attachment;filename=\"$name\"");
		header('Pragma: no-cache');
		header('Expires: 0');
		header("Content-length: $size");
		echo $module->read($sentpath);
	}
	if($_GET['action'] == "display")
	{
		$info = $module->getFileInfo($sentpath);
		$type = $info['type'];
		$size = $info['size'];
		$name = $info['name'];
		header("Content-type: $type");
		header('Pragma: no-cache');
		header('Expires: 0');
		header("Content-length: $size");
		echo $module->read($sentpath);
	}
	if ($_GET['action'] == "info") {
		$out = new jsonOutput();
		$out->set($module->getFileInfo($sentpath));
	}
}
?>
