<?php
if($_POST['section'] == "get")
{
	if($_POST['action'] == "list")
	{
	    $dir = opendir("../desktop/themes/");
		while(($file = readdir($dir)) !== false) {
			if($file == '..' || $file == '.' || $file == '.svn'){
					continue;
			} else {
				$t = strtolower($file);
				if(is_dir("../desktop/themes/" . $file)){
					echo($file."\n");
				}
			}
		}
	}
}
?>