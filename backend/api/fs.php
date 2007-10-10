<?php
session_start();
if ($_GET['fs'] == "createDirectory") {
				$odir = $_REQUEST['path'];
			    $dir = "../files/".$_SESSION['userid']."/$odir";
				mkdir($dir);
}
	if ($_GET['fs'] == "removeFile") {
				$odir = $_REQUEST['path'];
			    $dir = "../files/".$_SESSION['userid']."/$odir";
				unlink($dir);
}
	if ($_GET['fs'] == "removeDir") {
				$odir = $_REQUEST['path'];
			    $dir = "../files/".$_SESSION['userid']."/$odir";
				rmdir($dir);
}
	if ($_GET['fs'] == "getFolder") {
				$odir = $_REQUEST['path'];
			    $dir = opendir("../files/".$_SESSION['userid']."/$odir");
				if(!$dir){
							die();
				} else {
					$output = "<" . "?xml version='1.0' encoding='utf-8' ?" . ">" . "\r\n" . "<getFolderResponse path=\"" . $_REQUEST['path'] . "\">";
					while(($file = readdir($dir)) !== false){
						if($file == '..' || $file == '.'){
							continue;
						} else {
							$t = strtolower($file);
							if(is_dir("../files/".$_SESSION['userid']."/$odir" . $file)){
								$type = 'folder';
							} else {
								$type = 'file';
							}
							$output .=  "\r\n" . '<file type="' . $type . '">' . $file . '</file>';
						}
					}
					$output .=  "\r\n" . '</getFolderResponse>';
					header('Content-type: text/xml');
					echo $output;
				}
}
	if ($_GET['fs'] == "getFile") {
				$odir = $_REQUEST['path'];
			    	$dir = "../files/".$_SESSION['userid']."/$odir";
				$file = file_get_contents($dir);
				$output = "<" . "?xml version='1.0' encoding='utf-8' ?" .">\r\n" . "<getFileResponse path=\"" . $_REQUEST['path'] . "\">";
				$output .=  "\r\n" . '<file>' . $file . '</file>';
				$output .= '</getFileResponse>';
				header('Content-type: text/xml');
				echo $output;
}
	if ($_GET['fs'] == "writeFile") {
				$content = $_REQUEST['content'];
				$odir = $_REQUEST['path'];
			    	$dir = "../files/".$_SESSION['userid']."/$odir";
				$file = file_put_contents($dir, $content);
}
?>