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
	$_POST['path'] = str_replace("..", "", $_POST['path']); // fix to stop hacking.
	//parse url for the protocol
	$protocolPart = explode("://", $_POST["path"]);
	if($protocolPart[0] == $_POST['path']) { $protocol = "file"; }
	else { $_POST["path"] = "/".$protocolPart[1]; $protocol = $protocolPart[0]; }
	//construct the class
	$class = ucwords($protocol);
	import("api.vfs." . $class);
	$class .= "Fs";
	$module = new $class($_POST['path']);
	//figure out what do do
	if ($_GET['action'] == "createDirectory") {
	    $module->createDirectory($_POST['path']);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "copyFile") {
		//TODO: if protocols differ, copy the file between protocols!
		$module->copy($_POST['path'], $_POST['newpath']);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "removeFile" || $_GET['action'] == "removeDir") {
		$module->remove($_POST['path']);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "renameFile") {
		//TODO: if protocols differ, move the file between protocols!
		$module->rename($_POST['path'], $_POST['newpath']);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "getFolder") {
			$arr = $module->listPath($_POST['path']);
			$out = new jsonOutput($arr);
	}
	if ($_GET['action'] == "getFile") {
		$content = $module->read($_POST['path']);
		$out = new jsonOutput(array(contents => $content));
	}
	if ($_GET['action'] == "writeFile") {
		$module->write($_POST['path'], $_POST['content']);
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
			$target_path = '../../files/'.$username.'/'.$_GET['path'];
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
		//TODO: get this to use the VFS
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		import("lib.zip");
		if($_GET["as"] == "zip") { $newzip = new zip_file("folder.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("folder.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("folder.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files(array("../../files/".$username."/".$_GET['path']."/*"));
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
		$newzip->add_files("../../files/".$username."/".$_GET['path']);
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "download") {
		//TODO: get this to use the VFS
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		$f = "../../files/" . $username . "/" . $_GET['path'];
		if(file_exists($f))
		{
			$name = basename($f);
			$type = mime_content_type($f);
			$size = filesize($f);
			header("Content-type: $type");
			header("Content-Disposition: attachment;filename=\"$name\"");
			header('Pragma: no-cache');
			header('Expires: 0');
			header("Content-length: $size");
			readfile($f);
		}
	}
	if($_GET['action'] == "display")
	{
		//TODO: get this to use the VFS
		$f = "../../files/" . $username . "/" . $_GET['path'];
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
			$out->set($module->getFileInfo($_POST['path']));
	}
}
?>
