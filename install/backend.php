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
				'description' => 'Can make cross-domain requests'
			),
			array(
				'name' => 'api.ide',
				'description' => 'Can develop applications'
			),
			array(
				'name' => 'api.fs.download',
				'description' => 'Can download files'
			),
			array(
				'name' => 'api.fs.upload',
				'description' => 'Can upload files'
			),
			array(
				'name' => 'api.mail',
				'description' => 'Can send/receive mail'
			),
			array(
				'name' => 'core.user.auth.login',
				'description' => 'Can login'
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
		$out = new jsonOutput();
		$User->truncate();
		$out->append("Connecting to database...", "...done");
		$user = new $User();
		$user->username = $_POST['username'];
		$user->email = $_POST['email'];
		$user->password = $_POST['password'];
		$user->crypt_password();
		$user->level = "admin";
		$user->save();
		$out->append("Writing admin username, password, and e-mail to database...", "...done");
	}
	if($act == "installdatabase")
	{
		$out = new jsonOutput();
		$db_url = $_POST['db_url'];
		$db_prefix = $_POST['db_prefix'];
		$out->append("Parsing form values...", "...done");
		$characters = 10;
		$possible = '23456789bcdfghjkmnpqrstvwxyz'; 
		$code = '';
		$i = 0;
		while ($i < $characters) { 
			$code .= substr($possible, mt_rand(0, strlen($possible)-1), 1);
			$i++;
		}    
		$conf_secretword = bin2hex( md5($code, TRUE) );
		$out->append("Generating encryption hash...", "...done");
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
			$out->append("Saving new configuration...", "...done");
		}
		else {
			$out->append("Saving new configuration...", "...fail");
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
		$out->append("Creating database tables...", "...done");
	}
	if($act == "installprograms")
	{
		$out = new jsonOutput();
		import("models.app");
		$App->truncate();
		$out->append("Establishing connection to database...", "...done");
		require("../backend/lib.xml.php");
		$xml = new Xml; 
		$out->append("Initalizing application installer...", "...done");
		$dir = opendir("./apps/");
		while(($file = readdir($dir)) !== false){
			if($file{0} == '.'){
				continue;
			}
			else {
			if(is_dir("./apps/" . $file)){
				if(!file_exists("./apps/" . $file . "/appmeta.xml")) { continue; }
				$in = $xml->parse('./apps/'.$file.'/appmeta.xml', 'FILE');
				$app = new $App();
				$app->name = $in[name];
				$app->author = $in[author];
				$app->email = $in[email];
				$app->version = $in[version];
				$app->maturity = $in[maturity];
				$app->category = $in[category];
				$installfile = $in[installFile];
				$message = $in[installMessage];
				$message2 = $in[installedMessage];
				/* no optional files required for the core apps
				$fr = $in[filesRequired];
				$frt = $in[filesCopyTo];
				$frf = $in[filesCopyFrom]; */
				$templine = '';
				$file2 = fopen("./apps/$file/$installfile", "r");
				while(!feof($file2)) {
					$templine = $templine . fgets($file2, 4096);
				}
				fclose ($file2); 
				$app->code = $templine;
				$app->save();
				$out->append($message, $message2);
				}
			}
		}
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
		$out = new jsonOutput();
		for($i=0;$i<=$x;$i++)
		{
			$p = $dirs[$i];
			$d = $ok[$i];
			$out->append($p, $d);
		}
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