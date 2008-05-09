<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


require("../lib/includes.php");
import("models.user");
import("lib.Json.Json");
$user = $User->get_current();

if($user->has_permission("api.xsite"))
{
	$params = Zend_Json::decode($_REQUEST['DESKTOP_XSITE_PARAMS']);
	$url = $params["url"];
	import("lib.net.Request");
	$reqArgs = array(
		allowRedirects => true
	);
	if(isset($params["authinfo"])) {
		$reqArgs["user"] = base64_decode($params["authinfo"]["username"]);
		$reqArgs["pass"] = base64_decode($params["authinfo"]["password"]);
	}
	$p = new HTTP_Request($url, $reqArgs);
	$p->setMethod(HTTP_REQUEST_METHOD_GET);
	//	required for some ajax apis
	$p->addHeader("Referer", "http://".$_SERVER['SERVER_NAME']."/");
	$v=false;
	foreach($_POST as $key=>$value) {
		if($key == "DESKTOP_XSITE_PARAMS") continue;
		if(!$v) {
			$v=true;
			$p->setMethod(HTTP_REQUEST_METHOD_POST);
		}
		$p->addPostData($key, $value);
	}
	foreach($_GET as $key=>$value) {
		if($key == "DESKTOP_XSITE_PARAMS") continue;
		$p->addQueryString($key, $value);
	}
	$p->sendRequest();

	header("Content-Type: $type");
	foreach(array(
		"400" => "Bad syntax",
		"401" => "Unauthorized",
		"402" => "Not Used (Payment Granted)",
		"403" => "Forbidden",
		"404" => "Not Found",
		"500" => "Internal Error",
		"501" => "Not Implemented",
		"502" => "Overloaded",
		"503" => "Gateway Timeout"
	) as $key => $value) {
		if($p->getResponseCode() == $key)
			header("HTTP/1.0 ".$key." ".value);
	}

	$type=$p->getResponseHeader("Content-Type");
	
	$body = $p->getResponseBody();
	echo $body;

	$p->disconnect();
}
else {
	internal_error("permission_denied");
}
?>