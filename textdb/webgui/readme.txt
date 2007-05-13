*** english version at the bottom ***


txtDB-WebGUI V 0.4a
===================

Diese Skriptsammlung ist mein Versuch, eine Art phpMyAdmin für die Textdatenbank-API
von C-Worker zu schreiben. Look & Feel sind recht ähnlich, allerdings hinkt das WebGUI
*deutlich* bei der Funktionalität hinterher.

Zur Zeit merke ich einfach, wie ich immer mehr Schwierigkeiten habe, meinen inneren
Schweinehund zu überwinden und weiter an dem Projekt zu arbeiten. Bevor ich jetzt
komplett das interesse verliere, veröffentliche ich lieber den bisherigen Entwicklungs-
stand und überlasse es der motivierten Community, dieses Tol zur Perfektion zu bringen :)
Ich muss weiterhin zu meiner Schande gestehen, dass ich nicht einmal eine rudimentäre
Dokumentation zustande gebracht habe und ich jetzt einfach hoffe, dass die WebGUI sehr
einfach und intuitiv zu bedienen ist. Wenigstens ist das Configfile kommentiert :/

Vielen Dank an dieser Stelle an C-Worker, seine API ist wirklich grossartig. Auch die
Leute, die ihm Feedback und Codesnippets zugesandt haben, haben dazu beigetragen.


Installation
------------

Entpackt einfach das komplette Zip in einen Ordner in eurem HTDocs-Verzeichnis, so
dass ihr über euren Webserver die Skripte aufrufen könnt.
Danach editiert ihr noch die Datei "config.inc.php" und passt dort den $api_path an.
Benutzt dabei am einfachsten relative Pfadangaben und denkt an den Slash/Doppelbackslash
am Ende!

Der Rest der Konfigurationsdatei kann unangetastet bleiben, ihr könnt dort sonst nur
noch Styleangaben oder Templatepfade ändern. Diese Version kommt mit 3 Templates, 2
deutschsprachigen und einem englischsprachigen. Das Template kann beliebig durch an-
klicken gewechselt werden, allerdings landet man danach immer auf der Startseite der 
GUI.

Da diese Version ausserdem die Funktionen der "phpSecurePages" nutzt, um eine Anmeldung
zu erzwingen, bevor die GUI ausgeführt wird, muss auch noch die Datei "secure.php" im
Unterordner "phpSecurePages" editiert werden, es geht lediglich um die Variablen unter
der Zeile "/****** Data ******/", um Benutzernamen und Passwort festzulegen.
Per Default meldet man sich als "Admin" mit dem Passwort "root" an.

Einschränkungen bei der Benutzung
---------------------------------

Grundsätzlich gilt: alles, was man per Button oder Link anstellen kann, funktioniert auch!
Was fehlt, ist zum Beispiel in der Eigenschaften-Ansicht der Tabellen die Möglichkeit,
einzelne Felder zu ändern oder zu löschen.
Der Code sollte flexibel genug sein, um ein paar der Fähigkeiten der neueren txtDB-API
Versionen zu nutzen. Davon muss man allerdings nicht unbedingt etwas im WebGUI sehen.
Zum Beispiel wird LIMIT in den SELECTs unterstützt, aber die Seite, die das Ergebnis
eines solchen Queries zeigt, bietet einem keinerlei Navigationshilfen, um "weiterzu-
blättern", wie man das von phpMyAdmin gewöhnt ist.
Wenn ihr bei eurer Arbeit mit dem WebGUI an eine solche Hürde stosst, versucht die SQL-
Box. Sie kann auch mehrere Queries in einem Rutsch abarbeiten, sogar mehrere getrennte
SELECTS können zusammen abgesetzt werden.
Wundert euch im Code nicht darüber, dass ein- und dieselbe Aktion mehrfach Ansätze haben
kann. Die ersten Versionen der API konnten zB keine Datenbanken und Tabellen auflisten,
weshalb solche Funktionen auf Dateiebene realisiert wurden. Das funktioniert selbstver-
ständlich auch mit neueren Versionen der API problemlos, aber ich wollte halt weg von
den Workarounds und hin zu einer Lösung, die komplett auf die API vertraut.
Basis für solche Codeverzweigungen ist die Funktion "min_version($minimaleVersion)",
die ich allerdings nicht ausreichend getestet habe. Also hier nocheinmal deutlich:
der Status des WebGUIs ist BETA! Es hat für meine Belange funktioniert, aber ich habe 
nichts davon ausgiebig getestet oder testen lassen, ihr bekommt den Code "as is".


