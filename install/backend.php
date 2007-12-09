<?php
    $act = $_GET['action'];
	if($act == "checkpermissions")
	{
		$dirs = array(
			"../files/",
			"../backend/config.php"
		);
		$ok = array("error", "error");
		$a = 0;
		foreach($dirs as $dir)
		{
			if(!is_writable($dir))
			{
				$ok[$a] = "not writable (chmod to 777 or chown to webserver's user)";
			}
			else
			{
				$ok[$a] = "ok";
			}
			$a++;
		}
		$x = count($dir);
		echo "{";
		$list = array();
		for($i=0;$i<=$x;$i++)
		{
			$p = $dirs[$i];
			$d = $ok[$i];
			array_push($list,"\"" . $p . "\":" . "\"" . $d . "\"");
		}
		echo join(",\n", $list);
		echo "}";
	}
	if($act == "listApps")
	{
		$dir = opendir("./apps/");
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
?>
