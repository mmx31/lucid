<?php

$db = new Database($_GET['db']);
$gui_message2 = "";

if (isset($_GET['reprint'])) if ($_POST['reprint'] != "true") unset($_POST['sql']);

if (isset($_GET['delete'])) if ($_GET['delete'] == "true" && $_POST['confirm'] == "OK") {
	if (unlink($DB_DIR.$_GET['db']."/".$_GET['tbl'].".txt"))
		eval ("\$gui_message2 .= \"".gettemplate("message_table_delete_success")."\";");
	else
		eval ("\$gui_message2 .= \"".gettemplate("message_table_delete_failure")."\";");
}

if (isset($_GET['empty'])) if ($_GET['empty'] == "true" && $_POST['confirm'] == "OK") {
	$result = $db->executeQuery("SELECT * FROM ".$_GET['tbl']);

	$colnames = $result->getColumnNames();
	$coltypes = $result->getColumnTypes();

	$fields = array();

	for ($i = 0; $i < count($colnames); $i++) {
		$colname = $colnames[$i];
		$coltype = $coltypes[$i];
	
		$fields[] = $colname . " " . $coltype;
	}

	$fields = implode(",", $fields);

	$query = "CREATE TABLE ".$_GET['tbl']." (".$fields.")";

	unlink($DB_DIR.$_GET['db']."/".$_GET['tbl'].".txt");

	$result = $db->executeQuery($query);

	if ($result) {
		eval ("\$gui_message2 .= \"".gettemplate("message_table_empty_success")."\";");
	} else {
		eval ("\$gui_message2 .= \"".gettemplate("message_table_empty_failure")."\";");
	}
}

$tbl_handle = opendir($DB_DIR . $_GET['db']);
$phase = "{tablea}";
$db_list_tbls = "";

while (false !== ($tbl_file = readdir($tbl_handle))) {
	if($tbl_file=='.'||$tbl_file=='..') continue;
				
	$extension = substr($tbl_file, -4, 4);

	if ($extension == ".txt") {
		$basename = substr($tbl_file, 0, strlen($tbl_file) - 4);

		$table_content = file($DB_DIR.$_GET['db']."/".$tbl_file);  // performance improvement by mario
		$num_rows = count($table_content) - 3;  

		eval ("\$db_list_tbls .= \"".gettemplate("database_details_tbls_bit")."\";");
		$phase = nextPhase($phase);
	}
}

if ($db_list_tbls == "") eval ("\$db_list_tbls = \"".gettemplate("database_details_tbls_empty")."\";");

if (!isset($gui_message2)) $gui_message2 = " ";
if (!isset($_POST['sql'])) $_POST['sql'] = " ";

eval("dooutput(\"".gettemplate("database_details")."\");");
?>