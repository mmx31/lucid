<?php

header("Content-type: text/plain\n\n");

include("dbf-include.php");

$dbf->query("CREATE DATABASE `dump_test`");
echo "database created!\n";

$dbf->select_db("dump_test");
echo "database selected!\n";

$sql_dump = "

CREATE TABLE `users_test`
(
	`id` INT NOT NULL AUTO_INCREMENT KEY ,
	`domain` CHAR (100) NOT NULL ,
	`name` CHAR (100) NULL default 'ppo'
);

INSERT INTO `users_test` values 
(1,'eduardo.net','Eduardo Cruz') ,
(2,'google.com.br',null) ,
(4,'dgfsdf.net','irene');

CREATE TABLE `users_test2`
(
	`id` INT NOT NULL AUTO_INCREMENT KEY ,
	`domain` CHAR (100) NOT NULL ,
	`name` CHAR (100) NULL default 'ppo'
);

INSERT INTO `users_test2` values 
(1,'eduardo.net','Eduardo Cruz') ,
(2,'google.com.br',null) ,
(4,'dgfsdf.net','irene');


";

$dbf->query($sql_dump);
echo "dump test ok!\n";

$select = $dbf->query("select * from users_test");

while ($row = $dbf->fetch_array($select))
	print_r($row);

$q2 = $dbf->query("LIST databases");
while ($row = $dbf->fetch_array($q2))
{
	print_r($row);
}

$q3 = $dbf->query("LIST tables");
while ($row = $dbf->fetch_array($q3))
{
	print_r($row);
}

$q3 = $dbf->query("LIST fields of table users_test");
while ($row = $dbf->fetch_array($q3))
{
	print_r($row);
}

$q3 = $dbf->query("show create table users_test");
$createtb = $dbf->fetch_array($q3);
	print_r($createtb);

/*
$dbf->query("drop DATABASE `dump_test`");
echo "database dropped!\n";
*/
?>
