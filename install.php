<?php
require("./backend/config.php");
if (isset($_POST['unsubmit'])) {
echo("connecting to database server... ");
mysql_connect($db_host, $db_username, $db_password) or die('Error connecting to MySQL server: ' . mysql_error());
// Select database
echo("selecting database... ");
mysql_select_db($db_name) or die('Error selecting MySQL database: ' . mysql_error());
echo("destroying psych desktop... ");
mysql_query("DROP TABLE `users`;");
mysql_query("DROP TABLE `apps`;");
mysql_query("DROP TABLE `installedapps`;");
die("uninstalled Psych Desktop (My-SQL Only).");
}
if (isset($_POST['submit'])) {
echo("Preparing... ");
$filename = 'dontinstallme.sql';
// Connect to MySQL server
echo("connecting to database server... ");
mysql_connect($db_host, $db_username, $db_password) or die('Error connecting to MySQL server: ' . mysql_error());
// Select database
echo("selecting database... ");
mysql_select_db($db_name) or die('Error selecting MySQL database: ' . mysql_error());
// Temporary variable, used to store current query
$templine = '';
// Read in entire file
$lines = file($filename);
// Loop through each line
echo("doing main queries on database... ");
foreach ($lines as $line_num => $line) {
    // Only continue if it's not a comment
    if (substr($line, 0, 2) != '--' && $line != '') {
        // Add this line to the current segment
        $templine .= $line;
        // If it has a semicolon at the end, it's the end of the query
        if (substr(trim($line), -1, 1) == ';') {
            // Perform the query
            mysql_query($templine) or print('Error performing query \'<b></b>\': ' . mysql_error() . '<br /><br />');
            // Reset temp variable to empty
            $templine = '';
        }
    }
}
echo("installing admin username,password and e-mail... ");
$username = $_POST['username'];
$password = crypt($_POST['password'], $conf_secretword);
$email = $_POST['email'];
mysql_query("INSERT INTO `users` VALUES ('".$username."', '".$email."', '".$password."', 0, 1, 'admin');") or print('Error performing query \'<b></b>\': ' . mysql_error() . '<br /><br />');
die("done. <br> Please delete this file and dontinstallme.sql!");
}
?>
<form method="post" action="<?php echo $PHP_SELF;?>">
Admin Username:<input type="text" size="12" maxlength="12" name="username">:<br />
Admin Password:<input type="password" size="12" maxlength="36" name="password">:<br />
Admin E-mail:<input type="text" size="12" maxlength="40" name="email">:<br />
<input type="submit" value="Install" name="submit">
<input type="submit" value="Un-Install" name="unsubmit">