<?php
include_once("protect.php");

@session_start();

include_once("config.inc.php");
include_once($txtdbapi);
include_once("functions.inc.php");

$SID = '';
if(!ini_get('session.use_trans_sid'))
	$SID = "&".session_name()."=".session_id();

$gui_message = "";
$list_dbs = "";

if (isset($_GET['templatefolder'])) {
  $templatefolder = $_GET['templatefolder'];
  $_SESSION['templatefolder_sess'] = $_GET['templatefolder'];
}

if (isset($_SESSION['templatefolder_sess'])) $templatefolder = $_SESSION['templatefolder_sess'];


if (isset($_POST['new_db'])) {
    // new DB is to be created, approach depends on version of API
    if (min_version("0.1.2-Beta-02")) {
        // version is new enough to handle action by SQL
        $db = new Database(ROOT_DATABASE);
        $query = "CREATE DATABASE ".$_POST['new_db'];
        
        if ($db->executeQuery($query)) {
		    $_GET['show'] = "database_details";
		    $_GET['db']  = $_POST['new_db'];
            eval ("\$gui_message .= \"".gettemplate("message_db_created_sql")."\";");        
        }
        
        unset($db);    
    } else {
        // version is too old, must fall back to system functions instead of SQL    
	    if (create_database($_POST['new_db'])) {
		    $_GET['show'] = "database_details";
		    $_GET['db']  = $_POST['new_db'];
	    }
    }
}

if (isset($_GET['delete_db'])) {
    // DB is to be deleted, approach depends on version of API

	if (isset($_POST['confirm'])) if ($_POST['confirm'] == "OK") {
      if (min_version("0.1.2-Beta-02")) {
        // version is new enough to handle action by SQL
        $db = new Database(ROOT_DATABASE);
        $query = "DROP DATABASE ".$_GET['delete_db'];
        
        if ($db->executeQuery($query)) 
          eval ("\$gui_message .= \"".gettemplate("message_db_deleted_sql")."\";");
        
        unset($db);
      } else {
        // version is too old, must fall back to system functions instead of SQL
		$file = $DB_DIR . $_GET['delete_db'];
		$handle = opendir($file); 
		while($filename = readdir($handle)) { 
			if ($filename != "." && $filename != "..") {
				unlink($file."/".$filename);
			} 
		}
		closedir($handle);

		if (rmdir($DB_DIR.$_GET['delete_db'])) eval ("\$gui_message .= \"".gettemplate("message_db_deleted")."\";");
      }
	} else {
		$_GET['show'] = "database_details";
		$_GET['db'] = $_GET['delete_db'];
	}
}

// Datenbankliste
include("list_dbs.php");
include("list_templates.php");

if (isset($_GET['db'])) {
	if (isset($_GET['tbl'])) {
		eval ("\$gui_message .= \"".gettemplate("message_dbtbl")."\";");
	} else {
		eval ("\$gui_message .= \"".gettemplate("message_db")."\";");
	}
}

eval ("\$headinclude = \"".gettemplate("header")."\";");
eval ("\$footinclude = \"".gettemplate("footer")."\";");

// Hauptfenster
if(isset($_GET['show'])) {
	include("modules/" . $_GET['show'] . ".php");
} else {
	include("welcome.php");
} // if

?>