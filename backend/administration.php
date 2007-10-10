<?php
	session_start();
	if($_SESSION['userlevel'] == "admin")
	{
		require("quickbackend.php");
		if($_GET['section'] == "users")
		{
			if($_GET['action'] == "list")
			{
				$link = qback::mysqlLink();
				$result = qback::query("SELECT * FROM #__users");
				echo qback::toJSON($result, mysql_affected_rows());
				qback::close($link, $result);
			}
		}
	}
?>