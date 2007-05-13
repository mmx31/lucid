<?php
$_POST['sql'] = stripslashes($_POST['sql']);

if (strtoupper(substr($_POST['sql'], 0, 6)) == "SELECT") {
	include('table_view.php');
} else {
	$db = new Database($_GET['db']);

	$query = $_POST['sql'];

	$singleQueries = splitSql($query);
	$num_queries = count($singleQueries);

	for ($i = 0; $i < $num_queries; $i++) {
		$query = $singleQueries[$i];

		$result = $db->executeQuery($query);

		if ($result) {
			eval ("\$gui_message2 .= \"".gettemplate("message_sql_execute_success")."\";");
		} else {
			eval ("\$gui_message2 .= \"".gettemplate("message_sql_execute_failure")."\";");
		}
	}

	unset ($db);

	include("$_POST[referto]");
}
?>