<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


class Package extends Base {
	var $name = array('type' => "text");
	var $description = array('type' => "text");
	var $type = array('type' => "text");
	var $source = array('type' => "text");
	var $version = array('type' => "text");
	var $dependencies = array('type' => 'array');
	var $category = array('type' => "text");
	var $status = array('type' => 'text');
}

global $Package;
$Package = new Package();
