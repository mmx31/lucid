<?php
//PHP completely fails as a programming language, so we can't do this (that would be far too maintainable!)
//Let's copy the entire class instead! Yeah, awesome idea!!! (not...)
/*
import("api.vfs.File");
class PublicFs extends FileFs {
	function _startup() {}
	function _basePath($path=false) {
		return "../../public/" . ($path ? $path : "");
	}
}
*/
import("models.user");
class PublicFs extends BaseFs {
	var $_username;
	function _basePath($path=false) {
		return "../../public/" . ($path ? $path : "");
	}
        function _getRealPath($path) {
                return $this->_basePath($path);
        }
	function _getFileInfo($file, $realPath=false) {
		$r = array();
		$r['path'] = $file;
		$f = ($realPath ? "" : $this->_basePath()) . $file;
		$r['name'] = basename($f);
		if(is_dir($f)) {
			$r["type"] = "text/directory";
		}
		else if(is_file($f)) {
			$r["modified"] = date ("F d Y H:i:s.", filemtime($f));
			$r["size"] = filesize($f);
			$r["type"] = mime_content_type($f);
			if($r["type"] === false && function_exists("finfo_open")) {
				//fallback on the Fileinfo PECL extention
				$finfo = finfo_open(FILEINFO_MIME);
				$r["type"] = finfo_file($finfo, $f);
				finfo_close($finfo);
			}
			//TODO: guess mimetype based on extension?
		}
		return $r;
	}
	function _listPath($path) {
	    $dir = opendir($this->_basePath() . $path);
		if(!$dir){
			return false;
		} else {
			$arr = array();
			while(($file = readdir($dir)) !== false){
				if($file == '..' || $file == '.'){
					continue;
				} else {
					array_push($arr, $this->_getFileInfo($file, true));
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
		return mkdir($path, 0777, true);
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
		$path = $this->_basePath($path);
		return file_get_contents($path);
	}
	function _write($path, $content) {
		$path = $this->_basePath($path);
		return file_put_contents($path, $content);
	}
}
?>
