<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
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
	//	required for some ajax apis
	$p->addHeader("Referer", "http://".$_SERVER['SERVER_NAME']."/");
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