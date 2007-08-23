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

require("quickbackend.php");

$blocked_tables = Array(
	"users"
);

$user_data_tables = Array(
	"database",
	"registry",
	"crosstalk"
);

foreach($blocked_tables as $table)
{
	if($_POST["table"] == $table)
	{
		quit("1");
	}
}

foreach($user_data_tables as $table)
{
	if($_POST["table"] == $table)
	{
		$link = qback::mysqlLink();
		$table = qback::esc($table);
		$column = qback::esc($_POST['column']);
		$value = qback::esc($_POST['value']);
		$result = qback::query("SELECT * FROM #__".$table." WHERE '".$column."' = '".$value."';");
		echo qback::toJSON($result, mysql_affected_rows());
		qback::close($link, $result);
		quit();
	}
}

?>