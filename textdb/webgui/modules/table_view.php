<?php

$db = new Database($_GET['db']);

if (!isset($_POST['o'])) $_POST['o'] = 0;
if (!isset($_POST['l'])) $_POST['l'] = 10;

if(isset($_POST['sql'])) {
	$query = $_POST['sql'];
} else {
	$query = "SELECT * FROM ".$_GET['tbl']." LIMIT ".$_POST['o'].",".$_POST['l'];
}

if (stristr($query, "limit")) {
    $use_limit = true;
} else {
    $use_limit = false;
}

$singleQueries = splitSql($query);

$num_queries = count($singleQueries);

$total = 0;

$tbl_view_rows = "";

for ($j = 0; $j < $num_queries; $j++) {
	$localTotal = 0;

	$res = $db->executeQuery($singleQueries[$j]);

	$phase = "{tablec}";

	$tbl_view_cols = "";

	$list_colnames = $res->getColumnNames();
	$numfields = count($list_colnames);
	for ($i = 0; $i < $numfields; $i++) {
		$field = $list_colnames[$i];
		eval ("\$tbl_view_cols .= \"".gettemplate("table_view_colbit")."\";");
	}

	eval ("\$tbl_view_rows .= \"".gettemplate("table_view_start_table")."\";");
	eval ("\$tbl_view_rows .= \"".gettemplate("table_view_rowbit")."\";");
	$phase = "{tablea}";

	while ($res->next()) {
		$tbl_view_cols = "";
		$row = $res->getCurrentValues();
		for ($i = 0; $i < count($row); $i++) {
			$field = $row[$i];
			eval ("\$tbl_view_cols .= \"".gettemplate("table_view_colbit")."\";");
		}
		eval ("\$tbl_view_rows .= \"".gettemplate("table_view_rowbit")."\";");
		$phase = nextPhase($phase);
		$localTotal++;
	}

	if ($localTotal == 0) {
		eval ("\$tbl_view_rows .= \"".gettemplate("table_view_empty")."\";");
	}

	eval ("\$tbl_view_rows .= \"".gettemplate("table_view_end_table")."\";");

	$total += $localTotal;
}

if (!isset($gui_message2)) $gui_message2 = " ";

eval("dooutput(\"".gettemplate("table_view")."\");");
?>