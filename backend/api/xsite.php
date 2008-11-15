<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


require("../lib/includes.php");
import("models.user");
import("models.auth");
import("lib.Json.Json");
import("lib.Blowfish");
$user = $User->get_current();
define('CRYPT_BLOWFISH_NOMCRYPT', true);

if($user->has_permission("api.xsite"))
{
	$params = Zend_Json::decode($_POST['DESKTOP_XSITE_PARAMS']);
	$url = $params["url"];
	import("lib.net.Request");
	$reqArgs = array(
		"allowRedirects" => true
	);
	$p = new HTTP_Request($url, $reqArgs);
	$p->setMethod(HTTP_REQUEST_METHOD_GET);
	if(array_key_exists("authinfo", $params)) {
		$auth = $params["authinfo"];
		$server = array();
		preg_match('(^(?:[^/]+://)?([^/:]+))', $url, $server);
		if(array_key_exists("password", $auth)) {
			//create/update the entry in the DB
			$entries = $Auth->filter(array(
				"appid" => $params["appid"],
				"server" => $server[1],
				"username" => $auth["username"],
				"userid" => $user->id
			));
			//get encryption stuff going
			$blowfish = Crypt_Blowfish::factory("ecb");
			$blowfish->setKey($GLOBALS['conf']['salt']);
			
			if(!$entries[0])
			{
				//create
				$entry = new $Auth(array(
					"appid" => $params["appid"],
					"server" => $server[1],
					"username" => $auth["username"],
					"userid" => $user->id,
					"password" => $blowfish->encrypt($auth["password"]),
				));
			}
			else {
				//update
				$entry = $entries[0];
				$entry->password = $blowfish->encrypt($auth["password"]);
			}
			$entry->save();
		}
		else {
			//fetch password from the db
			$entries = $Auth->filter(array(
				"appid" => $params["appid"],
				"server" => $server[1],
				"username" => $auth["username"],
				"userid" => $user->id
			));
			$entry = $entries[0];
			$blowfish = Crypt_Blowfish::factory("ecb");
			$blowfish->setKey($GLOBALS['conf']['salt']);
			$auth["password"] = trim($blowfish->decrypt($entry->password));
		}
		// I wish API devs wouldn't be lazy, and support digest auth.
		// That way we wouldn't have to use a two-way encryption algorythm
		$p->addHeader('Authorization', 'Basic ' . base64_encode($auth["username"].":".$auth["password"]));
	}
	//	required for some ajax apis
	$p->addHeader("Referer", "http://".$_SERVER['SERVER_NAME']."/");
	$v=false;
	foreach($_POST as $key=>$value) {
		if($key == "DESKTOP_XSITE_PARAMS" || $key == "dojo_preventCache") continue;
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
	$type=$p->getResponseHeader("Content-Type");
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
			header("HTTP/1.0 ".$key." ".$value);
	}

	
	$body = $p->getResponseBody();
	echo $body;

	$p->disconnect();
}
else {
	internal_error("permission_denied");
}
?>
