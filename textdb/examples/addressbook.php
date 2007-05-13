<?

// Include the txt-db-api main source
include "../txt-db-api.php";

// First call to this example -> initilize the example database
if (!file_exists(DB_DIR . "txtdbapi-examples")) {
	$db = new Database(ROOT_DATABASE);
	$db->executeQuery("CREATE DATABASE txtdbapi-examples");
}

// First call to this example -> initilize the example table and fill it with some data
if (!file_exists(DB_DIR . "txtdbapi-examples/addressbook.txt")) {
	$db = new Database("txtdbapi-examples");
	$db->executeQuery("CREATE TABLE addressbook (id inc, surname str, familyname str, street str, plz str, city str, phone str)");
	$db->executeQuery("INSERT INTO addressbook(surname, familyname, street, plz, city, phone) VALUES ('Paul', 'Mustermann', 'Stoneway 15', '2434', 'Stonehenge', '+35 243 454234')");
	$db->executeQuery("INSERT INTO addressbook(surname, familyname, street, plz, city, phone) VALUES ('Otto', 'Mueller', 'Applestreet 32', '68457', 'Big Apple', '+53 3888856664')");
	$db->executeQuery("INSERT INTO addressbook(surname, familyname, street, plz, city, phone) VALUES ('Cindy', 'Crawy', 'Park Avenue 55', '566666', 'New Borg', '+22 434 8899066')");
	$db->executeQuery("INSERT INTO addressbook(surname, familyname, street, plz, city, phone) VALUES ('Matthew', 'Bluegerald', 'Sunnywalk 353', '11111', 'Beachcity', '+44 535246634')");
	$db->executeQuery("INSERT INTO addressbook(surname, familyname, street, plz, city, phone) VALUES ('Arabella', 'Schrader', 'Milkyway 92', '55553', 'Astrotown', '+99 555 999999')");
}

// Initialize all variables
$surname = $familyname = $street = $plz = $city = $phone = $id = '';


// Select the language and load the correct language file
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'de';
include "lang." . $lang . ".inc";

// Select the active character
$char = isset($_GET['char']) ? $_GET['char'] : 'M';

// Default title of the submit button
$buttonTitle = lang("add-address");

// Check if 'Delete' Button was pressed. If yes, delete the address
if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
	$db = new Database("txtdbapi-examples");
	$db->executeQuery("DELETE FROM addressbook WHERE id = '".$_GET['id']."'");
}

// Check if 'Edit' Button was pressed. If yes, load variables from DB for showing the
// data in the input fields of the form
if (isset($_GET['action']) && $_GET['action'] == 'edit' && isset($_GET['id'])) {
	$db = new Database("txtdbapi-examples");
	$result = $db->executeQuery("SELECT * FROM addressbook WHERE id = '".$_GET['id']."'");
	$result->next();
	$data = $result->getCurrentValuesAsHash();

	$surname = deslash($data['surname']);
	$familyname = deslash($data['familyname']);
	$street = deslash($data['street']);
	$plz = deslash($data['plz']);
	$city = deslash($data['city']);
	$phone = deslash($data['phone']);
	$id = $data['id'];
	
	$buttonTitle = lang("save-address");
}

// Check if 'Save Address' button was pressed. If yes, update the address in the DB
if (isset($_POST['submitted']) && $_POST['submitted'] == lang('save-address')) {
	$surname = reslash(isset($_POST['surname'])?$_POST['surname']:'');
	$familyname = reslash(isset($_POST['familyname'])?$_POST['familyname']:'');
	$street = reslash(isset($_POST['street'])?$_POST['street']:'');
	$plz = reslash(isset($_POST['plz'])?$_POST['plz']:'');
	$city = reslash(isset($_POST['city'])?$_POST['city']:'');
	$phone = reslash(isset($_POST['phone'])?$_POST['phone']:'');

	$db = new Database("txtdbapi-examples");
	$db->executeQuery("UPDATE addressbook SET surname='$surname', familyname='$familyname', street='$street', plz='$plz', city='$city', phone='$phone' WHERE id = ".$_POST['id']);

	// reset all variables, so it will not be shown in the form again
	$surname = $familyname = $street = $plz = $city = $phone = $id = '';
}

// Check if 'Add Address' button was pressed, If yes, add the address to the DB
if (isset($_POST['submitted']) && $_POST['submitted'] == lang('add-address')) {
	$surname = reslash(isset($_POST['surname'])?$_POST['surname']:'');
	$familyname = reslash(isset($_POST['familyname'])?$_POST['familyname']:'');
	$street = reslash(isset($_POST['street'])?$_POST['street']:'');
	$plz = reslash(isset($_POST['plz'])?$_POST['plz']:'');
	$city = reslash(isset($_POST['city'])?$_POST['city']:'');
	$phone = reslash(isset($_POST['phone'])?$_POST['phone']:'');
	
	$db = new Database("txtdbapi-examples");
	$db->executeQuery("INSERT INTO addressbook(surname, familyname, street, plz, city, phone) VALUES ('$surname', '$familyname', '$street', '$plz', '$city', '$phone')");

	// set filter rule to the familyname of the just added address
	$char = strtoupper($familyname{0});

	// reset all variables, so it will not be shown in the form again
	$surname = $familyname = $street = $plz = $city = $phone = $id = '';
}

?>

