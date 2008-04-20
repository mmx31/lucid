<?php
	$message = "";
	if($_POST['path']) $_POST['path'] = str_replace("..", "", $_POST['path']);
	if($_GET['path']) $_GET['path'] = str_replace("..", "", $_GET['path']);
	if($_POST['dirname']) $_POST['dirname'] = str_replace("..", "", $_POST['dirname']);
	if($_FILES['upload']['name']) $_FILES['upload']['name'] = str_replace("..", "", $_FILES['upload']['name']);
	if($_GET['download']) $_GET['download'] = str_replace("..", "", $_GET['download']);
	$GLOBALS['mobile'] = true;
	$GLOBALS['path'] = dirname(dirname(__FILE__)) . "/backend/";
	require("../backend/lib/includes.php");
	import("models.user");
	if($_GET['action'] == "login") {
		$p=$User->authenticate($_POST['username'], $_POST['password']);
		if($p != false)
			if($p->has_permission("core.user.auth.login"))
				$p->login();
			else
				$message = "You do not have login permissions";
		else 
			$message = "Incorrect username/password";
	}
	if($_GET['action'] == "logout") {
		$p = $User->get_current();
		if($p != false) $p->logout();
	}
	if($_GET['action'] == "mkdir" && $_POST['dirname'] != "") {
		import("api.vfs.Base");
		import("api.vfs.File");
		$module = new FileFs("/");
		$module->createDirectory($_POST['path'] . "/" . $_POST['dirname']);
		$_GET['path'] = $_POST['path'];
	}
	if($_GET['action'] == "upload") {
		import("api.vfs.Base");
		import("api.vfs.File");
		$module = new FileFs("/");
		$content = file_get_contents($_FILES['upload']['tmp_name']);
		$module->write($_POST['path'] . "/" . $_FILES['upload']['name'], $content);
		$_GET['path'] = $_POST['path'];
	}
	if(isset($_GET['download'])) {
		import("api.vfs.Base");
		import("api.vfs.File");
		$module = new FileFs("/");
		$info = $module->getFileInfo($_GET['download']);
		header("Content-type: ".$info['type']);
		header('Pragma: no-cache');
		header('Expires: 0');
		header("Content-length: ".$info['size']);
		echo $module->read($_GET['download']);
		die();
	}
?>
<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.0//EN" "http://www.wapforum.org/DTD/xhtml-mobile10.dtd">
<html>
	<head>
		<title>Psych Desktop Mobile</title>
		<style type="text/css">
			.login {
				text-align: center;
				margin-left: 5px;
				margin-right: 5px;
				background-color: #71cd66;
				padding: 5px;
			}
			.root {
				color: #aaa;
			}
			.path a {
				color: #444;
			}
			.fileList {
				border-top: 1px solid #71cd66;
			}
			.folderRow, .filRow {
				border-bottom: 1px solid #71cd66;
				padding: 2px;
			}
			.folderRow {
				background-color: #b0cdac;
			}
			.fileRow {
				background-color: #e9ffe6;
			}
			img {
				border: 0px;
			}
		</style>
	</head>
	<body>
		<?php
		$curUser = $User->get_current();
		if(!$curUser) {?>
			<div class="login">
				<form action="./index.php?action=login" method="POST">
					<div style="color: red"><?php echo $message; ?></div>
					<div>Username:</div>
					<div><input type="text" name="username" value="<?php echo $_POST['username']; ?>" /></div>
					<div>Password:</div>
					<div><input type="password" name="password" /></div>
					<div><input type="submit" value="Login" /></div>
				</form>
			</div>
		<?php
			die();
		}
		import("api.vfs.Base");
		import("api.vfs.File");
		if(!isset($_GET['path'])) $_GET['path'] = "/";
		$dir = $_GET['path'];
		$fs = new FileFs($dir);
		?>
		<div class="path">
			<a href="./index.php?path=/"><img src="./home.png" /><span class='root'>Home</span> /</a>
			<?php
				$fullpath = "/";
				foreach(explode("/", $dir) as $file) {
					if($file=="") continue;
					$fullpath .= $file . "/";
					echo " <a href='./index.php?path=".$fullpath."'>".$file."</a> /";
				}
			?>
		</div>
		<div class="fileList">
			<?php
				$list = $fs->listPath($dir);
				foreach($list as $file) {
					?>
					<div class="<?php echo $file['type'] == 'text/directory' ? 'folderRow' : 'fileRow'; ?>">
						<img src="./<?php echo $file['type'] == 'text/directory' ? 'folder' : 'file'; ?>.png" />
						<?php 
							if($file['type'] == "text/directory") {
								echo "<a href='./index.php?path=" . $dir . "/" . $file['name'] ."'>" . $file['name'] . "</a>";
							}
							else {
								echo "<a href='./index.php?download=" . $dir . "/" . $file['name'] ."'>" . $file['name'] . "</a>";
							}
						?>
					</div>
					<?php
				} 
			?>
		</div>
		<div>
			<form action="./index.php?action=mkdir" method="POST">
				<div>Create Directory:</div>
				<input type="hidden" name="path" value="<?php echo addslashes($dir); ?>" />
				<input type="text" name="dirname" />
				<input type="submit" value="Create" />
			</form>
		</div>
		<div>
			<form action="./index.php?action=upload" method="POST" enctype="multipart/form-data" >
				<div>Upload File:</div>
				<input type="hidden" name="path" value="<?php echo addslashes($dir); ?>" />
				<input type="file" name="upload" />
				<input type="submit" value="Upload" />
			</form>
		</div>
		<div>
			<a href="./index.php?action=logout">Logout</a>
		</div>
	</body>
</html>