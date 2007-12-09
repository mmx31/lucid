<?php
if($_GET['section'] == "get")
{
	if($_GET['action'] == "list")
	{
	    $dir = opendir("../../desktop/themes/");
		while(($file = readdir($dir)) !== false) {
			if($file == '..' || $file == '.' || $file{0} == '.'){
					continue;
			} else {
				$t = strtolower($file);
				if(is_dir("../../desktop/themes/" . $file)){
					echo($file."\n");
				}
			}
		}
	}
}
?>