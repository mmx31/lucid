<?php

/**
 * @see Zend_Exception
 */
require_once 'Zend/Exception.php';

class Desktop_VFS_Exception extends Zend_Exception {}
class Desktop_VFS_UnimplementedException extends Desktop_VFS_Exception {}