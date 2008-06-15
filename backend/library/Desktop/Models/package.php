<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


class Desktop_Models_Package extends Desktop_Models_Base {
	var $name = array('type' => "text");
	var $description = array('type' => "text");
	var $type = array('type' => "text");
	var $source = array('type' => "text");
	var $version = array('type' => "text");
	var $dependencies = array('type' => 'array');
	var $category = array('type' => "text");
	var $status = array('type' => 'text');
}

global $Desktop_Models_Package;
$Desktop_Models_Package = new Desktop_Models_Package();
