<?php
class FtpFs extends BaseFs {
	var $_type="server";
	var $_link;
	var $path = ".";
	function _startup() {
		$this->_link = ftp_connect($this->hostname, $this->port);
		if($this->username != "") $login = ftp_login($this->_link, $this->username, $this->password);
		else $login = ftp_login($this->_link, "anonymous", "anonymous");
		if((!$this->_link) || (!$login)) internal_error("generic_err", $this->_link ? "Authentication Error" : "Connection Error");
	}
	function __destroy() {
		ftp_close($this->_link);
	}
	function _getFileInfo($path) {
		$curdir = ftp_pwd($this->_link);
		$isDir = ftp_chdir($this->_link, $path);
		ftp_chdir($this->_link, $path);
		return array(
			name => basename($path),
			modified => ftp_mdtm($this->_link, $path),
			size => ftp_size($this->_link, $path),
			mimetype => ($isDir ? "text/directory" : "text/plain") //TODO: figure out mimetype?
		);
	}
	function _listPath($path) {
		$dirs = explode("/", $path);
		if($dirs[0] != $path) {
			foreach($dirs as $dir) {
				if($dir != "") {
					$cd = ftp_chdir($this->_link, $dir);
					if(!$cd) return false;	
				}
			}
		}
		$list = ftp_nlist($this->_link, ".");
		$arr = array();
		foreach($list as $dir) {
			array_push($arr, $this->_getFileInfo($path . "/" . $dir));
		}
		return $arr;
	}
	function _read($path) {
		$tmpFile =  tmpfile();
		ftp_fget($this->_link, $tmpFile, $path);
		$content = stream_get_contents($tmpFile);
		fclose($tmpFile);
		return $content;
	}
	function _write($path, $content) {
		$tmpFile = tmpfile();
		fwrite($tmpFile, $content);
		$ret = ftp_fput($this->_link, $path, $tmpFile);
		fclose($tmpFile);
		return $ret;
	}
}
?>