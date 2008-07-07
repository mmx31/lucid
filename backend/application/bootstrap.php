<?php 

define("CONFIG_PATH", dirname(dirname(__FILE__))."/configuration.php");

error_reporting(E_ALL | E_STRICT);  
ini_set('display_startup_errors', 1);  
ini_set('display_errors', 1); 
 
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
//setup autoloading of classes
set_include_path('library' . PATH_SEPARATOR . get_include_path());  
 
require_once "Zend/Loader.php"; 
Zend_Loader::registerAutoload();

//initiate session management
Zend_Session::start();
$defaultNamespace = new Zend_Session_Namespace("desktop");

if (!isset($defaultNamespace->initialized)) {
    Zend_Session::regenerateId();
    $defaultNamespace->initialized = true;
}
//set username for the session
if(isset($defaultNamespace->username))
	Desktop_User::set($defaultNamespace->username);
//TODO: Make sure Zend_Session::writeClose() is called before loading any 3rd party app scripts to prevent session poisoning
//TODO: Also, make sure it's impossible for an app to get the current session ID!

//start the controllers

$frontController = Zend_Controller_Front::getInstance(); 
$frontController->throwExceptions(true); 
$frontController->setControllerDirectory('application/controllers'); 
$frontController->dispatch(); 