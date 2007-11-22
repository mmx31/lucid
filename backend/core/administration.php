<?php
	session_start();
	require("../models/user.php");
	if($_SESSION['userlevel'] == "admin")
	{
		if($_GET['section'] == "users")
		{
			if($_GET['action'] == "list")
			{
				$p = $User->all();
				$pl = count($p)-1;
				echo "[";
				foreach($p as $d => $v)
				{
					echo $v->make_json();
					if($d < $pl) { echo ",\n"; }
				}
				echo "]";
			}
		}
	}
?>