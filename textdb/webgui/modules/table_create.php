<?php
$phase = "{tablea}";
$tbl_list_fields = "";
$gui_message2 = "";

for ($i = 1; $i <= $_POST['new_table_numf']; $i++) {
	$fieldname = "fname".$i;
	$typename = "tname".$i;
	eval ("\$tbl_list_fields .= \"".gettemplate("table_create_bit")."\";");
	$phase = nextPhase($phase);
}

eval("dooutput(\"".gettemplate("table_create")."\");");
?>