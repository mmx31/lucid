<?php
if($_COOKIE["logged"])
{
global $conf_user_logged;
$conf_user_logged = $_COOKIE["logged"];
setcookie("logged", $conf_user_logged, time()+3600);
}
else
{
header("Location: ./index.php");
exit();
}
?>