<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
if (isset($_GET['crosstalk'])) {
	require("./api/crosstalk.php");
}
if (isset($_GET['action'])) {
    if (($_GET['action'] == "getDatabase") || ($_GET['action'] == "saveDatabase"))
    {
		require("./api/database.php");
    }

 if (($_GET['action'] == "getStatus") || ($_GET['action'] == "getUserLevel") || ($_GET['action'] == "getUserName") || ($_GET['action'] == "getUserNameFromID") || ($_GET['action'] == "getUserIDFromName") || ($_GET['action'] == "getUserID"))
 {
 	require("./api/misc.php");
 }
}
if (isset($_GET['fs'])) {
	require("./api/fs.php");
}
	
if (isset($_GET['registry'])) { 

}
?>
