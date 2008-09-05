<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


class FtpFs extends BaseFs {
	var $_type="server";
	var $_link;
	var $path = ".";
	function _startup() {
		$this->_link = ftp_connect($this->hostname, $this->port);
		if(!is_null($this->username)) $login = @ftp_login($this->_link, $this->username, $this->password);
		else $login = @ftp_login($this->_link, "anonymous", "anonymous");
		if((!$this->_link) || (!$login)) internal_error(!$login ? "remote_authentication_failed" : "remote_connection_failed");
		@ftp_pasv($this->_link,true);
	}
	function _getRealPath($path) {
		$p=$this->_read($path);
		$tfile=$GLOBALS['path']."/../tmp/".basename($path);
		file_put_contents($tfile, $p);
		return $tfile;
	}
	function __destroy() {
		ftp_close($this->_link);
	}
	function _chdir($path) {
		$dirs = explode("/", $path);
		if($dirs[0] != $path) {
			foreach($dirs as $dir) {
				if($dir != "") {
					$cd = ftp_chdir($this->_link, $dir);
					if(!$cd) internal_error("generic_err", "path does not exist");
				}
			}
		}
		return true;
	}
	function _getFileInfo($path) {
		//$curdir = ftp_pwd($this->_link);
		//$isDir = @ftp_chdir($this->_link, $path);
		//ftp_chdir($this->_link, $curdir);
		$size = ftp_size($this->_link, $path);
		return array(
			name => basename($path),
			modified => ftp_mdtm($this->_link, $path),
			size => $size,
			type => ($size == -1 ? "text/directory" : "text/plain") //TODO: figure out mimetype?
		);
	}
	function _listPath($path) {
		$this->_chdir($path);
		$list = ftp_nlist($this->_link, ".");
		$arr = array();
		foreach($list as $dir) {
			array_push($arr, $this->_getFileInfo($path . "/" . $dir));
		}
		return $arr;
	}
	function _read($path) {
		$this->_chdir(dirname($path));
		$tmpFile =  tmpfile();
		ftp_fget($this->_link, $tmpFile, basename($path), FTP_BINARY);
		$content = "";
		fseek($tmpFile, 0);
		while(!feof($tmpFile)) {
			$content = $content . fread($tmpFile, 4096);
		}
		fclose($tmpFile);
		return $content;
	}
	function _write($path, $content) {
		$tmpFile = tmpfile();
		fwrite($tmpFile, $content);
		fseek($tmpFile, 0);
		$ret = ftp_fput($this->_link, $path, $tmpFile, FTP_BINARY);
		fclose($tmpFile);
		return $ret;
	}
	function _createDirectory($path) {
		$this->_chdir(dirname($path));
		return ftp_mkdir($this->_link, basename($path));
	}
	function _copy($oldpath, $newpath) {
		$content = $this->_read($oldpath);
		return $this->_write($newpath, $content);
	}
	function _rename($oldpath, $newpath) {
		$content = $this->_read($oldpath);
		$w = $this->_write($newpath, $content);
		$d = $this->_remove($oldpath);
		return ($w && $d);
	}
	function _remove($path) {
		$this->_chdir(dirname($path));
		$this->_deltree(basename($path));
	}
	function _deltree($path)
	{
		if (!(@ftp_rmdir($this->_link, $path) || @ftp_delete($this->_link, $path)))
		{
			$list = ftp_nlist($this->_link, $path);
			if (!empty($list))
			foreach($list as $value)
			$this->_deltree($value);
		}
		@ftp_rmdir($this->_link, $path);
	}
}