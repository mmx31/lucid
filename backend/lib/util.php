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

//sessions and cookies
function get_basepath() {
	$curpath = explode("/", $_SERVER['REQUEST_URI']);
	$dir = $GLOBALS['installing'] ? "install" : ($GLOBALS['mobile'] ? "mobile" : "backend");
	while($curpath[count($curpath)-1] != $dir) {
		if(count($curpath) == 0) return "/";
		array_pop($curpath);
	}
	array_pop($curpath);
	return implode("/", $curpath) . "/";
}
$sesPath = $GLOBALS['path']."/../tmp/sessions/";
if(!is_dir($sesPath)) mkdir($sesPath);
session_save_path($sesPath);
if(!is_writable($sesPath)) die("sessions path is not writable. (/tmp/session)");

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

//util functions
function internal_error($type, $msg="")
{
	if($msg=="") $msg = $type;
	header('FirePHP-Data: {"msg":"' . addslashes($msg) . '"}');
	$p = new intOutput();
	$p->set($type);
	error_log("Lucid Error: " . $type . " (" . $msg . ")");
	die();
}

function import($module) {
	$module = explode(".", $module);
	$path = implode(DIRECTORY_SEPARATOR, $module);
	$file = $GLOBALS['path'] . $path . ".php";
	return @include_once($file);
}
