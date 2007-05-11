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
//this is an awesome page: http://www.accessify.com/tools-and-wizards/developer-tools/response.right/default.php
//look into using it later maybe so the installer is all one file...

if(file_exists("./backend/config.php"))
{
    require("./backend/config.php");
}
elseif(isset($_POST['db_name']) && isset($_POST['db_user']) && isset($_POST['db_password']) && isset($_POST['db_host'])) //I left out db_prefix for a reason
{
    //this enables the user to uninstall the sql even if they deleted they're config file
    $db_name = $_POST['db_name'];
    $db_username = $_POST['db_username'];
    $db_password = $_POST['db_password'];
    $db_host = $_POST['db_host'];
    $db_prefix = $_POST['db_prefix'];
}
else
{
    $db_host = "localhost";
    $db_prefix = "dsktp_";    
}

if (isset($_POST['unsubmit'])) {
    echo "<html>\n<head><title>Psych Desktop Installer</title></head>";
    echo "<body style='background-color: #CCFFFF; font-size: 12px; font-family: sans-serif;'>\n";
    echo "<div style='width: 100%; height: 10%; text-align: center;'><br /><h1>Psych Desktop Installer</h1></div>\n";
    echo "<center><div style='width: 60%; border-width: 1px; border-color: black; border-style: solid; background: #FFFFFF; padding: 10px;'>";
    echo("connecting to database server...");
    mysql_connect($db_host, $db_username, $db_password) or die('<span style="color: red;">Error connecting to MySQL server: ' . mysql_error() . '</span></div></center></body></html>');
    echo "done.<br />";
    echo("selecting database...");
    mysql_select_db($db_name) or die('<span style="color: red;">Error selecting MySQL database: ' . mysql_error() . '</span></div></center></body></html>');
    echo "done.<br />";
    echo("destroying tables...");
    mysql_query("DROP TABLE `${db_prefix}users`;");
    mysql_query("DROP TABLE `${db_prefix}apps`;");
    mysql_query("DROP TABLE `${db_prefix}filesystem`;");
    mysql_query("DROP TABLE `${db_prefix}registry`;");
    echo "done.<br />";
    die("uninstalled Psych Desktop (mySQL Only).</div></center></body></html>");
}


