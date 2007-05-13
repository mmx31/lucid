<?php
/* vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: */
// +----------------------------------------------------------------------+
// | PHP Version 4                                                        |
// +----------------------------------------------------------------------+
// | Copyright (c) 1997-2003 The PHP Group                                |
// +----------------------------------------------------------------------+
// | This source file is subject to version 2.02 of the PHP license,      |
// | that is bundled with this package in the file LICENSE, and is        |
// | available at through the world-wide-web at                           |
// | http://www.php.net/license/2_02.txt.                                 |
// | If you did not receive a copy of the PHP license and are unable to   |
// | obtain it through the world-wide-web, please send a note to          |
// | license@php.net so we can mail you a copy immediately.               |
// +----------------------------------------------------------------------+
// | Author: Mario Sansone <msansone@gmx.de>                              |
// +----------------------------------------------------------------------+
//
// $Id: txtdbapi.php,v 1.1 2005/01/14 17:20:17 c-worker Exp $
//
// Database independent query interface definition for the Txt-Db-Api.
// http://sourceforge.net/projects/flatfiledb
//

require_once "DB/common.php";

class DB_txtdbapi extends DB_common
{
    // {{{ properties

    var $connection;
    var $phptype, $dbsyntax;
    var $prepare_tokens = array();
    var $prepare_types = array();
    var $transaction_opcount = 0;
    var $fetchmode = DB_FETCHMODE_ASSOC; /* Default fetch mode */
    var $_affectedRows = 0;

    // }}}
    // {{{ constructor

    /**
     * DB_txtdbapi constructor.
     *
     * @access public
     */

    function DB_txtdbapi()
    {
        $this->DB_common();
        $this->phptype = 'txtdbapi';
        $this->dbsyntax = 'txtdbapi';
        $this->features = array(
            'prepare' => false,
            'pconnect' => false,
            'transactions' => false,
            'limit' => false
        );
        $this->errorcode_map = array();
    }

    // }}}

    // {{{ connect()

    /**
     * Connect to a database and log in as the specified user.
     *
     * @param $dsn the data source name (see DB::parseDSN for syntax)
     * @param $persistent (optional) whether the connection should
     *        be persistent
     * @access public
     * @return int DB_OK on success, a DB error on failure
     */

    function connect($dsninfo, $persistent = false)
    {
        if (!class_exists("Database"))
            return $this->raiseError(DB_ERROR, null, null, null, "txt-db-api.php was not included !");

        $this->dsn = $dsninfo;
        ob_start();
        $conn  = new Database($dsninfo['database']);
        $error = ob_get_contents();
        ob_end_clean();
        if (!$conn) {
            return $this->raiseError(DB_ERROR_CONNECT_FAILED, null,
                                     null, null, strip_tags($error));
        }
        $this->connection = $conn;
        return DB_OK;
    }

    // }}}
    // {{{ disconnect()

    /**
     * Log out and disconnect from the database.
     *
     * @access public
     *
     * @return bool TRUE on success, FALSE if not connected.
     */
    function disconnect()
    {
        $this->connection = null;
        return TRUE;
    }

    // }}}
    // {{{ simpleQuery()

    /**
     * Send a query to Txt-Db-Api and return the results as a ResultSet class instance.
     *
     * @param the SQL query
     *
     * @access public
     *
     * @return mixed returns a valid ResultSet class instance for successful SELECT
     * queries, DB_OK for other successful queries.  A DB error is
     * returned on failure.
     */
    function simpleQuery($query)
    {
        $ismanip = DB::isManip($query);
        $this->last_query = $query;

        $result = $this->connection->executeQuery($query);
        if (!$result) {
            return $this->txtdbapiRaiseError();
        }
        
        if ($ismanip && is_numeric($result))
        	$this->_affectedRows = $result;
        	
        if (is_object($result)) {
        	$this->_affectedRows = 0;
            return $result;
        }
        return DB_OK;
    }

    // }}}
    // {{{ fetchRow()

    /**
     * Fetch and return a row of data (it uses fetchInto for that)
     * @param $result ResultSet class instance
     * @param   $fetchmode  format of fetched row array
     * @param   $rownum     the absolute row number to fetch
     *
     * @return  array   a row of data, or false on error
     */
    function fetchRow($result, $fetchmode = DB_FETCHMODE_DEFAULT, $rownum=null)
    {
        if ($fetchmode == DB_FETCHMODE_DEFAULT) {
            $fetchmode = $this->fetchmode;
        }
        $res = $this->fetchInto ($result, $arr, $fetchmode, $rownum);
        if ($res !== DB_OK) {
            return $res;
        }
        return $arr;
    }

