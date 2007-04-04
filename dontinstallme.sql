-- NOTE: DON'T ACTUALLY RUN THIS! THIS IS JUST FOR REFERENCE!!!

-- --------------------------------------------------------

-- 
-- Table structure for table `apps`
-- 

CREATE TABLE `apps` (
  `ID` bigint(255) NOT NULL auto_increment,
  `name` mediumtext NOT NULL,
  `author` mediumtext NOT NULL,
  `email` mediumtext NOT NULL,
  `code` longtext NOT NULL,
  `library` longtext NOT NULL,
  `version` text NOT NULL,
  `maturity` mediumtext NOT NULL,
  `category` mediumtext NOT NULL,
  PRIMARY KEY  (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

-- 
-- Dumping data for table `apps`
-- 

INSERT INTO `apps` VALUES (1, 'Calculator', 'Psychiccyberfreak', 'bj@psychdesigns.net', 'var winHTML = \\''<STYLE type=\\"text/css\\"> .calcBtn { font-weight: bold; width: 100%; height: 100%; } </style><form name=\\"calculator\\"><table border=\\"0\\" cellpadding=\\"2\\" cellspacing=\\"0\\" width=\\"100%\\" height=\\"95%\\"><tr><td colspan=\\"4\\"><input type=\\"text\\" name=\\"calcResults\\" value=\\"0\\" style=\\"text-align: right; width: 100%;\\"></td></tr><tr><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" C \\" name=\\"calclear\\" onclick=\\"gCalculator.OnClick(\\\\\\''c\\\\\\'')\\"></td><td></td><td></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" = \\" name=\\"calequal\\" onclick=\\"gCalculator.OnClick(\\\\\\''=\\\\\\'')\\"></td></tr><tr><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 7 \\" name=\\"cal7\\" onclick=\\"gCalculator.OnClick(\\\\\\''7\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''7\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 8 \\" name=\\"cal8\\" onclick=\\"gCalculator.OnClick(\\\\\\''8\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''8\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 9 \\" name=\\"cal9\\" onclick=\\"gCalculator.OnClick(\\\\\\''9\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''9\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" / \\" name=\\"caldiv\\" onclick=\\"gCalculator.OnClick(\\\\\\''/\\\\\\'')\\"></td></tr><tr><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 4 \\" name=\\"cal4\\" onclick=\\"gCalculator.OnClick(\\\\\\''4\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''4\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 5 \\" name=\\"cal5\\" onclick=\\"gCalculator.OnClick(\\\\\\''5\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''5\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 6 \\" name=\\"cal6\\" onclick=\\"gCalculator.OnClick(\\\\\\''6\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''6\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" * \\" name=\\"calmul\\" onclick=\\"gCalculator.OnClick(\\\\\\''*\\\\\\'')\\"></td></tr><tr><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 1 \\" name=\\"cal1\\" onclick=\\"gCalculator.OnClick(\\\\\\''1\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''1\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 2 \\" name=\\"cal2\\" onclick=\\"gCalculator.OnClick(\\\\\\''2\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''2\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 3 \\" name=\\"cal3\\" onclick=\\"gCalculator.OnClick(\\\\\\''3\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''3\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" + \\" name=\\"calplus\\" onclick=\\"gCalculator.OnClick(\\\\\\''+\\\\\\'')\\"></td></tr><tr><td colspan=\\"2\\"><input class=\\"calcBtn\\" type=\\"button\\" value=\\" 0 \\" name=\\"cal0\\" onclick=\\"gCalculator.OnClick(\\\\\\''0\\\\\\'')\\" ondblclick=\\"gCalculator.OnClick(\\\\\\''0\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" . \\" name=\\"caldec\\" onclick=\\"gCalculator.OnClick(\\\\\\''.\\\\\\'')\\"></td><td><input class=\\"calcBtn\\" type=\\"button\\" value=\\" - \\" name=\\"calminus\\" onclick=\\"gCalculator.OnClick(\\\\\\''-\\\\\\'')\\"></td></tr></table></form>\\'';\r\nnewWindow(\\"Calculator\\", winHTML, 190, 200);', 'function Calculator_OnClick(keyStr)\r\n{\r\nvar resultsField = document.calculator.calcResults;\r\n\r\nswitch (keyStr)\r\n{\r\ncase \\"0\\":\r\ncase \\"1\\":\r\ncase \\"2\\":\r\ncase \\"3\\":\r\ncase \\"4\\":\r\ncase \\"5\\":\r\ncase \\"6\\":\r\ncase \\"7\\":\r\ncase \\"8\\":\r\ncase \\"9\\":\r\ncase \\"0\\":\r\ncase \\".\\":\r\n\r\nif ((this.lastOp==this.opClear) || (this.lastOp==this.opOperator))\r\n{\r\nresultsField.value = keyStr;\r\n}\r\nelse\r\n{\r\n// ignore extra decimals\r\nif ((keyStr!=\\".\\") || (resultsField.value.indexOf(\\".\\")<0))\r\n{\r\nresultsField.value += keyStr;\r\n}\r\n\r\n}\r\n\r\nthis.lastOp = this.opNumber;\r\nbreak;\r\n\r\ncase \\"*\\":\r\ncase \\"/\\":\r\ncase \\"+\\":\r\ncase \\"-\\":\r\nif (this.lastOp==this.opNumber)\r\nthis.Calc();\r\nthis.evalStr += resultsField.value + keyStr;\r\n\r\nthis.lastOp = this.opOperator;\r\nbreak;\r\n\r\ncase \\"=\\":\r\nthis.Calc();\r\nthis.lastOp = this.opClear;\r\nbreak;\r\n\r\ncase \\"c\\":\r\nresultsField.value = \\"0\\";\r\nthis.lastOp = this.opClear;\r\nbreak;\r\n\r\ndefault:\r\nalert(\\"\\''\\" + keyStr + \\"\\'' not recognized.\\");\r\n}\r\n\r\n}\r\n\r\nfunction Calculator_Calc()\r\n{\r\nvar resultsField = document.calculator.calcResults;\r\n//alert(\\"eval:\\"+this.evalStr+resultsField.value);\r\nresultsField.value = eval(this.evalStr+resultsField.value);\r\nthis.evalStr = \\"\\";\r\n}\r\n\r\nfunction Calculator()\r\n{\r\nthis.evalStr = \\"\\";\r\n\r\nthis.opNumber = 0;\r\nthis.opOperator = 1;\r\nthis.opClear = 2;\r\n\r\nthis.lastOp = this.opClear;\r\n\r\nthis.OnClick = Calculator_OnClick;\r\nthis.Calc = Calculator_Calc;\r\n}\r\n\r\ngCalculator = new Calculator(); ', '1.0', 'Alpha', 'Office');
INSERT INTO `apps` VALUES (2, 'Web Browser', 'Psychiccyberfreak', 'bj@psychdesigns.net', 'var winHTML = \\''<form name=\\"submitbox\\" action=\\"#\\" onSubmit=\\"return gBrowser.Go()\\" ><input type=\\"text\\" id=\\"browserUrlBox\\" value=\\"http://www.google.com/\\" style=\\"width: 94%;\\" /><input type=\\"button\\" value=\\"Go\\" onClick=\\"gBrowser.Go()\\" style=\\"width: 6%;\\"><br /><iframe style=\\"width: 99%; height: 90%; background-color: #FFFFFF;\\" src=\\"http://www.google.com\\" id=\\"browserIframe\\" /></form>\\'';\r\nnewWindow(\\"Web Browser\\", winHTML, 500, 400);', 'function browser_Go()\r\n{\r\nurlbox = document.getElementById(\\"browserUrlBox\\");\r\nURL = urlbox.value;\r\nif(URL.charAt(4) == \\":\\" && URL.charAt(5) == \\"/\\" && URL.charAt(6) == \\"/\\")\r\n{\r\n}\r\nelse\r\n{\r\n//but wait, what if it\\''s an FTP site?\r\nif(URL.charAt(3) == \\":\\" && URL.charAt(4) == \\"/\\" && URL.charAt(5) == \\"/\\")\r\n{\r\n}\r\nelse\r\n{\r\n//if it starts with an \\"ftp.\\", it\\''s most likely an FTP site.\r\nif((URL.charAt(0) == \\"F\\" || URL.charAt(0) == \\"f\\") && (URL.charAt(1) == \\"T\\" || URL.charAt(1) == \\"t\\") && (URL.charAt(2) == \\"P\\" || URL.charAt(2) == \\"p\\") && URL.charAt(3) == \\".\\")\r\n{\r\nURL = \\"ftp://\\"+URL;\r\n}\r\nelse\r\n{\r\n//ok, it\\''s probably a plain old HTTP site...\r\nURL = \\"http://\\"+URL;\r\n}\r\n}\r\n}\r\nIframe = document.getElementById(\\"browserIframe\\");\r\nIframe.src = URL;\r\nurlbox.value = URL;\r\n\r\nreturn false;\r\n}\r\n\r\nfunction Browser()\r\n{\r\nthis.Go = browser_Go;\r\nreturn false;\r\n}\r\n\r\ngBrowser = new Browser(); ', '1.0', 'Alpha', 'Internet');
INSERT INTO `apps` VALUES (3, 'Settings', 'Psychiccyberfreak', 'bj@psychdesigns.net', 'winHTML = \\"<div padding=10>\\";\r\nwinHTML += \\"<h3>Wallpaper Background Color</h3>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''White\\'' onClick=\\''setWallpaperColor(\\\\\\"white\\\\\\")\\''>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''Black\\'' onClick=\\''setWallpaperColor(\\\\\\"black\\\\\\")\\''>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''Blue\\'' onClick=\\''setWallpaperColor(\\\\\\"blue\\\\\\")\\''>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''Red\\'' onClick=\\''setWallpaperColor(\\\\\\"red\\\\\\")\\''>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''Green\\'' onClick=\\''setWallpaperColor(\\\\\\"green\\\\\\")\\''>\\";\r\nwinHTML += \\"<h3>Wallpaper</h3>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''Blank\\'' onClick=\\''setWallpaper()\\''>\\";\r\nwinHTML += \\"<input type=\\''button\\'' value=\\''Default\\'' onClick=\\''setWallpaper(\\\\\\"./wallpaper/default.gif\\\\\\")\\''>\\";\r\nwinHTML += \\"</div>\\";\r\nnewWindow(\\"Control Panel\\", winHTML, 190, 200);', '//put your javascript library here. Don\\''t forget to make it a class!!!', '1.0', 'Beta', 'System');
INSERT INTO `apps` VALUES (4, 'Hello World', 'jaymacdonald', 'jaymac407@gmail.com', ' var winHTML = \\"<div padding=10>\\";\r\nwinHTML += \\"<h2>Hello World</h2>\\";\r\nwinHTML += \\"</div>\\";\r\nnewWindow(\\"Hello World\\", winHTML, 190, 200);', '','1.0','Alpha','System');
-- --------------------------------------------------------

-- 
-- Table structure for table `users`
-- 

CREATE TABLE `users` (
  `username` mediumtext character set ascii collate ascii_bin NOT NULL,
  `email` mediumtext character set ascii collate ascii_bin NOT NULL,
  `password` mediumtext character set ascii collate ascii_bin NOT NULL,
  `logged` tinyint(1) NOT NULL default '0',
  `ID` bigint(255) NOT NULL auto_increment,
  `level` mediumtext character set ascii collate ascii_bin NOT NULL,
  PRIMARY KEY  (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;

-- FOR A PROGRAM INSTALLER (coming soon)
CREATE TABLE `installedapps` (
  `ID` bigint(255) NOT NULL auto_increment,
  `username` mediumtext character set ascii collate ascii_bin NOT NULL,
  `appid` bigint(255) NOT NULL,
  PRIMARY KEY  (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;