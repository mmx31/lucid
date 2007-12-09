--    Psych Desktop
--    Copyright (C) 2006 Psychiccyberfreak
 --
  --  This program is free software; you can redistribute it and/or modify
  --  it under the terms of the GNU General Public License as published by
  --  the Free Software Foundation; either version 2 of the License, or
  --  (at your option) any later version.
  --
  --  This program is distributed in the hope that it will be useful,
  --  but WITHOUT ANY WARRANTY; without even the implied warranty of
  --  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  --  GNU General Public License for more details.

  --  You should have received a copy of the GNU General Public License along
  --  with this program; if not, write to the Free Software Foundation, Inc.,
  --  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
  --
-- NOTE: DON'T ACTUALLY RUN THIS! THE INSTALLER (install.php) will install for you!
-- Changed the charset to utf8, it's more standard...
-- Also fixed that nasty "there can be only one auto column and it must be defined as a key" bug.
-- Now the user can specify a prefix! Woo Hoo!!!
-- --------------------------------------------------------

--Do not remove this; it is for the script that automatically updates the
--demo on the website

--START APPS------------------

-- 
-- Table structure for table `#__apps`
--
DROP TABLE IF EXISTS `#__apps`;
CREATE TABLE `#__apps` (
  `ID` int(20) NOT NULL auto_increment,
  `name` mediumtext NOT NULL,
  `author` mediumtext NOT NULL,
  `email` mediumtext NOT NULL,
  `code` longtext NOT NULL,
  `version` text NOT NULL,
  `maturity` mediumtext NOT NULL,
  `category` mediumtext NOT NULL,
  PRIMARY KEY  (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8 ;

--END APPS------------------


--
-- Table structure for table `#__users`
-- 
DROP TABLE IF EXISTS `#__users`;
CREATE TABLE `#__users` (
  `username` mediumtext NOT NULL,
  `email` mediumtext NOT NULL,
  `password` mediumtext NOT NULL,
  `logged` tinyint(1) NOT NULL default '0',
  `ID` int(11) NOT NULL auto_increment PRIMARY KEY,
  `level` mediumtext NOT NULL
) TYPE=MyISAM CHARACTER SET `utf8` COLLATE `utf8_general_ci` AUTO_INCREMENT=1 ;


-- Registry
DROP TABLE IF EXISTS `#__registry`;
CREATE TABLE `#__registry` (
  `ID` int(11) NOT NULL auto_increment PRIMARY KEY,
  `userid` int(11) NOT NULL,
  `appid` int(20) NOT NULL,
  `name` mediumtext NOT NULL,
  `value` mediumtext NOT NULL
) TYPE=MyISAM CHARACTER SET `utf8` COLLATE `utf8_general_ci` AUTO_INCREMENT=1 ;

-- Config
DROP TABLE IF EXISTS `#__config`;
CREATE TABLE `#__config` (
  `ID` int(11) NOT NULL auto_increment PRIMARY KEY,
  `userid` int(11) NOT NULL,
  `value` mediumtext NOT NULL
) TYPE=MyISAM CHARACTER SET `utf8` COLLATE `utf8_general_ci` AUTO_INCREMENT=1 ;

--crosstalk
DROP TABLE IF EXISTS `#__crosstalk`;
CREATE TABLE `#__crosstalk` (
  `ID` int(11) NOT NULL auto_increment PRIMARY KEY,
  `userid` int(11) NOT NULL,
  `message` mediumtext NOT NULL,
  `sender` mediumtext NOT NULL,
  `appID` int(11) NOT NULL,
  `instance` int(11) NOT NULL
) TYPE=MyISAM CHARACTER SET `utf8` COLLATE `utf8_general_ci` AUTO_INCREMENT=1 ;