laienhafter Disclaimer
----------------------

Diese Skripte können Daten verändern und löschen, deshalb ist jeder User selbst zur 
Vorsicht ermahnt und die Benutzung erfolgt ausdrücklich auf eigene Gefahr. Es stand nie
in meiner Absicht, schädlichen Code zu schreiben, der Zweck dieser Skriptsammlung besteht
in der Administration einer Datenbank auf Textbasis. Ich hafte daher nicht für Schädern,
die irgendwer irgendwie mit meinem Produkt irgendwem zugefügt hat.
Ich übergebe meine Skripte der Öffentlichkeit, jedem steht es frei
nach Belieben Änderungen an den Quellen vorzunehmen. Ich bitte lediglich darum, weiterhin
als Autor genannt zu werden.


Links
-----

http://www.c-worker.ch
Homepage des Autors der Textdatenbank-API. Die WebGUI wurde entwickelt, um mit dieser API
eingesetzt zu werden.

iq.gobo@gmx.net
Meine Email. Mailt mir ruhig bei Fragen und Problemen. Ich kann allerdings keine *schnelle*
Hilfe garantieren.


*** english version ***


txtDB-WebGUI V 0.4a
===================

With this collection of scripts I try to create a clone of phpMyAdmin for the textfile database
API by C-Worker. The "look & feel2 fits quite nicely, but this WebGUI is *seriously* lacking 
features compared to "the real thing".

I somehow lost enthusiasm for the project and decided to throw the finished parts of it in 
front of the community for them to pick it up and bring it to perfection ;)
Keep in mind that there's no real documentation ( I was to lame to do it before I gave up) for
this code and I didn't bless it with much comments either. I just hope it will be intuitive 
enough for everyone to get started.

My thanks to C-Worker for his great API and all the people that contributed to it.


Installation
------------

Just unzip this whole ZIP into your servers HTDocs-directory (webroot). Then edit $api_path in
"config.inc.php" as stated there (Yeah, at least some things are commented ;) ). Use double
backslashes (when running under windows) and relative directories here, it will save you some 
troubles. 
You can leave all other variables as they are. They are just for changing styles and modifying
the available templates to list. The default points to the three provided templates, 2 german
and an english one. You can switch templates as you like in the GUI, but you'll be presented 
with the welcome message and not the page you were viewing before the switch.

Because of this version offering a secure login by phpSecurePages, you have to edit the file 
"secure.php" in subfolder "phpSecurePages". Just change the few variables below the line
"/****** Data ******/" to read your prefered login name and password.
The default comes with username set to "Admin" using password "root".


Limitations
-----------

As a rule of thumb, everything that is clickable is working! But you can't yet edit fields or 
delete them for example.
The code grew with the expanding set of features the API was providing, that's why there are 
alternate parts in the code that really do the same. Just one time it is done "on foot"
whereas the other way is making use of SQL-Queries. And there are also features the API gives 
to you that lack implementation in the GUI. For example, you can fire a SELECT with a LIMIT
by using the SQL-box and it will just work like you'd have expected. But the page displaying 
the result has no means of pageing through the data as phpMyAdmin does provide.
Whatever you do, keep in mind that this version of the GUI is still called BETA (even worse, 
this here is an alpha release;) ). It happened to work for me, but I did not thoroughly test
it. Everything is provided "as is".


lame disclaimer
---------------

This collection of scripts has the power to alter and even delete data! It has never been my 
intention to write malicious code, but be warned: do your own backups. I am not responsible 
for any damage done anyhow to anyone or anything by using my scripts.
The code for these is public, go ahead and make your modifications. I just demand to be 
mentioned as the author in any future version.


Links
-----

http://www.c-worker.ch
Homepage of the author of the text database API. The WebGUI has been developed to compliment
the usage of this engine.

mailto:iq.gobo@gmx.net
My email address. Don't hesitate to mail me about anything relating the WebGUI, but don't 
expect a *quick* reply...