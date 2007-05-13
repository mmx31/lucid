<?php

// Edit this variable
	$_dbf2_path = "./";

// Don't edit these includes
	include($_dbf2_path . "/class.pdbfile-aux.php");
	include($_dbf2_path . "/class.pdbfile-core.php");
	include($_dbf2_path . "/class.pdbfile-sql.php");

// Edit the name of the object if you want
	$dbf = new p_dbf_sql($_dbf2_path);

?>
