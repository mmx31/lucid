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
 
set_include_path('library' . PATH_SEPARATOR . get_include_path());  
 
require_once "Zend/Loader.php"; 
Zend_Loader::registerAutoload();

$frontController = Zend_Controller_Front::getInstance(); 
$frontController->throwExceptions(true); 
$frontController->setControllerDirectory('application/controllers'); 
$frontController->dispatch(); 