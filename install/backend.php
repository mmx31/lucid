<?php
    $act = $_GET['action'];
	if($act == "checkpermissions")
	{
		$dirs = array(
			"../files/",
			"../backend/configuration.php"
		);
		$ok = array("error", "error");
		$a = 0;
		foreach($dirs as $dir)
		{
			if(!is_writable($dir))
			{
				$ok[$a] = "not writable";
			}
			else
			{
				$ok[$a] = "ok";
			}
			$a++;
		}
		$x = count($dir);
		for($i=0;$i<=$x;$i++)
		{
			$p = $dirs[$i];
			$d = $ok[$i];
			echo $p . ":" . $d . "\n";
		}
	}
?>
