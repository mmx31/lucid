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
require("../quickbackend.php");

if(!$_POST['appid'])
{
echo "1";
exit();
}
$link = qback::mysqlLink();
qback::esc($_POST);

if($_POST['appid'] == -1) qback::query("INSERT INTO #__apps (name, author, email, code, version, maturity, category) VALUES(\"${_POST['name']}\", \"${_POST['author']}\", \"${_POST['email']}\", \"${_POST['code']}\", \"${_POST['version']}\", \"${_POST['maturity']}\", \"${_POST['category']}\")");
else qback::query("UPDATE ${db_prefix}apps SET name=\"${_POST['name']}\", author=\"${_POST['author']}\", email=\"${_POST['email']}\", code=\"${_POST['code']}\", version=\"${_POST['version']}\", maturity=\"${_POST['maturity']}\", category=\"${_POST['category']}\" WHERE ID=\"${_POST['appid']}\" LIMIT 1");

if($_POST['appid'] == -1)
{
    $result = qback::query("SELECT * FROM #__apps WHERE code=\"${_POST['code']}\" HAVING library=\"${_POST['library']}\" ORDER BY ID DESC LIMIT 1");
    $line = mysql_fetch_array($result, MYSQL_ASSOC);
    echo $line['id'];
	qback::close($link, $result);
}
else
{
    echo $_POST['appid'];
	qback::close($link);
}
?>