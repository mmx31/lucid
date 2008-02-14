ession_start();
if($_GET['section'] == "io")
{
	$_POST['path'] = str_replace("..", "", $_POST['path']); // fix to stop "l33t" hax.
	require("../lib/includes.php");
	import("models.user");
	$user = $User->get_current();
	$username = $user->username;
	if ($_GET['action'] == "createDirectory") {
					$odir = $_POST['path'];
				    $dir = "../../files/".$username."/$odir";
					mkdir($dir);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "copyFile") {
					$odir = "../../files/".$username."/".$_POST['path'];
					$odira = "../../files/".$username."/".$_POST['newpath'];
					copy($odir, $odira);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "removeFile") {
					$odir = $_POST['path'];
				    $dir = "../../files/".$username."/$odir";
					unlink($dir);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "removeDir") {
					$odir = $_POST['path'];
				    $dir = "../../files/".$username."/$odir";
					deltree($dir);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "renameFile") {
					$file = $_POST['path'];
					$newfile = $_POST['newpath'];
				    $dir = "../../files/".$username."/$file";
					$dir2 = "../../files/".$username."/$newfile";
					rename($dir, $dir2);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "getFolder") {
			$odir = $_POST['path'];
		    $dir = opendir("../../files/".$username."/$odir");
			if(!$dir){
				$out = new intOutput();
				$out->set("generic_err", true);
			} else {
				$output = "<" . "?xml version='1.0' encoding='utf-8' ?" . ">" . "\r\n" . "<getFolderResponse path=\"" . $_REQUEST['path'] . "\">";
				while(($file = readdir($dir)) !== false){
					if($file == '..' || $file == '.'){
						continue;
					} else {
						$t = strtolower($file);
						if(is_dir("../../files/".$username."/$odir" . $file)){
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
				    	$dir = "../../files/".$username."/$odir";
					$file = file_get_contents($dir);
					$file = str_replace("<", "&lt;", $file);
					$file = str_replace(">", "&gt;", $file);
					$file = str_replace("&", "&amp;", $file);
					$file = str_replace("'", "&apos;", $file);
					$file = str_replace("\"", "&quot;", $file);
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
					$content = str_replace("&apos;", "'", $content);
					$content = str_replace("&quot;", "\"", $content);
					$odir = $_POST['path'];
				    	$dir = "../../files/".$username."/$odir";
					$file = file_put_contents($dir, $content);
					$out = new intOutput("ok");
	}
	if($_GET['action'] == "upload") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.upload")) { die("<textarea>{status: 'failed', details: 'Contact administrator; Your account lacks uploading permissions. '}</textarea>"); }
		if(!isset($_SESSION['userid'])) {
			die("<textarea>{status: 'failed', details: 'Session is dead.'}</textarea>");
		}
		if(isset($_FILES['uploadedfile']['name'])) {
			$target_path = '../../files/'.$username.'/'.$_GET['path'];
			$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
			    echo "<textarea>{status: 'success', details: '" . $_FILES['uploadedfile']['name'] . "'}</textarea>";
			} else{
			    echo "<textarea>{status: 'failed', details: 'Contact administrator; could not write to disk'}</textarea>";
			}
		}
		else {
			#echo "/*";
			#foreach($_FILES as $file)
			#{
			#	echo $file['name'] . "\n";
			#}
			#echo "*/";
			die("<textarea>{status: 'failed', details: 'File not uploaded'}</textarea>");
		}
	}
	if($_GET['action'] == "downloadFolder") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		require("../lib.zip.php");
		if($_GET["as"] == "zip") { $newzip = new zip_file("folder.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("folder.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("folder.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files(array("../../files/".$username."/".$_GET['path']."/*"));
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "compressDownload") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		require("../lib.zip.php");
		if($_GET["as"] == "zip") { $newzip = new zip_file("compressed.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("compressed.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("compressed.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files("../../files/".$username."/".$_GET['path']);
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "download") {
			$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		$f = "../../files/" . $username . "/" . $_GET['path'];
		if(file_exists($f))
		{
			$name = basename($f);
			$type = mime_content_type($f);
			$size = filesize($f);
			header("Content-type: $type");
			header("Content-Disposition: attachment;filename=\"$name\"");
			header('Pragma: no-cache');
			header('Expires: 0');
			header("Content-length: $size");
			readfile($f);
		}
	}
	if($_GET['action'] == "display")
	{
		$f = "../../files/" . $username . "/" . $_GET['path'];
		if(file_exists($f))
		{
			$name = basename($f);
			$type = mime_content_type($f);
			$size = filesize($f);
			header("Content-type: $type");
			header('Pragma: no-cache');
			header('Expires: 0');
			header("Content-length: $size");
			readfile($f);
		}
	}
	if ($_GET['action'] == "info") {
			$odir = $_POST['path'];
			$out = new jsonOutput();
			$out->set(getInfo($odir));
	}
}

function getInfo($file) {
	global $username;
	$r = array();
	$r['path'] = $file;
	$f = "../../files/".$username."/$file";
	$r['name'] = basename($f);
	if(is_dir($f)) {
		$r["dir"] = true;
		$r["mimetype"] = "text/directory";
	}
	else if(is_file($f)) {
		$r["file"] = true;
		$r["last_modified"] = date ("F d Y H:i:s.", filemtime($f));
		$r["size"] = filesize($f);
		$r["mimetype"] = mime_content_type($f);
	}
	return $r;
}

function deltree( $f ){

    if( is_dir( $f ) ){
        foreach( scandir( $f ) as $item ){
            if( !strcmp( $item, '.' ) || !strcmp( $item, '..' ) )
                continue;       
            deltree( $f . "/" . $item );
        }   
        rmdir( $f );
    }
    else{
        unlink( $f );
    }
}
?>

