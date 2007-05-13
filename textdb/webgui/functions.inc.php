<?php
function gettemplate($template,$endung="html") {
        global $templatefolder;
        return str_replace("\"","\\\"",implode("",file($templatefolder."/".$template.".".$endung)));
}

function dooutput($template) {
        global $bgcolor, $bgcolornavi, $bgcolormain, $tablebg, $tablea, $tableb, $tablec, $font, $fontcolor, $fontcolorwarn;
        
        $template = str_replace("{pagebgcolor}","$bgcolor",$template);
	$template = str_replace("{navibgcolor}","$bgcolornavi",$template);
	$template = str_replace("{mainbgcolor}","$bgcolormain",$template);
        $template = str_replace("{tablebordercolor}","$tablebg",$template);
        $template = str_replace("{tablea}","$tablea",$template);
        $template = str_replace("{tableb}","$tableb",$template);
        $template = str_replace("{tablec}","$tablec",$template);
        $template = str_replace("{font}","$font",$template);
        $template = str_replace("{fontcolor}","$fontcolor",$template);
        $template = str_replace("{fontcolorwarn}","$fontcolorwarn",$template);

        echo $template;
}

function create_database ($db_name) {
	global $DB_DIR, $gui_message;

	$mkdir = $DB_DIR . $db_name;
	if (mkdir($mkdir, 0777)) {
		eval ("\$gui_message .= \"".gettemplate("create_db_success")."\";");
		return true;
	} else {
		eval ("\$gui_message .= \"".gettemplate("create_db_failure")."\";");
		return false;
	}
}

function nextPhase ($phase) {
	switch ($phase) {
		case "{tablea}": $phase = "{tableb}"; break;
		case "{tableb}": $phase = "{tablea}"; break;
	}
	return $phase;
}

function splitSql ($sql) {
	$sql_statements = array();
	$inQuotes=false;
	$element="";
		
	// handles \ escape Chars
	$lastWasEscapeChar=false;
		
	for($i=0;$i<strlen($sql);$i++) {
		$c=$sql{$i};
		switch($c) {
			case "\\":
				if($lastWasEscapeChar) {
					$lastWasEscapeChar=false;
				} else {
					$lastWasEscapeChar=true;
				}
				$element.= $c;
			break;
			case "'":
			case "\"":
				if(!$lastWasEscapeChar) $inQuotes=(!$inQuotes);
				$element.= $c;
			break;
			case ";":
				if ($inQuotes) {
					$element.= $c;
				} else {
					$sql_statements[] = $element;
					$element = "";
				}
			break;
			default:
				$element.= $c;
			break;
		}
	}
	
	if ($element != "") $sql_statements[] = $element;

	return $sql_statements;
}

function min_version($min_version) {
// checks whether the API version in use is either the same or greater than $min_version
  $api_version = txtdbapi_version();
 
  $api_chunks = split(".", $api_version);
  $min_chunks = split(".", $min_version);
  
  if ($api_chunks[0] >= $min_chunks[0] AND $api_chunks[1] >= $min_chunks[1] AND $api_chunks[2] >= $min_chunks[2])
    return true;
  
  return false;  
}
?>