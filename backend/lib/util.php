<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/

error_reporting(0);
//make sure no responces are being cached
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");
//get rid of magicquotes

if (get_magic_quotes_gpc())
{
	foreach($_POST as $key => $value)
	{
		$_POST[$key] = stripslashes($value);
	}
}
if (get_magic_quotes_gpc())
{
	foreach($_GET as $key => $value)
	{
		$_GET[$key] = stripslashes($value);
	}
}
//util functions
function internal_error($type, $msg="")
{
	if($msg=="") $msg = $type;
	header('FirePHP-Data: {"msg":"' . str_replace("\n", "", addslashes($msg)) . '"}');
	$p = new intOutput();
	$p->set($type);
	error_log("Lucid Error: " . $type . " (" . $msg . ")");
	die();
}

function import($module) {
	$module = explode(".", $module);
	$path = implode(DIRECTORY_SEPARATOR, $module);
	$file = $GLOBALS['path'] . $path . ".php";
	try {
		return @include_once($file);
	}
	catch(Exception $e) {
		return false;
	}
}
//sessions and cookies
function get_basepath() {
	$curpath = explode("/", $_SERVER['REQUEST_URI']);
	$dir = array_key_exists('installing', $GLOBALS) ? "install" : (array_key_exists('mobile', $GLOBALS) ? "mobile" : "backend");
	while($curpath[count($curpath)-1] != $dir) {
		if(count($curpath) == 0) return "/";
		array_pop($curpath);
	}
	array_pop($curpath);
	return implode("/", $curpath) . "/";
}
$sesPath = $GLOBALS['path']."/../tmp/sessions/";
if(!is_dir($sesPath)) mkdir($sesPath, 777);
if(is_writable($sesPath)) session_save_path($sesPath);


$time = 60*60*24*365;
session_name('desktop_session');
session_set_cookie_params($time, get_basepath());
ini_set("session.gc_maxlifetime",$time);
session_start();


//for debugging
function desktop_errorHandler($exception) {
	internal_error("generic_err", $exception->getMessage());
}
set_exception_handler("desktop_errorHandler");
//test session token
$omit_backends = array(
    "core.bootstrap.check.getToken",
    "core.bootstrap.check.loggedin",
    "core.user.auth.login",
    "core.user.auth.register",
    "core.user.auth.resetpass",
    "api.fs.io.display",
    "api.fs.io.download",
    //"api.fs.io.upload",
    "..io.upload", //for some reason this is what $backend is set to when uploading. Probably due to the uploader workarounds
    "core.theme.package.install",
    "core.app.install.package",
);
$res = array();
ereg("(.+)\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)\.php", $_SERVER["SCRIPT_FILENAME"], $res);
$backend = $res[2] . "." . $res[3] . "." . $_GET['section'] . "." . $_GET['action'];
$omit = false;
foreach($omit_backends as $tbackend){
    if($backend == $tbackend){
        $omit = true;
    }
}
if(array_key_exists('installing', $GLOBALS)){
    $omit=true;
}
if(!$omit){
    if($_SESSION['token'] != $_POST['DESKTOP_TOKEN']){
        internal_error("token_mismatch", "CSRF token didn't match");
    }
}

