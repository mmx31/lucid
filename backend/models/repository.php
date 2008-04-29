<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


class Repository extends Base {
	var $url = array('type' => 'text');
	var $enabled = array('type' => 'integer', 'length' => 1, 'default' => 1);
}
global $Repository;
$Repository = new Repository();