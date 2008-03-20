<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychcf

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
	require("../lib/includes.php");
	import("models.app");
	import("models.user");
    if($_GET['section'] == "install")
	{
		$cur = $User->get_current();
		if($_GET['action'] == "package" && $cur->has_permission("api.ide"))
		{
			$out = new textareaOutput();	
			if(isset($_FILES['uploadedfile']['name'])) {
			$target_path = '../../apps/tmp/appzip.zip';
			$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
				$out->append("Accessing uploaded file...", "success");
				import("lib.unzip");
				$zip = new dUnzip2($target_path);
				$zip->getList();
				$zip->unzipAll('../../apps/tmp/unzipped');
				$out->append("Decompressing...", "success");
				import("lib.xml");
				$xml = new Xml;
				if(!file_exists("../../apps/tmp/unzipped/appmeta.xml")) { $out->set("generic_err", true); }
				$in = $xml->parse('../../apps/tmp/unzipped/appmeta.xml', 'FILE');
				$out->append("Parsing...", "success");
				$app = new $App();
				$app->name = $in[name];
				$app->author = $in[author];
				$app->email = $in[email];
				$app->version = $in[version];
				$app->maturity = $in[maturity];
				$app->category = $in[category];
				$app->filetypes = Zend_Json::decode($in['filetypes'] ? $in['filetypes'] : "[]");
				$installfile = $in[installFile];
				$message = $in[installMessage];
				$message2 = $in[installedMessage];
				$templine = '';
				$file2 = fopen("../apps/tmp/unzipped/$installfile", "r");
				while(!feof($file2)) {
					$templine = $templine . fgets($file2, 4096);
				}
				fclose ($file2); 
				$app->code = $templine;
				$app->save();
				$out->append("success", "AppPackage installation successful");
			} else{
			   $out->append("error", "Problem accessing uploaded file");
			}
		} else { $out->append("error", "No File Uploaded"); }
	}
	}
    if($_GET['section'] == "fetch")
	{
		if($_GET['action'] == "id")
		{
			$appname = $_POST["name"];
			$p = $App->filter("name", $appname);
			$p = $p[0];
			$out = new jsonOutput();
			$out->append("appid", $p->id);
		}
		if($_GET['action'] == "full")
		{
			header("Content-type: text/json");
			$p = $App->get($_POST['id']);
			echo $p->make_json();
		}
		if($_GET['action'] == "list")
		{
			$p = $App->all();
			$out = new jsonOutput();
			$list = array();
			foreach($p as $d => $v)
			{
				$item = array();
				foreach(array("id", "name", "author", "email", "maturity", "category", "version", "filetypes") as $key) {
					$item[$key] = $v->$key;
				}
				array_push($list, $item);
			}
			$out->set($list);
		}
	}
?>
