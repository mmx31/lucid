<?php
    class sqlSchema {
		var $_db;
		public function __construct($schemaFile, $db) {
			//bootstrap
			self::$_db = $db;
			$fileContents = file_get_contents($schemaFile);
			$schema = Zend_Json::decode($fileContents);
			
			//get the metadata, such as charset
			$charset = $schema['__META__']['charset'];
			unset($schema['__META__']);
			
			//make each table
			foreach($schema as $table => $fields) {
				self::makeTable($table, $fields, $charset);
			}
		}
		private function makeTable($name, $fields, $charset) {
			$sql = "CREATE TABLE ".self::$_db->quoteIdentifier($name)." (";
			foreach($fields as $name => $properties) {
				$sql .= self::makeField($name,
										$properties["type"],
										$properties["length"],
										$properties["default"],
										$properties["null"],
										$properties["key"],
										$properties["primaryKey"]);
			}
			$sql .= ")";
			//TODO: set the charset/collate
		}
		private function makeField($name, $type, $length, $default=null, $null=false, $key=false, $pk=false) {
			//TODO: change the type depending on the database backend used
			//TODO: support AUTO_INCREMENT, on sqlite it's AUTOINCREMENT
			$type = strtoupper($type);
			return self::$_db->quoteIdentifier($name)." ".$type."(".$length.")"
					. ($null ? " NULL" : " NOT NULL") . ($default ? " DEFAULT ".self::$_db->quote($default) : "")
					. ($key && !$pk ? " UNIQUE KEY" : "") . ($pk && !$key ? " PRIMARY KEY" : "");
		}
    }
