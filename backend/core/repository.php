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
			$id=$_POST['id'];
			$pak = $Package->get($id);
			if($pak === false) internal_error("object_not_found");
			
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
			
			$res=package::install($package);
			$out=new intOutput($res == true ? "ok" : "generic_err");
			$pak->status="installed";
			$pak->save();
		}
		if($_GET['action'] == "remove") {
			//TODO
		}
	}