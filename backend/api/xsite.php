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
import("models.user");
$user = $User->get_current();

if($user->has_permission("api.xsite"))
{
	$url = $_REQUEST['path'];
	import("lib.net.Request");
	$p = new HTTP_Request($url, array(
		allowRedirects => true
	));
	$p->setMethod(HTTP_REQUEST_METHOD_GET);
	$v=false;
	foreach($_POST as $key=>$value) {
		if($key == "path") continue;
		if(!$v) {
			$v=true;
			$p->setMethod(HTTP_REQUEST_METHOD_POST);
		}
		$p->addPostData($key, $value);
	}
	foreach($_GET as $key=>$value) {
		if($key == "path") continue;
		$p->addQueryString($key, $value);
	}
	$p->sendRequest();

	$type=$p->getResponseHeader("Content-Type");
	header("Content-Type: $type");

	$body = $p->getResponseBody();
	echo $body;

	$p->disconnect();
}
else {
	internal_error("permission_denied");
}
?>