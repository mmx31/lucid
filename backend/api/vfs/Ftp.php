<?php
class FtpFs extends BaseFs {
	var $_type="server";
	var $_link;
	var $path = ".";
	function _startup() {
		$this->_link = ftp_connect($this->hostname, $this->port);
		if(!is_null($this->username)) $login = ftp_login($this->_link, $this->username, $this->password);
		else $login = ftp_login($this->_link, "anonymous", "anonymous");
		if((!$this->_link) || (!$login)) internal_error("generic_err", $this->_link ? "Authentication Error" : "Connection Error");
		@ftp_pasv($this->_link,true);
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
					if(!$cd) return false;
				}
			}
		}
		return true;
	}
	function _getFileInfo($path) {
		$curdir = ftp_pwd($this->_link);
		$isDir = @ftp_chdir($this->_link, $path);
		ftp_chdir($this->_link, $curdir);
		return array(
			name => basename($path),
			modified => ftp_mdtm($this->_link, $path),
			size => ftp_size($this->_link, $path),
			type => ($isDir ? "text/directory" : "text/plain") //TODO: figure out mimetype?
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
}
?>