<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
error_reporting(1);
require("../config.php");
require("../quickbackend.php");
if(!$_POST['appid'])
{
echo "1";
exit();
}

$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database '.$dbname);
qback::esc($_POST);
$_POST['name'] = mysql_real_escape_string ($_POST['name'], $link);
$_POST['author'] = mysql_real_escape_string ($_POST['author'], $link);
$_POST['email'] = mysql_real_escape_string ($_POST['email'], $link);
$_POST['code'] = addslashes(mysql_real_escape_string ($_POST['code'], $link)); // for some reason the apps are escaped twice in the DB. This is not right. Fix it later though.
$_POST['version'] = mysql_real_escape_string ($_POST['version'], $link);
$_POST['maturity'] = mysql_real_escape_string ($_POST['maturity'], $link);
$_POST['category'] = mysql_real_escape_string ($_POST['category'], $link);
if($_POST['appid'] == -1) qback::query("INSERT INTO #__apps (name, author, email, code, version, maturity, category) VALUES(\"${_POST['name']}\", \"${_POST['author']}\", \"${_POST['email']}\", \"${_POST['code']}\", \"${_POST['version']}\", \"${_POST['maturity']}\", \"${_POST['category']}\")");
else qback::query("UPDATE #__apps SET name=\"${_POST['name']}\", author=\"${_POST['author']}\", email=\"${_POST['email']}\", code=\"${_POST['code']}\", version=\"${_POST['version']}\", maturity=\"${_POST['maturity']}\", category=\"${_POST['category']}\" WHERE ID=\"${_POST['appid']}\" LIMIT 1");

if($_POST['appid'] == -1)
{
	echo mysql_insert_id();
}
else
{
    echo $_POST['appid'];
	qback::close($link);
}
?>
