<?php
// script to add the available templates to the navigational part of the page

$list_templates = "";
$count_temp = count($templates);
for ($i = 0; $i < $count_temp; $i++) {
  $temp_path = $templates[$i]['path'];
  $temp_desc = $templates[$i]['desc'];

  eval ("\$list_templates .= \"".gettemplate("list_templates")."\";");
}
?>