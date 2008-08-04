<?php
    class sqlSchema {
		var $_db;
		var $utilClass;
		public function __construct($schemaFile, $driver, $db) {
			//bootstrap
			self::$_db = $db;
			self::$utilClass = self::getZendClass($driver);
			//read file
			$fileContents = file_get_contents($schemaFile);
			$schema = Zend_Json::decode($fileContents);
			
			//make each table
			foreach($schema as $table => $fields) {
				self::makeTable($table, $fields, $charset);
			}
		}
		private function getZendClass($driver) {
			self::$_dbDriver = $driver;
			$utilClass = "Zend_Db_TestUtil_{$driver}";
			require_once "./sql/".str_replace("_", "/", $driver).".php";
			$p= new $utilClass();
			$p->setAdapter(self::$_db);
			return $p;
		}
		private function makeTable($name, $fields, $charset) {
			$driver = self::$_dbDriver;
			if($driver == "Db2"
			|| $driver == "Pdo_Oci"
			|| $driver == "Pdo_Pgsql") {
				self::$utilClass->createSequence($name."_seq");
			}
			$outFields = array();
			foreach($fields as $field => $value) {
				$outFields[$field] = self::$utilClass->getSqlType(strtoupper($value["type"])).
									 ($value["length"] ? "(".$value["length"].")" : "").
									 ($value["null"] ? "" : "NOT NULL").
									 ($value["references"] ? "REFERENCES ".self::$_db->quoteIdentifier($value["references"])." (\"id\")" : "");
			}
			self::$utilClass->createTable($name, $fields);
		}
    }
