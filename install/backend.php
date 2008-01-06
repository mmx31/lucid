<?php
	$GLOBALS['path'] = realpath("./../backend") . DIRECTORY_SEPARATOR;
	require("./../backend/lib/includes.php");
    $act = ($_GET['action'] == "" ? "installprograms" : $_GET['action']);
	if($act == "installpermissions") {
		import("models.permission");
		$out = new jsonOutput();
		foreach(array(
			array(
				'name' => 'api.xsite',
				'dispName' => 'Can make cross-domain requests'
			),
			array(
				'name' => 'api.ide',
				'dispName' => 'Can develop applications'
			),
			array(
				'name' => 'core.user.auth.login',
				'dispName' => 'Can login'
			)
		) as $args) {
			$out->append("Adding " . $args['name'] . " permission...", "...done");
			$p = new $Permission($args);
			$p->save();
		}
	}
	if($act == "installadmin")
	{
		import("models.user");
		echo("{");
		echo("\"Establishing connection to database...\":");
		$User->truncate();
		echo("\"...done\",");
	    echo("\"Writing admin username, password, and e-mail to database...\":");
		$user = new $User();
		$user->username = $_POST['username'];
		$user->email = $_POST['email'];
		$user->password = $_POST['password'];
		$user->crypt_password();
		$user->level = "admin";
		$user->save();
		echo("\"...done\"");
		echo("}");
	}
	if($act == "installdatabase")
	{
		echo("{");
		echo("\"Parsing form values...\":");
		$db_url = $_POST['db_url'];
		$db_prefix = $_POST['db_prefix'];
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
		$writebuffer  = "<" . "?php\n";
		$writebuffer .= "\t$" . "GLOBALS['db'] = Array(\n";
		$writebuffer .= "\t\t\"database\" => \"" . $db_url. "\",\n";
		$writebuffer .= "\t\t\"prefix\" => \"". $db_prefix . "\"\n";
		$writebuffer .= "\t);\n";
		$writebuffer .= "\t$" . "GLOBALS['conf'] = Array(\n";
		$writebuffer .= "\t\t\"salt\" => \"" . $conf_secretword . "\",\n";
		$writebuffer .= "\t\t\"public\" => \"yes\"\n";
		$writebuffer .= "\t);\n";
		$writebuffer .= "?" . ">";
		if (is_writable("../backend/configuration.php")) {
        $handle = fopen("../backend/configuration.php", 'w');
        fwrite($handle, $writebuffer);
        fclose($handle);
		echo("\"...done\",");
		//echo("}");
		}
		else {
		echo("\"...fail\"");
		echo("}");
		die();
		}
		$dir = opendir("../backend/models");
		while(($file = readdir($dir)) !== false){
			if($file{0} == '.' || $file == "base.php"){
				continue;
			}
			$class = str_replace(".php", "", $file);
			import("models." . $class);
			$class = ucfirst($class);
			$class = new $class(array(), true);
			$class->_create_table();
		}
		echo "'creating database tables...': '...done'}";
	}
	if($act == "installprograms")
	{
		//TODO: this should use the models!
		echo("{");
		import("models.app");	
		echo("\"Establishing connection to database...\":");
		$App->truncate();
		echo("\"...done\",");
		echo("\"Initalizing application installer...\":");
		require("../backend/lib.xml.php");
		$xml = new Xml; 
		echo("\"...done\"");
		$dir = opendir("./apps/");
		while(($file = readdir($dir)) !== false){
			if($file{0} == '.'){
				continue;
			}
			else {
			if(is_dir("./apps/" . $file)){
				if(!file_exists("./apps/" . $file . "/appmeta.xml")) { continue; }
				echo(",");
				$out = $xml->parse('./apps/'.$file.'/appmeta.xml', 'FILE');
				$app = new $App();
				$app->name = $out[name];
				$app->author = $out[author];
				$app->email = $out[email];
				$app->version = $out[version];
				$app->maturity = $out[maturity];
				$app->category = $out[category];
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
				$app->code = $templine;
				$app->save();
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
			"../backend/configuration.php"
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
