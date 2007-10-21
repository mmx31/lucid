<?php
/*
 * Some libaries!
 */
 function deltree($path) {
  if (is_dir($path)) {
      if (version_compare(PHP_VERSION, '5.0.0') < 0) {
        $entries = array();
      if ($handle = opendir($path)) {
        while (false !== ($file = readdir($handle))) $entries[] = $file;

        closedir($handle);
      }
      } else {
        $entries = scandir($path);
        if ($entries === false) $entries = array(); // just in case scandir fail...
      }

    foreach ($entries as $entry) {
      if ($entry != '.' && $entry != '..') {
        deltree($path.'/'.$entry);
      }
    }

    return rmdir($path);
  } else {
      return unlink($path);
  }
}
function dircopy($src_dir, $dst_dir, $verbose = false, $use_cached_dir_trees = false)
    {   
        $num = 0;
        static $cached_src_dir;
        static $src_tree;
        static $dst_tree;

        if (!$use_cached_dir_trees || !isset($src_tree) || $cached_src_dir != $src_dir)
        {
            $src_tree = get_dir_tree($src_dir);
            $cached_src_dir = $src_dir;
        }
        if (!$use_cached_dir_trees || !isset($dst_tree))
        {
            $dst_tree = get_dir_tree($dst_dir);
            if (!is_dir($dst_dir)) mkdir($dst_dir, 0777, true); 
        }

          foreach ($src_tree as $file => $src_mtime)
        {
            if (!isset($dst_tree[$file]) && $src_mtime === false) // dir
                mkdir("$dst_dir/$file");
            elseif (!isset($dst_tree[$file]) && $src_mtime || isset($dst_tree[$file]) && $src_mtime > $dst_tree[$file])  // file
            {
                if (copy("$src_dir/$file", "$dst_dir/$file"))
                {
                    if($verbose) echo "Copied '$src_dir/$file' to '$dst_dir/$file'<br>\r\n";
                    touch("$dst_dir/$file", $src_mtime);
                    $num++;
                } else
                    echo "<font color='red'>File '$src_dir/$file' could not be copied!</font><br>\r\n";
            }       
        }

        return $num;
    }
    function get_dir_tree($dir, $root = true)
    {
        static $tree;
        static $base_dir_length;

        if ($root)
        {
            $tree = array(); 
            $base_dir_length = strlen($dir) + 1; 
        }

        if (is_file($dir))
        {
            //if (substr($dir, -8) != "/CVS/Tag" && substr($dir, -9) != "/CVS/Root"  && substr($dir, -12) != "/CVS/Entries")
            $tree[substr($dir, $base_dir_length)] = filemtime($dir);
        } elseif (is_dir($dir) && $di = dir($dir)) // add after is_dir condition to ignore CVS folders: && substr($dir, -4) != "/CVS"
        {
            if (!$root) $tree[substr($dir, $base_dir_length)] = false; 
            while (($file = $di->read()) !== false)
                if ($file != "." && $file != "..")
                    get_dir_tree("$dir/$file", false); 
            $di->close();
        }

        if ($root)
            return $tree;    
    }
require("../backend/config.php");
if(isset($_GET['delete'])) {
unlink("../apps/tmp/".$_GET["delete"]);
die("Application cache deleted. <a href=\"index2.php?backend=uploadapp\">go back</a>");
}
if(isset($_FILES['uploadedfile']['name'])) {
if($_FILES['uploadedfile']['name'] == "") {
die("No appPackage was uploaded.");
}
echo("Preparing Installer...");
$target_path = '../apps/tmp/';
$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
if(file_exists($target_path)) { 
die("ERROR! Application already installed. (If you think this is incorrect, <a href='index2.php?backend=uploadapp&delete=". basename( $_FILES['uploadedfile']['name']).">click here</a>.)");
 }
if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
echo("OK!<br>Extracting application package...");
require("../backend/lib.unzip.php");
$zip = new dUnzip2($target_path); 
$zip->getList();
$zip->unzipAll('../apps/tmp/unzipped'); 
echo("OK!<br>Starting XML Engine...");
require("../backend/lib.xml.php");
$xml = new Xml; 
echo("OK!<br>Parsing appMeta...");
if(!file_exists("../apps/tmp/unzipped/appmeta.xml")) { die("ERROR! Invalid Application Package"); } 
$out = $xml->parse('../apps/tmp/unzipped/appmeta.xml', 'FILE'); 
$installfile = $out[installFile];
$message = $out[installMessage];
$fr = $out[filesRequired];
$frt = $out[filesCopyTo];
$frf = $out[filesCopyFrom];
echo("OK!<br>$message<br>Importing and checking for database file...");
if(!file_exists("../apps/tmp/unzipped/$installfile")) { die("ERROR! Application package is damaged."); }
        mysql_connect($db_host, $db_username, $db_password) or die('<span style="color: red;">Error connecting to MySQL server: ' . mysql_error() . '</span></div></center></body></html>');
        mysql_select_db($db_name) or die('<span style="color: red;">Error selecting MySQL database: ' . mysql_error() . '</span></div></center></body></html>');
		$templine = '';
		$lines = file("../apps/tmp/unzipped/$installfile") or die("<span style='color: red;'>Error, could not read database file!</span></div></center></body></html>");
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
		echo("OK!<br>Importing any required files...");
		if($fr != true) { 
		echo("OK!<br>Cleaning up...");
		deltree("../apps/tmp/unzipped");
		die("OK!<br><br>Installation Completed!"); 
		}
		dircopy("../apps/tmp/unzipped/$frf","../apps/$frt");
		echo("OK!<br>Cleaning up...");
		deltree("../apps/tmp/unzipped");
		die("OK!<br><br>Installation Completed!");
		
//print_r($out);
}
}
?>
<form enctype="multipart/form-data" action="index2.php?backend=uploadapp" method="POST">
Psych Desktop Application Package: <input name="uploadedfile" type="file" /><br />
<input type="submit" value="Install Application" />
</form>