<?php
require("txt-db-api.php");
if(isset($_POST['action'])) {
if (!file_exists(DB_DIR . "Test")) {
	$db = new Database(ROOT_DATABASE);
	$db->executeQuery("CREATE DATABASE Test");
	echo("created new database Test... ");
}
if (!file_exists(DB_DIR . "Test/mytable.txt")) {
	$db = new Database("Test");
	$db->executeQuery("CREATE TABLE mytable (id inc, firstname str, secondname str)");
	echo("created new table mytable... ");
	$fn = $_POST['fn'];
	$sn = $_POST['sn'];
	$db->executeQuery("INSERT INTO mytable(firstname, secondname) VALUES ('$fn', '$sn')");
	echo("inserted data to table mytable.");
	}
	else {
	$fn = $_POST['fn'];
	$sn = $_POST['sn'];
	$db->executeQuery("INSERT INTO mytable(firstname, secondname) VALUES ('$fn', '$sn')");
	echo("inserted data to table mytable.");
	}
	}
	?>
	<form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
	<td class="table">First Name:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" name="fn"></td>
                        </tr>
                        <tr>
                            <td class="table">Second Name:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" name="sn"></td>
                        </tr>                        
	<input type="submit" value="Insert to TextDB" name="action" />
	</form>
	
