<?php

$db = new Database($_GET['db']);

$gui_message2 = "";

if (isset($_GET['reprint'])) if ($_POST['reprint'] != "true") unset($_POST['sql']);

if (isset($_GET['create'])) if ($_GET['create'] == "true" && isset($_POST['numf'])) {
	$query = "CREATE TABLE ".$_GET['tbl']." (";

	$tmp_fields = array();

	for ($i = 1; $i <= $_POST['numf']; $i++) {
		$fname = "fname".$i;
		$ftype = "tname".$i;
		$tmp_fields[] = $_POST[$fname]." ".$_POST[$ftype];
	}
	
	$sql_fields = implode(",", $tmp_fields);

	$query .= $sql_fields . ");";

	$result = $db->executeQuery($query);

	if ($result) {
		eval ("\$gui_message2 .= \"".gettemplate("message_table_create_success")."\";");
	} else {
		eval ("\$gui_message2 .= \"".gettemplate("message_table_create_failure")."\";");
	}
}

if (isset($_GET['insert'])) if ($_GET['insert'] == "true" && isset($_POST['numf'])) {
	$query = "INSERT INTO ".$_GET['tbl']." SET ";

	$tmp_fields = array();

	$result = $db->executeQuery("SELECT * FROM ".$_GET['tbl']);

	$colnames = $result->getColumnNames();

	for ($i = 0; $i < $_POST['numf']; $i++) {
		$fvalue = "in_field".$i;
		$tmp_fields[] = $colnames[$i]."='".addslashes($_POST[$fvalue])."'";
	}
	
	$sql_fields = implode(",", $tmp_fields);

	$query .= $sql_fields;

	$result = $db->executeQuery($query);

	if ($result) {
		eval ("\$gui_message2 .= \"".gettemplate("message_table_insert_success")."\";");
	} else {
		eval ("\$gui_message2 .= \"".gettemplate("message_table_insert_failure")."\";");
	}
}

$phase = "{tablea}";
$tbl_list_fields = "";

$result = $db->executeQuery("SELECT * FROM ".$_GET['tbl']);

$colnames = $result->getColumnNames();
$coltypes = $result->getColumnTypes();

for ($i = 0; $i < count($colnames); $i++) {
	$colname = $colnames[$i];
	$coltype = $coltypes[$i];

	eval ("\$tbl_list_fields .= \"".gettemplate("table_details_tbl_bit")."\";");
	$phase = nextPhase($phase);
}

if ($tbl_list_fields == "") eval ("\$tbl_list_fields = \"".gettemplate("table_details_tbl_invalid")."\";");
if (!isset($gui_message2)) $gui_message2 = " ";
if (!isset($_POST['sql'])) $_POST['sql'] = " ";

eval("dooutput(\"".gettemplate("table_details")."\");");
?>