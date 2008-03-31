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
if($_GET['section'] == "io")
{
	if(isset($_GET['path'])) $sentpath = $_GET['path'];
	else $sentpath = $_POST['path'];
	$_POST['path'] = str_replace("..", "", $_POST['path']); // fix to stop hacking.
	//parse url for the protocol
	$protocolPart = explode("://", $sentpath);
	if($protocolPart[0] == $_POST['path']) { $protocol = "file"; }
	else { $sentpath = "/".$protocolPart[1]; $protocol = $protocolPart[0]; }
	//construct the class
	$class = ucwords($protocol);
	import("api.vfs." . $class);
	$class .= "Fs";
	$module = new $class($_POST['path']);
	//if there's a new path, figure out what protocol it's using as well
	if(isset($_POST['newpath'])) {
		$protocolPart = explode("://", $_POST['newpath']);
		if($protocolPart[0] == $_POST['newpath']) { $newprotocol = "file"; }
		else { $sentnewpath = "/".$protocolPart[1]; $newprotocol = $protocolPart[0]; }
		if($protocol != $newprotocol) {
			$class = ucwords($newprotocol);
			import("api.vfs." . $class);
			$class .= "Fs";
			$newmodule = new $class($_POST['newpath']);
		}
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
			$newmodule->write($sentnewpath, $content);
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
		if(!$user->has_permission("api.fs.upload")) { die("<textarea>{status: 'failed', details: 'Contact administrator; Your account lacks uploading permissions. '}</textarea>"); }
		if(!isset($_SESSION['userid'])) {
			die("<textarea>{status: 'failed', details: 'Session is dead.'}</textarea>");
		}
		if(isset($_FILES['uploadedfile']['name'])) {
			//TODO: get this to use the VFS
			$target_path = '../../files/'.$username.'/'.$sentpath;
			$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
			    echo "<textarea>{status: 'success', details: '" . $_FILES['uploadedfile']['name'] . "'}</textarea>";
			} else{
			    echo "<textarea>{status: 'failed', details: 'Contact administrator; could not write to disk'}</textarea>";
			}
		}
		else {
			#echo "/*";
			#foreach($_FILES as $file)
			#{
			#	echo $file['name'] . "\n";
			#}
			#echo "*/";
			die("<textarea>{status: 'failed', details: 'File not uploaded'}</textarea>");
		}
	}
	if($_GET['action'] == "downloadFolder") {
		import("models.user");
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
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
		//TODO: get this to use the VFS
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		import("lib.zip");
		if($_GET["as"] == "zip") { $newzip = new zip_file("compressed.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("compressed.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("compressed.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files("../../files/".$username."/".$sentpath);
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "download") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		$name = basename($sentpath);
		$type = mime_content_type($f);
		$size = filesize($f);
		header("Content-type: $type");
		header("Content-Disposition: attachment;filename=\"$name\"");
		header('Pragma: no-cache');
		header('Expires: 0');
		header("Content-length: $size");
		echo $module->read($sentpath);
	}
	if($_GET['action'] == "display")
	{
		//TODO: get this to use the VFS
		$f = "../../files/" . $username . "/" . $sentpath;
		if(file_exists($f))
		{
			$name = basename($f);
			$type = mime_content_type($f);
			$size = filesize($f);
			header("Content-type: $type");
			header('Pragma: no-cache');
			header('Expires: 0');
			header("Content-length: $size");
			readfile($f);
		}
	}
	if ($_GET['action'] == "info") {
			$out = new jsonOutput();
			$out->set($module->getFileInfo($sentpath));
	}
}
?>
