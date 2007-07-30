<?php
    $act = $_GET['action'];
	if($act == "checkpermissions")
	{
		$dirs = array(
			"./files/",
			"./backend/configuration.php"
		);
		$ok = array();
		foreach($dirs as $dir)
		{
			if(!is_writable($dir))
			{
				$ok[$dir] = "not writable";
			}
			else
			{
				$ok[$dir] = "ok";
			}
		}
		$x = count($dir);
		for($i=0;$i<=$x;i++)
		{
			$p = $dirs[$i];
			$d = $ok[$i];
			echo $p . ":" . $d . "\n";
		}
	}
?>