    // }}}
    // {{{ fetchInto()

    /**
     * Fetch a row and insert the data into an existing array.
     *
     * @param $result ResultSet class instance
     * @param $arr (reference) array where data from the row is stored
     * @param $fetchmode how the array data should be indexed
     * @param   $rownum the row number to fetch (starting with 0)
     * @access public
     *
     * @return int DB_OK on success, a DB error on failure
     */
    function fetchInto(&$result, &$arr, $fetchmode, $rownum=null)
    {
        if ($rownum !== null) {
            $result->pos = $rownum;
            if ($fetchmode & DB_FETCHMODE_ASSOC) {
                $arr = $result->getCurrentValuesAsHash();
            } else {
                $arr = $result->getCurrentValues();
            }
            if (!$arr) {
                return $this->txtdbapiRaiseError();
            }
            return DB_OK;
        }
        
        if ($result->next()) {
            if ($fetchmode & DB_FETCHMODE_ASSOC) {
                $arr = $result->getCurrentValuesAsHash();
            } else {
                $arr = $result->getCurrentValues();
            }
        } else {
            return null;
        }

        if (!$arr) {
            return $this->txtdbapiRaiseError();
        }
        return DB_OK;
    }

    // }}}
    // {{{ freeResult()

    /**
     * Free the internal resources associated with $result.
     *
     * @param $result ResultSet class instance
     *
     * @access public
     *
     * @return bool TRUE on success, FALSE if $result is invalid
     */
    function freeResult($result)
    {
		unset($result);
		
		// I fixed the unset thing.
        $this->prepare_types = array();
        $this->prepare_tokens = array();

        return true;
    }

    // }}}
    // {{{ numCols()

    /**
     * Get the number of columns in a result set.
     *
     * @param $result ResultSet class instance
     *
     * @access public
     *
     * @return int the number of columns per row in $result
     */
    function numCols($result)
    {
        return $result->getRowSize();
    }

    // }}}
    // {{{ numRows()

    /**
     * Get the number of rows in a result set.
     *
     * @param $result ResultSet class instance
     *
     * @access public
     *
     * @return int the number of rows in $result
     */
    function numRows($result)
    {
        return $result->getRowCount();
    }

    // }}}
    // {{{ affectedRows()

    /**
     * Gets the number of rows affected by the data manipulation
     * query.  For other queries, this function returns 0.
     *
     * @return number of rows affected by the last query
     */

    function affectedRows()
    {
        if (DB::isManip($this->last_query)) {
            $result = $this->_affectedRows;
        } else {
            $result = 0;
        }
        return $result;
    }

    // }}}
    // {{{ modifyLimitQuery()

    function modifyLimitQuery($query, $from, $count)
    {
        return $query . " LIMIT $from, $count";
    }

    // }}}
    // {{{ txtdbapiRaiseError()

    function txtdbapiRaiseError()
    {
        return $this->raiseError(DB_ERROR, null, null, null,
                                 txtdbapi_get_last_error());
    }

    // }}}
    // {{{ tableInfo()

    function tableInfo($result, $mode = null) {
        $count = 0;
        $id    = 0;
        $res   = array();

        /*
         * $result[]:
         *   [0]["table"]    table name
         *   [0]["name"]     field name
         *   [0]["type"]     field type
         *   [0]["default"]  field default value
         */

        $count = $result->getRowSize();

        for ($i=0; $i<$count; $i++) {
            $res[$i]['table']   = $result->colTables[$i];
            $res[$i]['name']    = $result->colNames[$i];
            $res[$i]['type']    = $result->colTypes[$i];
            $res[$i]['default'] = $result->colDefaultValues[$i];
        }

        return $res;
    }

    // }}}
    // {{{ getSpecialQuery()

    /**
    * Returns the query needed to get some backend info
    * @param string $type What kind of info you want to retrieve
    * @return string The SQL query string
    */
    function getSpecialQuery($type)
    {
        switch ($type) {
            case 'tables':
                $sql = "LIST TABLES";
                break;
            case 'views':
                return DB_ERROR_NOT_CAPABLE;
            case 'users':
                return DB_ERROR_NOT_CAPABLE;
            case 'databases':
                return DB_ERROR_NOT_CAPABLE;
            default:
                return null;
        }
        return $sql;
    }

    // }}}
}

?>
