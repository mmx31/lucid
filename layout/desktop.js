/*******************************************\
|       Psych Desktop Main Script           |
|        (c) 2006 Psych Designs             |
\*******************************************/

setup();
drawscreen();




function setup()
{
//this will setup all the vars that need to be set up.

//menu variable
var menuopen=0;
//this sets the menu contents
var description=new Array();
description[0]="<?php include 'http://desktop.psychdesigns.net/javascript/menu.php'; ?>";
//fetches the data from the database
getbaseinfo();

//setup is complete.
}

function getbaseinfo()
{
//this will get all the info from the database.

}

function drawscreen()
{


}

