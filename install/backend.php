<?php
	error_reporting(0);
    $act = $_GET['action'];
	if($act == "installadmin")
	{
		require("../backend/config.php");
		echo("{");
		echo("\"Establishing connection to database...\":");
		mysql_connect($db_host, $db_username, $db_password) or die("\"...fail: Error connecting to MySQL server. Check username and password correct.\"}");	
		mysql_select_db($db_name) or die('<span style="color: red;">Error selecting MySQL database: ' . mysql_error() . '</span></div></center></body></html>');
		mysql_query("TRUNCATE TABLE `${db_prefix}users`;");
		mysql_query("ALTER TABLE `${db_prefix}users` AUTO_INCREMENT = 1;");
		echo("\"...done\",");
	    echo("\"Writing admin username, password, and e-mail to database...\":");
		$username = $_GET['admin_user'];
		$password = crypt($_GET['admin_pass'], $conf_secretword);
		$email = $_GET['admin_email'];
		mysql_query("REPLACE INTO `${db_prefix}users` VALUES ('".$username."', '".$email."', '".$password."', 0, 1, 'admin');") or print('<span style="color: red;">Error performing query: ' . mysql_error() . "</span>");
		echo("\"...done\"");
		echo("}");
	}
	if($act == "installdatabase")
	{
		echo("{");
		echo("\"Parsing form values...\":");
		$db_name = $_GET['db_name'];
		$db_type = $_GET['db_type'];
		$db_host = $_GET['db_host'];
		$db_username = $_GET['db_username'];
		$db_password = $_GET['db_password'];
		$db_prefix = $_GET['db_prefix'];
		echo("\"...done\",");
		echo("\"Generating encryption hash...\":");
		$characters = 10;
		$possible = '23456789bcdfghjkmnpqrstvwxyz'; 
		$code = '';
		$i = 0;
		while ($i < $characters) { 
			$code .= substr($possible, mt_rand(0, strlen($possible)-1), 1);
			$i++;
		}    
		$conf_secretword = bin2hex( md5($code, TRUE) );
		echo("\"...done\",");
		echo("\"Saving new configuration...\":");
		$writebuffer = "<?php\n//database type (mysql and ini) ini coming soon!\n\$db_type=\"${db_type}\";\n";
		$writebuffer = $writebuffer."//database name\n\$db_name=\"${db_name}\";\n";
		$writebuffer = $writebuffer."//database host\n\$db_host=\"${db_host}\";\n";
		$writebuffer = $writebuffer."//database username\n\$db_username=\"${db_username}\";\n";
		$writebuffer = $writebuffer."//database password\n\$db_password=\"${db_password}\";\n";
		$writebuffer = $writebuffer."//database prefix\n\$db_prefix=\"${db_prefix}\";\n";
		$writebuffer = $writebuffer."//xsite enabled?(yes/no)\n\$xsite_status=\"yes\";\n";
		$writebuffer = $writebuffer."//Public registration enabled?(yes/no)\n\$conf_public=\"yes\";\n";
		$writebuffer = $writebuffer."//the secret word for encryption of passwords\n//NOTE: DO NOT CHANGE AFTER INSTALL! THIS WILL BREAK THE USER LOGIN PROCESS!!!\n";
		$writebuffer = $writebuffer."\$conf_secretword=\"$conf_secretword\";\n?>";
		if (is_writable("../backend/config.php")) {
        $handle = fopen("../backend/config.php", 'w');
        fwrite($handle, $writebuffer);
        fclose($handle);
		echo("\"...done\"");
		echo("}");
		}
		else {
		echo("\"...fail\"");
		echo("}");
		}
	}
	if($act == "installprograms")
	{
		//TODO: this should use the models!
		echo("{");
		require("../backend/config.php");	
		echo("\"Establishing connection to database...\":");
		mysql_connect($db_host, $db_username, $db_password) or die("\"...fail: Error connecting to MySQL server. Check username and password correct.\"}");	
		mysql_select_db($db_name) or die('<span style="color: red;">Error selecting MySQL database: ' . mysql_error() . '</span></div></center></body></html>');
		mysql_query("TRUNCATE TABLE `${db_prefix}apps`;");
		mysql_query("ALTER TABLE `${db_prefix}apps` AUTO_INCREMENT = 1;");
		echo("\"...done\",");
		echo("\"Initalizing application installer...\":");
		require("../backend/lib.xml.php");
		$xml = new Xml; 
		echo("\"...done\"");
		$dir = opendir("./apps/");
		while(($file = readdir($dir)) !== false){
			if($file == '..' || $file == '.'){
				continue;
			}
			else {
			if(is_dir("./apps/" . $file)){
				if(!file_exists("./apps/" . $file . "/appmeta.xml")) { continue; }
				echo(",");
				$out = $xml->parse('./apps/'.$file.'/appmeta.xml', 'FILE');
				$name = $out[name];
				$author = $out[author];
				$email = $out[email];
				$version = $out[version];
				$maturity = $out[maturity];
				$category = $out[category];
				$installfile = $out[installFile];
				$message = $out[installMessage];
				$message2 = $out[installedMessage];
				/* no optional files required for the core apps
				$fr = $out[filesRequired];
				$frt = $out[filesCopyTo];
				$frf = $out[filesCopyFrom]; */
				echo("\"".$message."\":");
				$templine = '';
				$file2 = fopen("./apps/$file/$installfile", "r");
				while(!feof($file2)) {
					$templine = $templine . fgets($file2, 4096);
				}
				fclose ($file2); 
				$templine = mysql_real_escape_string($templine);
				$code = $templine;
				$blah = "INSERT INTO `${db_prefix}apps` (`name`, `author`, `email`, `code`, `version`, `maturity`, `category`) VALUES ('${name}', '${author}', '${email}', '${code}', '${version}', '${maturity}', '${category}');"; 
				mysql_query($blah) or die("fail - ". mysql_error());
				echo("\"" . $message2 . "\"");
				}
			}
		}
		echo("}");
	}
			
	if($act == "checkpermissions")
	{
		$dirs = array(
			"../files/",
			"../backend/config.php"
		);
		$ok = array("error", "error");
		$a = 0;
		foreach($dirs as $dir)
		{
			if(!is_writable($dir))
			{
				$ok[$a] = "not writable (chmod to 777 or chown to webserver's user)";
			}
			else
			{
				$ok[$a] = "ok";
			}
			$a++;
		}
		$x = count($dir);
		echo "{";
		$list = array();
		for($i=0;$i<=$x;$i++)
		{
			$p = $dirs[$i];
			$d = $ok[$i];
			array_push($list,"\"" . $p . "\":" . "\"" . $d . "\"");
		}
		echo join(",\n", $list);
		echo "}";
	}
	if($act == "listApps")
	{
		$dir = opendir("./apps/");
		while(($file = readdir($dir)) !== false) {
			if($file == '..' || $file == '.' || $file{0} == '.'){
					continue;
			} else {
				$t = strtolower($file);
				if(is_dir("../../desktop/themes/" . $file)){
					echo($file."\n");
				}
			}
		}
	}
?>
