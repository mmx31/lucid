<?php 

require dirname(__FILE__).'/global.php'; 

//start the controllers

$frontController = Zend_Controller_Front::getInstance(); 
$frontController->throwExceptions(true); 
$frontController->setControllerDirectory('application/controllers'); 
$frontController->dispatch(); 
