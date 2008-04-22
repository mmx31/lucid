<?php
import("lib.Json.Json");
import("models.app");
import("lib.unzip");

class package {
	function install($path, $unzip=true) {
		if($unzip) {
			$zip = new dUnzip2($path);
			$unzipPath=$GLOBALS['path']."/../tmp/".basename($path)."/";
			$zip->getList();
			if (!file_exists($unzipPath)) { mkdir($unzipPath); }
			$zip->unzipAll($unzipPath);
		}
		else
			$unzipPath = $path;
		$info = file_get_contents($unzipPath."/meta.json");
		if($info == false) return false;
		$info = Zend_Json::decode($info);
		if($info == false) return false;
		$method="_install_".$info['type'];
		package::$method($info, $unzipPath);
		
		if($unzip) rmdir($unzipPath);
		return true;
	}
	
	function remove($path) {
		//TODO
	}
	
	function _install_application($info, $path) {
		global $App;
		$app = new $App();
		$app->name = $info['name'];
		$app->author = $info['author'];
		$app->email = $info['email'];
		$app->version = $info['version'];
		$app->maturity = $info['maturity'];
		$app->category = $info['category'];
		$app->filetypes = $info['filetypes'];
		$app->code = file_get_contents($path."/code.js");
		$app->save();
		$backendDir = $GLOBALS['path']."../apps/".$app->id;
		if(is_dir($path."/files")) rename($path."/files", $backendDir);
	}
	function _install_theme($info, $path) {
		$newpath = $GLOBALS['path']."/../desktop/themes/".strtolower($info['name']);
		rename($path."/".strtolower($info['name']), $newpath);
		rename($path."/meta.json", $newpath."/meta.json");
	}
	function _install_translation($info, $path) {
		function rsearch($path) {
			$dirs = array();
			while(($file = readdir($dir)) !== false){
				if($file{0} == '.'){
					continue;
				}
				else {
					if(is_dir($path . "/" . $file)) {
						if($file == "nls") $dirs[] = $path."/".$nls;
						else {
							$search = rsearch($path . "/" . $file);
							$dirs=array_merge($dirs, $search);
						}
					}
				}
			}
		}
		$dirs = rsearch($path);
		foreach($dirs as $dir) {
			$dir = substr($dir, 0, count($path));
			if(!is_dir($GLOBALS['path']."/../desktop/dojotoolkit/".$dir."/".$info['locale'])) {
				rename($path."/".$dir, $GLOBALS['path']."/../".$dir);
			}
		}
	}
	function _install_update($info, $path) {
		function rcopy($path, $newpath) {
			while(($file = readdir($dir)) !== false){
				if($file{0} == '.'){
					continue;
				}
				else {
					if(is_dir($path . "/" . $file)) {
						mkdir($newpath . "/" . $file);
						rcopy($path . "/" . $file, $newpath . "/" . $file);
					}
					else {
						copy($path . "/" . $file, $newpath . "/" . $file);
					}
				}
			}
		}
		rcopy($path."/root/", $GLOBALS['path']."/../");
		@include($path . "/update.php");
	}
}