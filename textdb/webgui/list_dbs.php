<?php
// script to enlist all available databases
// with fallback to non-SQL-approach (SQL not implemented!)

$db_handle=opendir($DB_DIR);
if (!isset($_GET['db'])) $_GET['db'] = " ";

while (false !== ($db_file = readdir($db_handle))) { 

	if($db_file=='.'||$db_file=='..') continue; 
	
	if(is_dir($DB_DIR.$db_file)) {
		if ($db_file == $_GET['db']) { // aktuelle DB, Tabellen auflisten
			eval ("\$list_dbs .= \"".gettemplate("list_dbs_db")."\";");
			
			$tbl_handle = opendir($DB_DIR . $db_file);

			while (false !== ($tbl_file = readdir($tbl_handle))) {
				if($tbl_file=='.'||$tbl_file=='..') continue;
				
				$extension = substr($tbl_file, -4, 4);

				if ($extension == ".txt") {
					$basename = substr($tbl_file, 0, strlen($tbl_file) - 4);
					eval ("\$list_dbs .= \"".gettemplate("list_dbs_tbl")."\";");
				}
			}

		} else { // uninteressante DB für diesen Durchlauf, nur auflisten
			eval ("\$list_dbs .= \"".gettemplate("list_dbs_db")."\";");
		}
	}
}

if ($_GET['db'] == " ") unset($_GET['db']);
?>