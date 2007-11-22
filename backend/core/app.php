<?php
	require("./../models/app.php");
    if($_GET['section'] == "fetch")
	{
		if($_GET['action'] == "full")
		{
			header("Content-type: text/plain");
			$p = $App->get($_POST['id']);
			echo $p->make_json();
		}
		if($_GET['action'] == "list")
		{
			$p = $App->all();
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
?>
