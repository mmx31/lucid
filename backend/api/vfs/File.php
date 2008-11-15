<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


import("models.user");
class FileFs extends BaseFs {
	var $_username;
	function _startup() {
		global $User;
		$cur = $User->get_current();
		$this->_username = $cur->username;
	}
	function _basePath($path=false) {
		return $GLOBALS['path'] . "/../files/".$this->_username . "/" . ($path ? $path : "");
	}
	function _getRealPath($path) {
		return $this->_basePath($path);
	}
	function _getRemainingQuota() {
		global $User;
		$cur = $User->get_current();
		$quota = $cur->get_quota();
		if($quota == 0) { return 0; } //no quota
		$current = $this->_getSize($this->_basePath("/"));
		$total = $quota - $current;
		return intval($total);
	}
	function _checkUserQuota1() {
		global $User;
		$cur = $User->get_current();
		$quota = $cur->get_quota();
		return intval($quota);
	}
	function _checkUserQuota() {
		$quota = $this->_checkUserQuota1();
		$current = $this->_getSize($this->_basePath("/"));
		if($current >= $quota) {
			if($quota == 0) { return 0; } //no quota
			$blah = new intOutput();
			$blah->set("quota_exceeded");
			die();
		}
		return true;
	}
		
	function _getSize($directory, $format=false) //works for files and folders
	{
		$size = 0;
		if(substr($directory,-1) == '/')
		{
			$directory = substr($directory,0,-1);
		}
		if(!file_exists($directory) || !is_dir($directory) || !is_readable($directory))
		{
			return filesize($directory);
		}
		if($handle = opendir($directory))
		{
			while(($file = readdir($handle)) !== false)
			{
				$path = $directory.'/'.$file;
				if($file != '.' && $file != '..')
				{
					if(is_file($path))
					{
						$size += filesize($path);
					}elseif(is_dir($path))
					{
						$handlesize = $this->_getSize($path);
						if($handlesize >= 0)
						{
							$size += $handlesize;
						}else{
							return -1;
						}
					}
				}
			}
			closedir($handle);
		}
		if($format == TRUE)
		{
			if($size / 1048576 > 1)
			{
				return round($size / 1048576, 1).' MB';
			}elseif($size / 1024 > 1)
			{
				return round($size / 1024, 1).' KB';
			}else{
				return round($size, 1).' bytes';
			}
		}else{
			return $size;
		}
	} 
	function _getFileInfo($file, $realPath=false) {
		$r = array();
		$r['path'] = $file; //TODO: this is it's real path, get it's vfs path?
		$f = ($realPath ? "" : $this->_basePath()) . $file;
		$r['name'] = basename($f);
		$r["size"] = $this->_getSize($f);
		$r["baseQuota"] = $this->_checkUserQuota1();
		$r["remainingQuota"] = $this->_getRemainingQuota();
		if(is_dir($f)) {
			$r["type"] = "text/directory";
		}
		else if(is_file($f)) {
			$r["modified"] = date ("F d Y H:i:s.", filemtime($f));
			$r["type"] = mime_content_type($f);
			if($r["type"] == false) { $r["type"] = mime_content_type_alt($f); }
		}
		//get ID3 info if available
		if(function_exists("id3_get_tag")) {
			$id3 = id3_get_tag($f);
			foreach($id3 as $key=>$value) {
				$r["id3".str_replace(" ", "", ucwords($key))] = $value;
			}
		}
		return $r;
	}
	function _listPath($path) {
	    $dir = opendir($this->_basePath($path));
		if(!$dir){
			return false;
		} else {
			$arr = array();
			while(($file = readdir($dir)) !== false){
				if($file == '..' || $file == '.'){
					continue;
				} else {
					array_push($arr, $this->_getFileInfo($this->_basePath($path . "/" . $file), true));
				}
			}
			return $arr;
		}
	}
	function _remove($path) {
		$path = $this->_basePath($path);
		return $this->_deltree($path);
	}
	function _deltree( $f ){
	    if( is_dir( $f ) ){
	        foreach( scandir( $f ) as $item ){
	            if( !strcmp( $item, '.' ) || !strcmp( $item, '..' ) )
	                continue;       
	            $this->_deltree( $f . "/" . $item );
	        }   
	        return rmdir( $f );
	    }
	    else{
	        return unlink( $f );
	    }
	}
	function _createDirectory($path) {
		$this->_checkUserQuota();
		$path = $this->_basePath($path);
		return mkdir($path);
	}
	function _copy($source, $destination) {
		$this->_checkUserQuota();
		$source = $this->_basePath($source);
		$destination = $this->_basePath($destination);
		return copy($source, $destination);
	}
	function _rename($oldpath, $newpath) {
		$this->_checkUserQuota();
		$oldpath = $this->_basePath($oldpath);
		$newpath = $this->_basePath($newpath);
		return rename($oldpath, $newpath);
	}
	function _read($path) {
		$path = $this->_basePath($path);
		return file_get_contents($path);
	}
	function _quota($remaining) {
		if($remaining == "remaining") {
		return $this->_getRemainingQuota();
		}
		else if($remaining == "quota") {
		global $User;
		$cur = $User->get_current();
		$quota = $cur->get_quota();
		return $quota;
		}
	}
	function _write($path, $content) {
		$this->_checkUserQuota();
		$path = $this->_basePath($path);
		return file_put_contents($path, $content);
	}
}