if (isset($_POST['submit'])) {
    echo "<html>\n<head><title>Psych Desktop Installer</title></head>";
    echo "<body style='background-color: #CCFFFF; font-size: 12px; font-family: sans-serif;'>\n";
    echo "<div style='width: 100%; height: 10%; text-align: center;'><br /><h1>Psych Desktop Installer</h1></div>\n";
    echo "<center><div style='width: 60%; border-width: 1px; border-color: black; border-style: solid; background: #FFFFFF; padding: 10px;'>";
    echo "Writing data to config file...";
    $characters = 10;
    $possible = '23456789bcdfghjkmnpqrstvwxyz'; 
    $code = '';
    $i = 0;
    while ($i < $characters) { 
    	$code .= substr($possible, mt_rand(0, strlen($possible)-1), 1);
    	$i++;
    }    
    if($_POST['fresh'] == "yes") { $conf_secretword = bin2hex( md5($code, TRUE) ); }
    $writebuffer = "<?php\n//database type (mysql and ini) ini coming soon!\n\$db_type=\"mysql\";\n";
    $writebuffer = $writebuffer."//database name\n\$db_name=\"${_POST['db_name']}\";\n";
    $writebuffer = $writebuffer."//database host\n\$db_host=\"${_POST['db_host']}\";\n";
    $writebuffer = $writebuffer."//database username\n\$db_username=\"${_POST['db_username']}\";\n";
    $writebuffer = $writebuffer."//database password\n\$db_password=\"${_POST['db_password']}\";\n";
    $writebuffer = $writebuffer."//database prefix\n\$db_prefix=\"${_POST['db_prefix']}\";\n";
    $writebuffer = $writebuffer."//Public registration enabled?(yes/no)\n\$conf_public=\"${_POST['public']}\";\n";
    $writebuffer = $writebuffer."//the secret word for encryption of passwords\n//NOTE: DO NOT CHANGE AFTER INSTALL! THIS WILL BREAK THE USER LOGIN PROCESS!!!\n";
    $writebuffer = $writebuffer."\$conf_secretword=\"$conf_secretword\";\n?>";
    if (is_writable("./backend/config.php")) {
        $handle = fopen("./backend/config.php", 'w');
        fwrite($handle, $writebuffer);
        fclose($handle);
        echo "done.<br />";
    }
    else
    {
        echo('<span style="color: red;">Error, could not write to config file!</span><br />');
        $configerror = 'true';
    }
    echo "Reloading Configuration File...";
    //reload the config file
    require("./backend/config.php");
    echo "done.<br />";
    $filename = 'database.sql';
    if($_POST['fresh'] == 'yes')
    {
        // Connect to MySQL server
        echo("connecting to database server...");
        mysql_connect($db_host, $db_username, $db_password) or die('<span style="color: red;">Error connecting to MySQL server: ' . mysql_error() . '</span></div></center></body></html>');
        echo "done. <br />";
        // Select database
        echo("selecting database... ");
        mysql_select_db($db_name) or die('<span style="color: red;">Error selecting MySQL database: ' . mysql_error() . '</span></div></center></body></html>');
        echo "done.<br />";
        echo "Reading SQL file...";
        // Temporary variable, used to store current query
        $templine = '';
        // Read in entire file
        $lines = file($filename) or die("<span style='color: red;'>Error, could not read database file!</span></div></center></body></html>");
        echo "done.<br />";
        // Loop through each line
        echo("doing main queries on database...");
        foreach ($lines as $line_num => $line) {
            // Only continue if it's not a comment
            if (substr($line, 0, 2) != '--' && $line != '') {
                //look for #__, and replace it with the prefix
                $pos = strpos($line, "#__");
                if($pos !== false)
                {
                    $line = str_replace("#__", $db_prefix, $line);
                }
                // Add this line to the current segment
                $templine .= $line;
                // If it has a semicolon at the end, it's the end of the query
                if (substr(trim($line), -1, 1) == ';') {
                    // Perform the query
                    mysql_query($templine) or print('<span style="color: red;">Error performing query: ' . mysql_error() . '</span><br/>');
                    // Reset temp variable to empty
                    $templine = '';
                }
            }
        }
        echo "done.<br />";
    }
    if($_POST['fresh'] == "yes") {
    echo("Writing admin username, password, and e-mail to database...");
    $username = $_POST['username'];
    $password = crypt($_POST['password'], $conf_secretword);
    $email = $_POST['email'];
    mysql_query("REPLACE INTO `${db_prefix}users` VALUES ('".$username."', '".$email."', '".$password."', 0, 1, 'admin');") or print('<span style="color: red;">Error performing query: ' . mysql_error() . "</span>");
    echo("done.<br />");
    }
    if($configerror == true)
    {
        echo "<span style='color: red;'>There was an error in writing to your configuration file. Please copy and paste this data into /backend/config.php:</span>";
        $writebuffer = "&lt;?php<br />//database type (mysql and ini) ini coming soon!<br />\$db_type=\"mysql\";<br />";
        $writebuffer = $writebuffer."//database name<br />\$db_name=\"${_POST['db_name']}\";<br />";
        $writebuffer = $writebuffer."//database host<br />\$db_host=\"${_POST['db_host']}\";<br />";
        $writebuffer = $writebuffer."//database username<br />\$db_username=\"${_POST['db_username']}\";<br />";
        $writebuffer = $writebuffer."//database password<br />\$db_password=\"${_POST['db_password']}\";<br />";
        $writebuffer = $writebuffer."//database prefix<br />\$db_prefix=\"${_POST['db_prefix']}\";<br />";
        $writebuffer = $writebuffer."//Public registration enabled?(yes/no)<br />\$conf_public=\"${_POST['public']}\";<br />";
        $writebuffer = $writebuffer."//the secret word for encryption of passwords<br />//NOTE: DO NOT CHANGE AFTER INSTALL! THIS WILL BREAK THE USER LOGIN PROCESS!!!<br />";
        $writebuffer = $writebuffer."\$conf_secretword=\"$conf_secretword\";<br />?>";     
        echo "<div align='left' style='width: 70%; height: 250px; overflow: scroll; border: 1px; border-style: dashed; border-color: #DDDDDD; font-family: mono;'>".$writebuffer."</div>";
    }
    if($_POST['fresh'] == "yes") { die("Installation Completed.<br /><span style='color: red;'>Please delete this file and database.sql before using the desktop</span></div></center></body></html>"); }
    if($_POST['fresh'] == "no") { die("Configuration Edit Completed.<br /><span style='color: red;'>Please delete this file and database.sql before using the desktop</span></div></center></body></html>"); }
}

