<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/
require("../lib/includes.php");
import("api.vfs.Base");
import("models.user");

//check for mimetype function, if not make one so that it uses the Fileinfo pecl module
function findexts ($filename)
{
	$filename = strtolower($filename) ;
	$exts = split("[/\\.]", $filename) ;
	$n = count($exts)-1;
	$exts = $exts[$n];
	return $exts;
} 
function mime_content_type_alt($file) {
	//Guess the mimetype based on extension
	if(is_dir($file)) return "text/directory";
	import("api.fs_mimetypes");
	global $fs_mimetypes;
	$ext = findexts($file);
	foreach($fs_mimetypes as $key=>$value) {
		if($ext == $key) return $value;
		$exts = explode(" ",$key);
		for($a=0;$a<count($exts);$a++) {
			if($exts[$a] == $ext) return $value;
		}
	}
	return "text/plain";
}
if (!function_exists('mime_content_type')) {
	if(function_exists('finfo_open')) {
	    function mime_content_type($filename) {
	        $finfo    = finfo_open(FILEINFO_MIME);
	        $mimetype = finfo_file($finfo, $filename);
	        finfo_close($finfo);
	        return $mimetype;
	    }
	}
	else if(class_exists('System_Command')) {
		function mime_content_type($file) {
			$cmd = new System_Command;
			if(!$cmd->which("file")) {
				unset($cmd);
				return false;
			}
			$cmd->pushCommand("file", "-bi '{$file}'");
	        $res = $cmd->execute();
	        unset($cmd);
			return $res;
		}
	}
	else {
	function mime_content_type($file) {
			//Guess the mimetype based on extension
			if(is_dir($file)) return "text/directory";
			import("api.fs_mimetypes");
			global $fs_mimetypes;
			$ext = findexts($file);
			foreach($fs_mimetypes as $key=>$value) {
				if($ext == $key) return $value;
				$exts = explode($key, " ");
				if(count($exts) > 0) {
					foreach($exts as $check) {
						if($ext == $check) return $value;
					}
				}
			}
			return "text/plain";
}	}
}

if($_GET['section'] == "io")
{
	if(isset($_GET['path'])) $sentpath = $_GET['path'];
	else $sentpath = $_POST['path'];
	$sentpath = str_replace("..", "", $sentpath); // fix to stop hacking.
	//parse url for the protocol
	$protocolPart = explode("://", $sentpath, 2);
	if(!isset($protocolPart[1])) { $protocol = "file"; }
	else { $sentpath = $protocolPart[1]; $protocol = $protocolPart[0]; }
	$sentpath = str_replace("..", "", $sentpath);
	//construct the class
	$class = ucwords($protocol);
	import("api.vfs." . $class);
	$class .= "Fs";
	$module = new $class(isset($_POST['path']) ? $_POST['path'] : $_GET['path']);
	
	if($module->_type == "server") {
		//strip the server URL out of $sentpath
		$sentpath = explode("/", $sentpath, 2);
		$sentpath = isset($sentpath[1]) ? $sentpath[1] : "/";
		
		//check for permissions
		$c = $User->get_current();
		if(!$c->has_permission("api.filesystem.remote")) internal_error("permission_denied");
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
				if(!$c->has_permission("api.filesystem.remote")) internal_error("permission_denied");
			}
		}
		$sentnewpath = "/" . $sentnewpath;
		$sentnewpath = str_replace("..", "", $sentnewpath);
	}
	
	//figure out what do do
	if ($_GET['action'] == "createDirectory") {
	    $module->createDirectory($sentpath);
		$out = new intOutput("ok");
	}
	if ($_GET['action'] == "getQuota") {
		$total = $module->quota("quota");
		$remaining = $module->quota("remaining");
		$out = new jsonOutput(array(
			'total' => $total,
			'remaining' => $remaining,
			'used' => $total - $remaining
		));
	}
	if ($_GET['action'] == "copyFile") {
		function modCopy($smodule, $source, $tmodule, $target) {
			if(get_class($smodule) == get_class($tmodule)) {
				$smodule->copy($source, $target);
			}
			else {
				$content = $smodule->read($source);
				$tmodule->write($target, $content);
			}
		}
		//function to recursively copy a directory
		function recursiveCopy($smodule, $source, $tmodule, $target)
		{
			$sinfo = $smodule->getFileInfo($source);
			if($sinfo['type'] == "text/directory")
			{
				$tmodule->createDirectory($target);
				foreach($smodule->listPath($source) as $entry)
				{
					if($entry['type'] == "text/directory")
					{
						recursiveCopy($smodule, $source . '/' . $entry['name'] , $tmodule, $target . '/' . $entry['name']);
						continue;
					}
					modCopy($smodule, $entry['path'], $tmodule, $target . '/' . $entry['name']);
				}
			
			}
			else
			{
				modCopy($smodule, $source, $tmodule, $target);
			}
		}
		if(isset($newmodule)) {
			recursiveCopy($module, $sentpath, $newmodule, $sentnewpath);
		}
		else recursiveCopy($module, $sentpath, $module, $sentnewpath);
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
		$out = new jsonOutput(array("contents" => $content));
	}
	if ($_GET['action'] == "writeFile") {
		$module->write($sentpath, $_POST['content']);
		$out = new intOutput("ok");
	}
	if($_GET['action'] == "upload") {
        import("api.fs_upload");
	}
	if($_GET['action'] == "download") {
		import("models.user");
		$user = $User->get_current();
		if(!$user->has_permission("api.filesystem.download")) {
			die("<script type='text/javascript'>alert('Contact administrator; Your account lacks download permissions.');</script>");
		}
		$info = $module->getFileInfo($sentpath);
		$type = $info['type'];
		$size = $info['size'];
		$name = $info['name'];
		if($type == "text/directory") {
			import("lib.zip");
			if(!isset($_GET["as"])) $_GET["as"] = "zip";
			if($_GET["as"] == "zip") { $newzip = new zip_file("compressed.zip"); }
			if($_GET["as"] == "gzip") { $newzip = new gzip_file("compressed.tgz"); }
			if($_GET["as"] == "bzip") { $newzip = new bzip_file("compressed.tbz2"); }
			$realpath = $module->getRealPath($sentpath);
			$newzip->set_options(array(
				'inmemory' => 1,
				'recurse' => 1,
				'storepaths' => 1,
				'basedir' => dirname($realpath)
			));
			$newzip->add_files(basename($realpath));
			$newzip->create_archive();
			$newzip->download_file();
		}
		else {
			if(isset($_GET["as"])) {
				import("lib.zip");
				if($_GET["as"] == "zip") { $newzip = new zip_file("compressed.zip"); }
				if($_GET["as"] == "gzip") { $newzip = new gzip_file("compressed.tgz"); }
				if($_GET["as"] == "bzip") { $newzip = new bzip_file("compressed.tbz2"); }
				$realpath = $module->getRealPath($sentpath);
				$newzip->set_options(array(
					'inmemory' => 1,
					'recurse' => 1,
					'storepaths' => 1,
					'basedir' => dirname($realpath)
				));
				$newzip->add_files(basename($realpath));
				$newzip->create_archive();
				$newzip->download_file();
			}
			else {
				header("Content-type: $type");
				header("Content-Disposition: attachment;filename=\"$name\"");
				header('Pragma: no-cache');
				header('Expires: 0');
				header("Content-length: $size");
				echo $module->read($sentpath);
			}
		}
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
