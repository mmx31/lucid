<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


class SftpFs extends BaseFs {
	var $_type="server";
	var $_link;
	var $path = ".";
	function _startup() {
		$this->_link = ssh2_connect($this->hostname, $this->port ? $this->port : 22);
		if(!is_null($this->username)) $login = @ssh2_auth_password($this->_link, $this->username, $this->password);
		else $login = @ssh2_auth_none($this->_link, "anonymous");
		if((!$this->_link) || is_array($this->_link) || (!$login)) internal_error(!$login ? "remote_authentication_failed" : "remote_connection_failed");
		$this->_sftp = @ssh2_sftp($this->_link,true);
	}
    function _basePath($path=false) {
		return "ssh2.sftp://".$this->_sftp."/".($path ? $path : "");
	}
	function _getRealPath($path) {
		return $this->_basePath($path);
	}
	function __destroy() {
        unset($this->_link);
        unset($this->_sftp);
	}
   	function _getFileInfo($file, $realPath=false) {
		$r = array();
		$r['path'] = $file; //TODO: this is it's real path, get it's vfs path?
		$f = ($realPath ? "" : $this->_basePath()) . $file;
		$r['name'] = basename($f);
		$r["size"] = $this->_getSize($f);
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
		$path = $this->_basePath($path);
		return mkdir($path);
	}
	function _copy($source, $destination) {
		$source = $this->_basePath($source);
		$destination = $this->_basePath($destination);
		return copy($source, $destination);
	}
	function _rename($oldpath, $newpath) {
		$oldpath = $this->_basePath($oldpath);
		$newpath = $this->_basePath($newpath);
		return rename($oldpath, $newpath);
	}
	function _read($path) {
		return file_get_contents($path);
	}
	function _write($path, $content) {
		$path = $this->_basePath($path);
		return file_put_contents($path, $content);
	}
}
