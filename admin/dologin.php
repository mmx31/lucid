<?phpif ($_POST['user'] && $_POST['pass'])
{
         // The submitted data is there, so process it
         login_check($_POST['user'], $_POST['pass']);
} else {
     // The form wasn't submitted, so go back
     login_go_back();
}function login_check($user, $pass)
{
require ("../backend/config.php");
// Connecting, selecting database
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
// Performing SQL query
$query = "SELECT * FROM ${db_prefix}users WHERE username='${user}' LIMIT 1";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
//do compare
$line = mysql_fetch_array($result, MYSQL_ASSOC);
if($line)
{
$pass = crypt($pass, $conf_secretword);
if($line["password"] == $pass && $line["level"] == "admin")
{
login_ok($line["ID"]);
// Free resultset
mysql_free_result($result);
// Closing connection
mysql_close($link);
}else{login_go_back();}}else{// Free resultsetmysql_free_result($result);// Closing connectionmysql_close($link);login_go_back();}}function login_go_back(){header("Location: ./index.php");}function login_ok($user){setcookie("logged", "${user}", time()+3600);header("Location: ./index2.php");exit();}?>