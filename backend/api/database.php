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
session_start();
require("../quickbackend.php");
if (isset($_GET['action'])) {
    if ($_GET['action'] == "getDatabase")
    {
		$link = qback::mysqlLink();
        $result = qback::query("SELECT * FROM `#__database` WHERE appid='${_GET['appid']}' AND userid='${_SESSION['userid']}' AND tablename='${_GET['tablename']}' LIMIT 1");
		if($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			echo $row['data'];
		}
		qback::close($link, $result);
    }
    if ($_GET['action'] == "saveDatabase")
    {
		$link = qback::mysqlLink();
		qback::query("REPLACE INTO `#__database` (`userid`, `appid`, `public`, `tablename`, `data`) VALUES('${_GET['userid']}', '${_GET['appid']}', '${_GET['pub']}', '${_GET['name']}', '${_GET['data']}')");
		qback::close($link);
    }
}
?>