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
header("Content-type: text/plain");
require ("config.php");
if($conf_public == "no") { exit("User registration disabled"); }
if($_POST['user'] && $_POST['pass'] && $_POST['email'])
{
    $link = mysql_connect($db_host, $db_username, $db_password)
       or die('Could not connect: ' . mysql_error());
    mysql_select_db($db_name) or die('<br>Could not select database');

    //preform username lookup
    $query = "SELECT username FROM {$db_prefix}users WHERE username = '${_POST['user']}'";
    $result = mysql_query($query) or die('Query failed: ' . mysql_error());
    $line = mysql_fetch_array($result, MYSQL_ASSOC) ;
    if($line)
    {
        foreach ($line as $col_value)
        {
            if($_POST["user"] == $col_value)
            {
                echo "1";
            }
        }
        mysql_free_result($result);
        mysql_close($link);        
    }
    else
    {
        mysql_free_result($result);
        mysql_close($link);     
        register_user($_POST['user'] , $_POST['pass'] , $_POST['email']);              
    }
}
else
{
echo $conf_public;
}
function register_user($username , $password, $email)
{
require("config.php");
$password = crypt($password, $conf_secretword);
$link2 = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('<br>Could not select database');
$query = "INSERT INTO `${db_prefix}users` (`username`, `email`, `password`, `logged`, `ID`, `level`) VALUES ('${username}', '${email}', '${password}', '0', NULL, 'user');";
mysql_query($query) or die('Query failed: ' . mysql_error());
mysql_close($link2);
echo "0";
}
?>
