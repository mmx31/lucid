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
	}
?>
