<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	import("models.user");
	$cur = $User->get_current();
	if(!$cur->has_permission("core.administration")) internal_error("permission_denied");
	
	import("lib.package");
	import("models.package");
	import("models.repository");
	
	if(!is_dir($GLOBALS['path']."/../tmp/pkg-cache"))
		mkdir($GLOBALS['path']."/../tmp/pkg-cache");
		
	if($_GET['section'] == "package") {
		if($_GET['action'] == "install") {
			$name=$_POST['name'];
			$version = $_POST['version'];
			//check to see if it's installed already
			$inst = $Package->filter("name", $name);
			foreach($inst as $pak) {
				if($pak->status != "uninstalled") {
					$out = new intOutput("already_installed");
					die();
				}
			}
			if($version) {
				$pak = $Package->filter(array(
					"name" => $name,
					"version" => $version
				));
				if($pak === false) internal_error("object_not_found");
				$pak = $pak[0];
			}
			else
			{
				$paks = $Package->filter("name", $name);
				if($paks === false) internal_error("object_not_found");
				//look for latest version
				$version = array(
					"major" => 0,
					"minor" => 0,
					"patch" => 0,
					"flag" => "dev"
				);
				$newest = null;
				foreach($paks as $pak) {
					$v = $pak->version;
					$v = explode(".", $v);
					$major = $v[0];
					$minor = $v[1];
					$patch = "";
					foreach($v[2] as $key => $c) {
						if(is_numeric($c)) $path .= $c;
						else break;
					}
					$flag = substr($v[2], $key, count($v[2]));
					if($major > $version["major"]
					|| ($major == $version["major"] && $minor > $version["minor"])
					|| ($major == $version["major"] && $minor == $version["minor"] && $patch > $version["patch"])
					|| ($major == $version["major"] && $minor == $version["minor"] && $patch == $version["patch"] && strnatcasecmp($version["flag"], $flag) < 0)) {
						$newest = $pak;
					}
				}
			}
			
			$cachedir=$GLOBALS['path']."/../tmp/pkg-cache/".str_replace("..", "", $pak->source)."/";
			$package = $cachedir.$pak->name."-".$pak->version.".lucid.zip";
			
			if(!is_file($package)) {
				import("lib.net.Request");
				$p=new HTTP_Request($pak->source."/".$pak->category."/".$pak->name."-".$pak->version.".lucid.zip", array(
					allowRedirects => true
				));
				$p->setMethod(HTTP_REQUEST_METHOD_GET);
				$p->sendRequest();
				
				$content=$p->getResponseBody();
				$p->disconnect();
				if(!is_dir($cachedir))
					mkdir($cachedir);
				file_put_contents($package, $content);
			}
			
			$res=package::install($package, true, $pak);
			$out=new intOutput($res == true ? "ok" : "generic_err");
			$pak->status="installed";
			$pak->save();
		}
		if($_GET['action'] == "remove") {
			$res = package::remove($_GET['name']);
			$out = new intOutput($res ? "ok" : "generic_err");
		}
		if($_GET['action'] == "info") {
			$id=$_POST['id'];
			$pak = $Package->get($id);
			$info = array();
			foreach(array(
				"id",
				"name",
				"description",
				"source",
				"version",
				"dependancies",
				"category",
				"status"
			) as $key) {
				$info[$key] = $pak->$key;
			}
			$out = new jsonOutput($info);
		}
	}
	if($_GET['section'] == "repository") {
		if($_GET['action'] == "getCategories") {
			$packages = $Package->all();
			$cats = array();
			foreach($packages as $pak) {
				if(array_search($pak->category, $cats) !== false) {
					array_push($cats, $pak->category);
				}
			}
			$out = new jsonOutput($cats);
		}
		if($_GET['action'] == "reload") {
			$repos = $Repository->all();
			$existingPackages = array();
			foreach($repos as $repo) {
				$p=new HTTP_Request($repo->url . "/packages.json", array(
					allowRedirects => true
				));
				$p->setMethod(HTTP_REQUEST_METHOD_GET);
				$p->sendRequest();
				
				$content=$p->getResponseBody();
				$p->disconnect();
				import("lib.Json.Json");
				$packages = Zend_Json::decode($content);
				foreach($packages as $pinfo) {
					$res = $Package->filter(array(
						'name' => $pinfo['name'],
						'source' => $repo['url'],
						'version' => $pinfo['version'],
						'category' => $pinfo['category']
					));
					if($res !== false)
						$pak = $res[0];
					else
						$pak = new $Package();
					foreach(array(
						'name' => $pinfo['name'],
						'description' => $pinfo['description'],
						'type' => $pinfo['type'],
						'source' => $repo['url'],
						'version' => $pinfo['version'],
						'dependencies' => $pinfo['dependencies'],
						'category' => $pinfo['category']
					) as $key=>$value) {
						$pak->$key = $value;
					}
					$pak->save();
					array_push($existingPackages, $pak->id);
				}
			}
			$old=$Package->filter("id__not", $existingPackages);
			foreach($old as $pack) {
				if($pack->status == "uninstalled") {
					//if it's not installed, remove it
					$pack->delete();
				}
			}
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "add") {
			$repo = new $Repository();
			foreach(array("url", "enabled") as $key) {
				$repo->$key = $_POST[$key];
			}
			$repo->save();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "remove") {
			$repo = $Repository->get($_POST['id']);
			$repo->delete();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "enable") {
			$repo = $Repository->get($_POST['id']);
			$repo->enabled = 1;
			$repo->save();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "disable") {
			$repo = $Repository->get($_POST['id']);
			$repo->enabled = 0;
			$repo->save();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "list") {
			$repos = $Repository->all();
			$list=array();
			foreach($repos as $repo) {
				array_push($list, array(
					"url" => $repo->url,
					"enabled" => $repo->enabled
				));
			}
			$out = new jsonOutput($list);
		}
	}