<html>
<head>
<style>
body, p, td, tr, table, input { font-family: verdana, arial, helvetica; color: #0B5979; font-size: 12px;}
.title { font-size: 26px; font-weight: bold;}
input {
    border: 1px solid #0B5979;
    padding-right: 3px;
    padding-left: 3px;
    background-color : #FFFFFF;
    color: #0B5979;
}
a { text-decoration: none; color : #0B5979; }
a:hover { color : #0B5979; text-decoration: underline; }
</style>
</head>
<body>
	<table width="100%" cellspacing="0" cellpadding="0" border="0">
		<tr>
			<td align="center" valign="top"><br><br>
				<form action="?lang=<?=$lang?>&char=<?=$char?>" method="post">
				<input type="hidden" name="id" value="<?=$id?>">
				<table style="width: 550px;">
					<tr>
						<td><h2><? echo lang('my-addressbook'); ?></h2></td>
						<td align="right">
							<a href="?lang=de&char=<?=$char?>">Deutsch</a> | 
							<a href="?lang=en&char=<?=$char?>">English</a> |
							<a href="?lang=it&char=<?=$char?>">Italian</a> |
							<a href="?lang=nl&char=<?=$char?>">Dutch</a> 
						</td>
					</tr>
				</table>
				<table style="width: 550px; background-color: #BCCCFF; text-align: left; border: solid #0B5979 1px;">
					<tr>
						<td width="100"><? echo lang('surname'); ?>:</td>
						<td><input name="surname" size="25" value="<?=$surname?>"></td>
					</tr>
					<tr>
						<td width="100"><? echo lang('familyname'); ?>:</td>
						<td><input name="familyname" size="25" value="<?=$familyname?>"></td>
					</tr>
					<tr>
						<td width="100"><? echo lang('street'); ?>:</td>
						<td><input name="street" size="25" value="<?=$street?>"></td>
					</tr>
					<tr>
						<td width="100"><? echo lang('plz'); ?>/<? echo lang('city'); ?>:</td>
						<td><input name="plz" size="5" value="<?=$plz?>"> <input name="city" size="17" value="<?=$city?>"></td>
					</tr>
					<tr>
						<td width="100"><? echo lang('phone'); ?>:</td>
						<td><input name="phone" size="25" value="<?=$phone?>">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" name="submitted" value="<?=$buttonTitle?>"></td>
					</tr>
				</table>
				</form>
				<table cellspacing="0" cellpadding="3" style="width: 550px; background-color: #BCCCFF; text-align: left; border: solid #0B5979 1px;">
					<tr>
<?
	// print the character tabs of the address table
	$chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ*";
	for ($i = 0; $i < strlen($chars); $i++) {
		if ($chars{$i} == $char)
			print "<td bgcolor=\"#BCCCFF\" align=\"center\" width=\"20\">\n";
		else
			print "<td bgcolor=\"#FFFFFF\" align=\"center\" width=\"20\">\n";
			
		if ($chars{$i} == '*')
			print "<a href=\"?lang=".$lang."&char=".$chars{$i}."\">".lang('all')."</a></td>\n";
		else
			print "<a href=\"?lang=".$lang."&char=".$chars{$i}."\">".$chars{$i}."</a></td>\n";

	}
?>
					</tr>
					<tr><td colspan="<? echo strlen($chars); ?>">
<?
	// print all addresses which fits to the filter rule
	$db = new Database("txtdbapi-examples");
	if ($char == '*')
		$result = $db->executeQuery("SELECT * FROM addressbook ORDER BY familyname");
	else		
		$result = $db->executeQuery("SELECT * FROM addressbook WHERE familyname LIKE '" . $char . "%' ORDER BY familyname, surname");
	
	print "<br>\n";
	if ($result->getRowCount() == 0) {
		print "<center><i>" . lang('no-data', $char) . "</i></center><br>";
	} else {
		print "<table border=\"0\" style=\"width: 540px;\">";
		$help = 0; 
		while ($result->next()) {
			if ($help)
				print "<tr><td colspan=\"2\"><hr></td></tr>\n";
			print "<tr><td>";
			$help = 1;
			$data = $result->getCurrentValuesAsHash();
			print $data['familyname'] . " " . $data['surname'] . "<br>\n";
			print $data['street'] . "<br>\n";
			print $data['plz'] . " " . $data['city'] . "<br>\n";
			print $data['phone']."";
			print "</td><td align=\"right\">";
			print "<a href=\"?lang=$lang&char=$char&id=".$data['id']."&action=edit\">".lang('edit')."</a> | ";
			print "<a href=\"?lang=$lang&char=$char&id=".$data['id']."&action=delete\">".lang('delete')."</a></td></tr>";
		}
		print "</table>";

		print "<br>";	
	}

?>
					</td></tr>
				</table>
<?
	// print the total number of addresses in the footer
	$result = $db->executeQuery("SELECT * FROM addressbook");	
	print "<br>". lang('number-of-addresses', $result->getRowCount());
?>

			</td>
		</tr>
	</table>
</body>
</html>

<?


// --------------------------------------------------------------
// helper functions
// --------------------------------------------------------------
function lang ()
{
	global $TEXT;
	
	$arg_list = func_get_args();
	
	if (count($arg_list) == 1)
		return $TEXT[$arg_list[0]];
	
	$i = 0;
	$text = $TEXT[$arg_list[0]];
	array_shift($arg_list);
	foreach ($arg_list as $item) {
		$text = str_replace("{".$i."}", $item, $text);
		$i++;
	}
	
	return $text;
}

// This function is a generic data processing function. It adds slashes if the magic quotes is off.
function reslash($string)
{
	if (!get_magic_quotes_gpc())
		$string = addslashes($string);
	return $string;
}

// This function takes out slashes if if the magic quotes are on.
function deslash($string)
{
	if (get_magic_quotes_gpc())
		$string = stripslashes($string);
	return $string;
}

?>