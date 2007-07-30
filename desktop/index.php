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
if (session_id() == "") session_start(); // if no active session we start a new one
$user = $_SESSION['username'];
if($_SESSION['userloggedin'] == true)
{
    require("../backend/config.php");
    $link = mysql_connect($db_host, $db_username, $db_password)
       or die('Could not connect: ' . mysql_error());
    mysql_select_db($db_name) or die('Could not select database');
    $query = "UPDATE `${db_prefix}users` SET `logged` = '1' WHERE username ='${user}'";
    mysql_query($query) or die('Query failed: ' . mysql_error());
    mysql_close($link);
?>
<html>
<title>Psych Desktop</title>
<head>
<script type="text/javascript" src="./dojo/dojo/dojo.js.uncompressed.js"></script>
<script type="text/javascript" src="./dojo/dijit/dijit.js.uncompressed.js"></script>
<!-- this is just so we can actually read the errors dojo outputs, 
		releases will use compressed versions. -->
<script type="text/javascript" language="javascript" src="bootstrap.js"></script>
</head>
<body>
</body>
</html>
<?php
}
else
{
	echo "<script type='text/javascript'>window.close(); window.history(-1);</script>";
	echo "not logged in";
}
?>