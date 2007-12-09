<?php
    $act = $_GET['action'];
	if($act == "installprograms")
	{
		require("../backend/config.php");
		mysql_connect($db_host, $db_username, $db_password) or die('<span style="color: red;">Error connecting to MySQL server: ' . mysql_error() . '</span></div></center></body></html>');
		mysql_select_db($db_name) or die('<span style="color: red;">Error selecting MySQL database: ' . mysql_error() . '</span></div></center></body></html>');
		mysql_query("TRUNCATE TABLE `${db_prefix}apps`;");
		mysql_query("ALTER TABLE `${db_prefix}apps` AUTO_INCREMENT = 1;");
		require("../backend/lib.xml.php");
		$xml = new Xml; 
		$dir = opendir("./apps/");
		while(($file = readdir($dir)) !== false){
			if($file == '..' || $file == '.'){
				continue;
			}
			else {
			if(is_dir("../apps/" . $file)){
				if(!file_exists("../apps/" . $file . "/appmeta.xml")) { continue; }
				$out = $xml->parse('../apps/'.$file.'/appmeta.xml', 'FILE');
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
				echo($message);
				$templine = '';
				$file2 = fopen("../apps/$file/$installfile", "r");
				while(!feof($file2)) {
					$templine = $templine . fgets($file2, 4096);
				}
				fclose ($file2); 
				$templine = mysql_real_escape_string($templine);
				$code = $templine;
				$blah = "INSERT INTO `${db_prefix}apps` (`name`, `author`, `email`, `code`, `version`, `maturity`, `category`) VALUES ('${name}', '${author}', '${email}', '${code}', '${version}', '${maturity}', '${category}');"; 
				mysql_query($blah) or die("fail - ". mysql_error());
				}
			}
		}
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
