<?php
// Datenbank: Pfad zur "txt-db-api.php"
// path to your "txt-db-api.php"
$txtdbapi = "../txt-db-api.php";

// Templateengine: 
// Pfad des zu benutzenden Templateordners
// path of the default template
$templatefolder = "templates/en_default";

// Array von moeglichen Template-Alternativen fuer den User
// Startet immer mit Index NULL!
// array of alternative templates the user can choose
// starts with index ZERO!
$templates[0]['path'] = "templates/en_default";
$templates[0]['desc'] = "english version";

$templates[1]['path'] = "templates/de_default";
$templates[1]['desc'] = "deutsche Version";

$templates[2]['path'] = "templates/de_beate76";
$templates[2]['desc'] = "Beate76 (deutsch)";

/////////////////
// Style-Angaben:

// Hintergrundfarbe des Dokumentes
// backgroundcolor of the whole page
$bgcolor = "#F5F5F5";
// Hintergrundfarbe der Navigation/Datenbankliste
// color for the background of the navigational bar with db list
$bgcolornavi = "#D0DCE0";
// Hintergrundfarbe der Hauptansicht
// backgroundcolor for the main part of the page
$bgcolormain = "#F5F5F5";
// "Rahmenfarbe" der Tabellen
// tables borders are colored in that way
$tablebg = "#F5F5F5";
// Tabellenhintergrundfarbe "a", zB für Zeilen mit ungerader Nummer
// first alternating backgroundcolor for rows in tables
$tablea = "#DDDDDD";
// Tabellenhintergrundfarbe "b", zB für Zeilen mit gerader Nummer
// second alternating backgroundcolor for rows in tables
$tableb = "#CCCCCC";
// Tabellenhintergrundfarbe "c", meist für Tabellenköpfe
// third alternating backgroundcolor for rows in tables, mostly used in headers
$tablec = "#D0DCE0";
// Schriftart(en)
// font(s) to use
$font = "helvetica, arial, geneva, sans-serif;";
// Schriftfarbe für normalen Text
// ordinary font color
$fontcolor = "#000000";
// Schriftfarbe für Warnungen und Hinweise
// color for important Messages like warnings
$fontcolorwarn = "#ff0000";

$txtdb_WEBGUI_version = "0.4a";

/* changes made by beate from the forums
// Aenderungen von Beate

// Hintergrundfarbe des Dokumentes
$bgcolor = "#F5F5F5";
// Hintergrundfarbe der Navigation/Datenbankliste
$bgcolornavi = "#D0DCE0";
// Hintergrundfarbe der Hauptansicht
$bgcolormain = "#F5F5F5";
// "Rahmenfarbe" der Tabellen
$tablebg = "#F5F5F5";
// Tabellenhintergrundfarbe "a", zB für Zeilen mit ungerader Nummer
$tablea = "#DDDDDD";
// Tabellenhintergrundfarbe "b", zB für Zeilen mit gerader Nummer
$tableb = "#CCCCCC";
// Tabellenhintergrundfarbe "c", meist für Tabellenköpfe
$tablec = "#D0DCE0";
// Schriftart(en)
$font = "helvetica, arial, geneva, sans-serif;";
// Schriftfarbe für normalen Text
$fontcolor = "#000000";
// Schriftfarbe für Warnungen und Hinweise
$fontcolorwarn = "#ff0000";

*/
?>