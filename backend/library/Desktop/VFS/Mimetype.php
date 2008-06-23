<?php

class Desktop_VFS_Mimetype {
	public function get($filepath, $backend="auto") {
		if(function_exists('mime_content_type') || $backend == "mime")
			return mime_content_type($filepath);
		else if(function_exists('finfo_open') || $backend == "finfo")
			return self::finfo_get($filepath);
		else if(class_exists('System_Command') || $backend == "cmd")
			return self::cmd_get($filepath);
		else //if($backend == "guess")
			return self::guess_get($filepath);
	}
	private function finfo_get($filename) {
        $finfo    = finfo_open(FILEINFO_MIME);
        $mimetype = finfo_file($finfo, $filename);
        finfo_close($finfo);
        return $mimetype;
    }
	private function cmd_get($file) {
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
	private function guess_get($file) {
		//Guess the mimetype based on extension
		if(is_dir($file)) return "text/directory";
		require_once(dirname(__FILE__)."/MimetypeList.php");
		global $Desktop_VFS_MimetypeList;
		$info = pathinfo($filename);
		$ext = $info['extension'];
		foreach($Desktop_VFS_MimetypeList as $key=>$value) {
			if($ext == $key) return $value;
			$exts = str_split($key, " ");
			if(count($exts) > 0) {
				foreach($exts as $check) {
					if($ext == $check) return $value;
				}
			}
		}
		return "text/plain";
	}
}
