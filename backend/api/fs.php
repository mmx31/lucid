<?php
session_start();
if($_GET['section'] == "io")
{
$_POST['path'] = str_replace("..", "", $_POST['path']); // fix to stop "l33t" hax.
	if ($_GET['action'] == "createDirectory") {
					$odir = $_POST['path'];
				    $dir = "../../files/".$_SESSION['username']."/$odir";
					mkdir($dir);
					echo "0";
	}
		if ($_GET['action'] == "removeFile") {
					$odir = $_POST['path'];
				    $dir = "../../files/".$_SESSION['username']."/$odir";
					unlink($dir);
					echo "0";
	}
		if ($_GET['action'] == "removeDir") {
					$odir = $_POST['path'];
				    $dir = "../../files/".$_SESSION['username']."/$odir";
					rmdir($dir);
					echo "0";
	}
		if ($_GET['action'] == "renameFile") {
					$file = $_POST['path'];
					$newfile = $_POST['newpath'];
				    $dir = "../../files/".$_SESSION['username']."/$file";
					$dir2 = "../../files/".$_SESSION['username']."/$newfile";
					rename($dir, $dir2);
					echo "0";
	}
		if ($_GET['action'] == "getFolder") {
					$odir = $_POST['path'];
				    $dir = opendir("../../files/".$_SESSION['username']."/$odir");
					if(!$dir){
								die();
					} else {
						$output = "<" . "?xml version='1.0' encoding='utf-8' ?" . ">" . "\r\n" . "<getFolderResponse path=\"" . $_REQUEST['path'] . "\">";
						while(($file = readdir($dir)) !== false){
							if($file == '..' || $file == '.'){
								continue;
							} else {
								$t = strtolower($file);
								if(is_dir("../../files/".$_SESSION['username']."/$odir" . $file)){
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
		if ($_GET['action'] == "getFile") {
					$odir = $_POST['path'];
				    	$dir = "../../files/".$_SESSION['username']."/$odir";
					$file = file_get_contents($dir);
					$file = str_replace("<", "&lt;", $file);
					$file = str_replace(">", "&gt;", $file);
					$file = str_replace("&", "&amp;", $file);
					$output = "<" . "?xml version='1.0' encoding='utf-8' ?" .">\r\n" . "<getFileResponse path=\"" . $_REQUEST['path'] . "\">";
					$output .=  "\r\n" . '<file>' . $file . '</file>';
					$output .= '</getFileResponse>';
					header('Content-type: text/xml');
					echo $output;
	}
		if ($_GET['action'] == "writeFile") {
					$content = $_POST['content'];
					$content = str_replace("&lt;", "<", $content);
					$content = str_replace("&gt;", ">", $content);
					$content = str_replace("&amp;", "&", $content);
					$odir = $_POST['path'];
				    	$dir = "../../files/".$_SESSION['username']."/$odir";
					$file = file_put_contents($dir, $content);
					echo "0";
	}
	if($_GET['action'] == "upload") {
		if(!isset($_SESSION['userid'])) {
			die("<textarea>{status: 'failed', details: 'Session is dead.'}</textarea>");
		}
		if(isset($_FILES['uploadedfile']['name'])) {
			$target_path = '../../files/'.$_SESSION['username'].'/'.$_GET['path'];
			$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
			    echo "<textarea>{status: 'success', details: '" . $_FILES['uploadedfile']['name'] . "'}</textarea>";
			} else{
			    echo "<textarea>{status: 'failed', details: 'Contact administrator; could not write to disk'}</textarea>";
			}
		}
		else {
			echo "/*";
			foreach($_FILES as $file)
			{
				echo $file['name'] . "\n";
			}
			echo "*/";
			die("<textarea>{status: 'failed', details: 'File not uploaded'}</textarea>");
		}
	}
}
?>