?>
<html>
    <head>
        <title>Psych Desktop Installer</title>
        <style>
            .info {
                font-size: 10px;
                color: blue;
            }
            .table {
                border-bottom: 1px;
                border-bottom-style: dashed;
                border-bottom-color: #DDDDDD;
            }
        </style>
    </head>
    <body style="background-color: #CCFFFF; font-size: 12px; font-family: sans-serif;">
        <div style="width: 100%; height: 15%; text-align: center;"><br /><h1>Psych Desktop Installer</h1></div>
        <center>
            <div style="width: 40%; border-width: 1px; border-color: black; border-style: solid; background: #FFFFFF; padding: 10px;">
                <?php
                    if(!is_writable("./backend/config.php")) {
                    echo "<span style='text-align: center; color: red;'>/backend/config.php is not writable. If you can't change it's permissions, you will need to copy and paste generated code into the file.</span>";
                    }
                ?>
                <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
                    <table style="border: 1px; border-style: dashed; border-color: #DDDDDD;" cellpadding="10">
                        <tr>
                            <td class="table">Database prefix:</td>
                            <td class="table"><input type="text" size="5" maxlength="6" <?php echo "value='$db_prefix'" ?> name="db_prefix"></td>
                            <td width="150" class="table"><p class="info">This is the prefix that will be used for each table. Usefull if your host limits the number of databases you can have.</p></td>
                        </tr>
                        <tr>
                            <td class="table">Database host:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" <?php echo "value='$db_host'" ?> name="db_host"></td>
                            <td width="150" class="table"><p class="info">The IP of the mySQL server to connect to. Usually on shared web hosting this is 'localhost'.</p></td>
                        </tr>
                        <tr>
                            <td class="table">Database name:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" <?php echo "value='$db_name'" ?> name="db_name"></td>
                            <td width="150" class="table"><p class="info">The mySQL database to use</p></td>
                        </tr>
                        <tr>
                            <td class="table">Database username:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" <?php echo "value='$db_username'" ?> name="db_username"></td>
                            <td width="150" class="table"><p class="info">A mySQL user that has all privlages to the database specified above</p></td>
                        </tr>                        
                        <tr>
                            <td class="table">Database password:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" <?php echo "value='$db_password'" ?> name="db_password"></td>
                            <td width="150" class="table"><p class="info">The password for the user specified above</p></td>
                        </tr>
                        <tr>
                            <td class="table">Admin Username:</td>
                            <td class="table"><input type="text" size="12" maxlength="20" name="username"></td>
                            <td width="150" class="table"><p class="info">Your username</p></td>
                        </tr>
                        <tr>
                            <td class="table">Admin Password:</td>
                            <td class="table"><input type="password" size="12" maxlength="36" name="password"></td>
                            <td width="150" class="table"><p class="info">Your password</p></td>
                        </tr>
                        <tr>
                            <td class="table">Admin E-mail:</td>
                            <td class="table"><input type="text" size="12" maxlength="40" name="email"></td>
                            <td width="150" class="table"><p class="info">Your email address</p></td>
                        </tr>
                          <tr>
                              <td class="table">Allow user registration:</td>
                              <td class="table">Yes:<input type="radio" name="public" value="yes" checked>&nbsp;&nbsp;No:<input type="radio" name="public" value="no"></td>
                              <td width="150" class="table"><p class="info">If set to 'no', users will not be able to register, and new accounts have to be made from the administrator panel. Usefull for busnesses or organizations.</p></td>
                        </tr>                         
                        <tr>
                            <td class="table">Fresh installation:</td>
                            <td class="table">Yes:<input type="radio" name="fresh" value="yes" checked>&nbsp;&nbsp;No:<input type="radio" name="fresh" value="no"></td>
                            <td width="150" class="table"><p class="info">If set to 'no', the script will not insert data into the database, or modify your existing crypt salt</p></td>
                      </tr>                                         
                        <tr>
                            <td colspan="3">
                                <center>
                                    <input type="submit" value="Install" name="submit" />
                                    <input type="submit" value="Un-Install" name="unsubmit" />
                                </center>
                            </td>
                        </tr>
                    </table>
                </form>
            </div>
        </center>
    </body>
</html>