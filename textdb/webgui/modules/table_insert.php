<?php

$db = new Database($_GET['db']);

$tbl_list_fields = "";
$gui_message2 = "";

$phase = "{tablea}";

$result = $db->executeQuery("SELECT * FROM ".$_GET['tbl']);

$colnames = $result->getColumnNames();
$coltypes = $result->getColumnTypes();

$numf = count($colnames);

for ($i = 0; $i < count($colnames); $i++) {
	$colname = $colnames[$i];
	$coltype = $coltypes[$i];
	$fieldname = "in_field".$i;

	eval ("\$tbl_list_fields .= \"".gettemplate("table_insert_bit")."\";");
	$phase = nextPhase($phase);
}

eval("dooutput(\"".gettemplate("table_insert")."\");");
?>