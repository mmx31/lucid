<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	$GLOBALS['installing'] = true;
	$GLOBALS['path'] = realpath("./../backend") . DIRECTORY_SEPARATOR;
	require("./../backend/lib/includes.php");
    $act = ($_GET['action'] == "" ? "installprograms" : $_GET['action']);
	if($act == "installpermissions") {
		import("models.permission");
		import("models.quota");
		$out = new jsonOutput();
		$Permission->truncate();
		foreach(array(
			array(
				'name' => 'api.xsite',
				'description' => 'Can make cross-domain requests by using the server as a proxy'
			),
			array(
				'name' => 'api.filesystem.download',
				'description' => 'Can download files'
			),
			array(
				'name' => 'api.filesystem.upload',
				'description' => 'Can upload files'
			),
			array(
				'name' => 'api.filesystem.remote',
				'description' => 'Can connect to remote file servers'
			),
			array(
				'name' => 'api.mail',
				'description' => 'Can send/receive mail'
			),
			array(
				'name' => 'core.user.auth.login',
				'description' => 'Can login'
			),
			array(
				'name' => 'core.administration',
				'description' => 'Can administrate the system',
				'initial' => false
			),
			array(
				'name' => 'core.app.write',
				'description' => 'Can develop applications',
				'initial' => false
			)
		) as $args) {
			$out->append("Adding " . $args['name'] . " permission...", "...done");
			$perm = new $Permission($args);
			$perm->save();
		}
		$Quota->truncate();
		foreach(array(
			array(
				'type' => 'user',
				'size' => 26214400
			),
			array(
				'type' => 'group'
			)
		) as $args) {
			$out->append("Adding " . $args['type'] . " quota...", "...done");
			$q = new $Quota($args);
			$q->save();
		}
	}
	if($act == "installadmin")
	{
		import("models.user");
		$out = new jsonOutput();
		$User->truncate();
		$out->append("Establishing connection to database...", "...done");
		$user = new $User();
		$user->username = $_POST['username'];
		$user->email = $_POST['email'];
		$user->password = $_POST['password'];
		$user->quota = 0; //no quota
		$user->crypt_password();
		$user->add_permission("core.administration");
		$user->add_permission("core.app.write");
		$user->save();
		$out->append("Writing admin username, password, and e-mail to database...", "...done");
	}
	if($act == "installdatabase")
	{
		$out = new jsonOutput();
		$db_url = addslashes($_POST['db_url']);
		$db_prefix = addslashes($_POST['db_prefix']);
		$conf_public = $_POST['conf_public'];
		$conf_throttle = $_POST['conf_throttle'];
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
		$writebuffer .= "\t\t\"public\" => " . ($conf_public == "true" ? "true" : "false") . ",\n";
		$writebuffer .= "\t\t\"crosstalkThrottle\" => " . ($conf_throttle == "true" ? "true" : "false") . "\n";
		$writebuffer .= "\t);\n";
		if (is_writable("../backend/")) {
	        $handle = fopen("../backend/configuration.php", 'w');
	        fwrite($handle, $writebuffer);
	        fclose($handle);
			$out->append("Saving configuration...", "...done");
		}
		else {
			$out->append("Saving configuration...", "...fail");
			die();
		}
		require("../backend/configuration.php");
		$out->append("Loading configuration...", "...done");
		$dir = opendir("../backend/models");
		while(($file = readdir($dir)) !== false){
			if($file{0} == '.' || $file == "base.php"){
				continue;
			}
			$class = str_replace(".php", "", $file);
			import("models." . $class);
			$out->append("Creating table for '$class' class...", "...done");
			$class = ucfirst($class);
			$class = new $class(array(), true);
			$class->_create_table();
		}
	}
	if($act == "installprograms")
	{
		$out = new jsonOutput();
		import("models.app");
		import("lib.Json.Json");
		$App->truncate();
		$out->append("Establishing connection to database...", "...done");
		$out->append("Initalizing application installer...", "...done");
		$dir = opendir("./apps/");
		import("lib.package");
		while(($file = readdir($dir)) !== false){
			if($file{0} == '.'){
				continue;
			}
			else {
				$content = file_get_contents("./apps/".$file);
				$info = Zend_Json::decode($content);
				$result = package::_insert_application_meta($info);
				$out->append("installing ".$info['name']."...", "...done");
			}
		}
	}
			
	if($act == "checkpermissions")
	{
		$dirs = array(
			"../backend/",
			"../files/",
			"../public/",
			"../tmp/",
			"../desktop/dojotoolkit/desktop/resources/themes/",
			"../desktop/dojotoolkit/desktop/apps/"
		);
		$out = new jsonOutput();
		foreach($dirs as $dir)
		{
			$key = str_replace("../", "", $dir);
			if(!is_writable($dir))
			{
				$out->append($key, "not writable (chmod to 777 or chown to webserver's user)");
			}
			else
			{
				$out->append($key, "ok");
			}
		}
	}
	if($act == "checkenvironment")
	{
		$out = new jsonOutput();
		if(file_exists("../backend/configuration.php"))
			$out->append("Checking for any existing configuration...", "warn: Existing configuration found, continuing will overwrite.");
		else
			$out->append("Checking for any existing configuration...", "ok: None found.");
		if(function_exists("ftp_connect"))
			$out->append("Checking for FTP support...", "ok: FTP Supported");
		else
			$out->append("Checking for FTP support...", "warn: FTP Not Supported - FTP will not be functional");
		if(function_exists("ssh2_connect"))
			$out->append("Checking for SFTP support...", "ok: SFTP Supported");
		else
			$out->append("Checking for SFTP support...", "warn: SFTP Not Supported - SFTP will not be functional");
	}
