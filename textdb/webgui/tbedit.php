<?php 

include("../txt-db-api.php"); 

include("protect.php");

echo "<font face='Verdana, Arial'>";
// magic quotes
echo "<b>magic_quotes_gpc:</b> " .get_magic_quotes_gpc() . "<br>";

// version 
echo "<b>text-db-api version:</b> " . txtdbapi_version() . "<br>"; 


// table file 
if(isset($_GET['table_file']) && $_GET['table_file']) { 
    $table_file=$_GET['table_file']; 
    $_SESSION['table_file']=$table_file; 
    $_SESSION['mode']='edit_table'; 
} else if(isset($_SESSION['table_file'])) { 
    $table_file=$_SESSION['table_file']; 
} else { 
    $table_file="<none>"; 
} 
echo "<b>table_file:</b> " . $table_file . "<br>"; 


// mode 
if(isset($_POST['mode'])) { 
    $mode=$_POST['mode']; 
    $_SESSION['mode']=$mode; 
} else if(!isset($_SESSION['mode'])) { 
    $mode='choose_table'; 
    $_SESSION['mode']=$mode; 
} else { 
    $mode=$_SESSION['mode']; 
} 
echo "<b>mode:</b> " . $mode . "<br>"; 

// choose_table 
if($mode=='choose_table') { 
    if(isset($_GET['choose_dir'])) { 
        $choose_dir=(sec_stripslashes($_GET['choose_dir'])); 
    } else if(isset($_SESSION['choose_dir'])) { 
        $choose_dir=$_SESSION['choose_dir']; 
    } else { 
        $choose_dir=$DB_DIR; 
    } 
    $_SESSION['choose_dir']= $choose_dir; 
    
  
    
    if(isset($_GET['delete_table'])) { 
        unlink($_GET['delete_table']); 
    } 
    if(isset($_GET['rename_table'])) { 
        if(isset($_GET['new_name'])) { 
            rename($choose_dir . "/" . $_GET['rename_table'],$choose_dir . "/" . $_GET['new_name']); 
        } else { 
            echo "\n<form name=\"form_ren\" method=\"get\" action=\"" . $_SERVER['PHP_SELF']  . "\">\n"; 
            echo "<input name='new_name' type='text' id='new_name' value='" . $_GET['rename_table'] . "'>\n"; 
            echo "<input type='hidden' name='rename_table' value='" . $_GET['rename_table'] ."'>"; 
            echo "<input type='submit' name='submit' value='Rename'>"; 
            echo "</from>"; 
            echo "<br>"; 
        } 
    } 
    
    if(isset($_GET['copy_table'])) { 
        if(isset($_GET['new_name'])) { 
            copy($choose_dir . "/" . $_GET['copy_table'],$choose_dir . "/" . $_GET['new_name']); 
        } else { 
            echo "\n<form name=\"form_ren\" method=\"get\" action=\"" . $_SERVER['PHP_SELF']  . "\">\n"; 
            echo "<input name='new_name' type='text' id='new_name' value='" . $_GET['copy_table'] . "'>\n"; 
            echo "<input type='hidden' name='copy_table' value='" . $_GET['copy_table'] ."'>"; 
            echo "<input type='submit' name='submit' value='Copy'>"; 
            echo "</from>"; 
            echo "<br>"; 
        } 
    } 
    
    if(isset($_GET['create_table'])) { 
        if(isset($_GET['new_name'])) { 
        	$fd=fopen($choose_dir . "/" . $_GET['new_name'],"wb");
        	fputs($fd,"column1\nstr\ndef-val\n");
        	fclose($fd);
        } else { 
            echo "\n<form name=\"form_create\" method=\"get\" action=\"" . $_SERVER['PHP_SELF']  . "\">\n"; 
            echo "<input name='new_name' type='text' id='new_name' value='newtable.txt'>\n"; 
            echo "<input type='hidden' name='create_table' value='" . $_GET['create_table'] ."'>"; 
            echo "<input type='submit' name='submit' value='Create'>"; 
            echo "</from>"; 
            echo "<br>"; 
        } 
    } 
    
    echo "<br><b>[<a href='" . $_SERVER['PHP_SELF'] . "?choose_dir=$DB_DIR'>Reset directory to DB_DIR: $DB_DIR</a>]</b> ";
    echo "<b>[<a href='" . $_SERVER['PHP_SELF'] . "?create_table=1'>Create Table</a>]</b> ";
    echo "<b>[<a href='" . $_SERVER['PHP_SELF'] . "?logout=1'>Logout</a>]</b>";
    echo "<br><br>"; 
    $handle=opendir ($choose_dir); 
    while ($file = readdir ($handle)) { 
        if($file == ".") 
            continue; 
        if(is_dir($choose_dir . "/" . $file)) { 
            echo "<b><a href='" . $_SERVER['PHP_SELF'] . "?choose_dir=" . $choose_dir . "/" . $file . "'>$file</a></b><br>\n"; 
        }else if (is_file($choose_dir . "/" . $file) && strlen($file)>4 && strtolower(substr($file, strlen($file)-4))==".txt") { 
            echo "<a href='" . $_SERVER['PHP_SELF'] . "?table_file=" . $choose_dir . "/" . $file . "'>$file</a>"; 
            echo "&nbsp;&nbsp;&nbsp;&nbsp;[<a href='" . $_SERVER['PHP_SELF'] . "?delete_table=" . $choose_dir . "/" . $file ."'>delete</a>]\n"; 
            echo "&nbsp;[<a href='" . $_SERVER['PHP_SELF'] . "?rename_table=" . $file ."'>rename</a>]\n"; 
            echo "&nbsp;[<a href='" . $_SERVER['PHP_SELF'] . "?copy_table=" . $file ."'>copy</a>]<br>\n"; 
        } 
    
    } 
    closedir($handle); 
?> 


<?php 
} else if($mode=='edit_table') { 
    
    echo "\n<form name=\"form2\" method=\"post\" action=\"" . $_SERVER['PHP_SELF']  . "\">\n"; 
    
    echo "<input type='submit' name='submit' value='Save Table'>"; 
    echo "<input type='submit' name='close_table' value='Save and Close Table'>"; 
    echo "<input type='submit' name='abort' value='Abort'>"; 
    echo "<input type='submit' name='append_row' value='Append Row'>"; 
    echo "<br>"; 
    echo "<input type='hidden' name='mode' value='save_table'>"; 
    $fd=fopen($table_file,"rb"); 
    $rp= new ResultSetParser(); 
    $rs=$rp->parseResultSetFromFile($fd); 
    fclose($fd); 
    $colCount=$rs->getRowSize(); 
    $rowCount=$rs->getRowCount(); 
    
    echo "<input type='hidden' name='colCount' value='$colCount'>"; 
    echo "<input type='hidden' name='rowCount' value='$rowCount'>"; 
    
    $rs->reset(); 
    echo "<br><table border='1'>\n"; 
    
    // col names 
    echo "<tr>\n<td><b>Column names:</b></td>\n"; 
    $names=$rs->getColumnNames(); 
    $colPos=-1; 
    foreach($names as $n) { 
        ++$colPos; 
        echo "<td><input name='colName[]' type='text' id='colName[]' value='" . prep_val_show($n) . "'>"; 
        echo "<input type='submit' name='dupCol$colPos' value='Dup'>"; 
        echo "<input type='submit' name='delCol$colPos' value='X'>"; 
        echo "</td>\n"; 
    } 
    echo "</tr>\n"; 
    
    // col types 
    echo "<tr>\n<td><b>Column types:</b></td>\n"; 
    $types=$rs->getColumnTypes(); 
    foreach($types as $t) { 
        echo "<td><input name='colType[]' type='text' id='colType[]' value='" . prep_val_show($t) . "'></td>\n"; 
    } 
    echo "</tr>\n"; 
    
    // col default values 
    echo "<tr>\n<td><b>Column default values:</b></td>\n"; 
    $defvals=$rs->getColumnDefaultValues(); 
    foreach($defvals as $d) { 
        echo "<td><input name='colDefVal[]' type='text' id='colDefVal[]' value='" . prep_val_show($d) . "'></td>\n"; 
    } 
    echo "</tr>\n"; 
    
    echo "<tr>";    
     echo "<td>&nbsp;</td>"; 
    foreach($names as $n) { 
        echo "<td>&nbsp;</td>"; 
    } 
    echo "</tr>"; 

    
    while($rs->next()) { 
        $pos=$rs->getPos(); 
        echo "<tr>\n<td><b>Row " . $pos . ":</b></td>\n"; 
        $vals=$rs->getCurrentValues(); 
        $i=-1; 
        foreach($vals as $val) { 
            ++$i; 
            echo "<td><textarea name='vals[$pos][]'>" . prep_val_show($val) . "</textarea>"; 
            if ($i==count($vals)-1) { 
                echo "<input type='submit' name='dup$pos' value='Dup'>"; 
                echo "<input type='submit' name='delete$pos' value='X'>"; 
            } 
            
            echo "</td>\n"; 
        } 
        echo "</tr>\n"; 
    } 
    
    // append 
        
    echo "</table>\n"; 
    echo "<br>"; 
    echo "<input type='submit' name='submit' value='Save Table'>"; 
    echo "<input type='submit' name='close_table' value='Save and Close Table'>"; 
    echo "<input type='submit' name='abort' value='Abort'>"; 
    echo "<input type='submit' name='append_row' value='Append Row'>"; 
    echo "</form>"; 


} else if($mode=='save_table') { 
    
    echo "<br>"; 
    $rs=new ResultSet(); 
    $colName=$_POST['colName']; 
    $colType=$_POST['colType']; 
    $colDefVal=$_POST['colDefVal']; 
    if(isset($_POST['vals'])) 
        $vals=$_POST['vals']; 
    $rowCount=$_POST['rowCount']; 
    $colCount=$_POST['colCount']; 
    
    if(isset($_POST['abort'])) { 
        echo "<br>"; 
        echo "Aborted, klick <a href='" . $_SERVER['PHP_SELF'] . "'> here </a> to continue"; 
        $_SESSION['mode']='choose_table'; 
        unset($_SESSION['table_file']); 
        echo "<meta http-equiv='refresh' content='0;URL=". $_SERVER['PHP_SELF'] ."'>"; 
        exit(); 
    } 
        
    $rs->setColumnNames(prep_val_save_arr($colName)); 
    $rs->setColumnTypes(prep_val_save_arr($colType)); 
    $rs->setColumnDefaultValues(prep_val_save_arr($colDefVal)); 
    
	$rs->setColumnAliases(create_array_fill(count($rs->colNames),"")); 
	$rs->setColumnTables(create_array_fill(count($rs->colNames),"")); 
	$rs->setColumnTableAliases(create_array_fill(count($rs->colNames),"")); 
	$rs->setColumnFunctions(create_array_fill(count($rs->colNames),"")); 
	$rs->colFuncsExecuted=create_array_fill(count($rs->colNames),false); 
    
    
    $rowsSaved=0; 
    for($i=0;$i<$rowCount;++$i) { 
        if(isset($_POST['delete' . $i])) { 
            echo "Row $i deleted!<br>"; 
        } else {    
            if(isset($_POST['dup' . $i])) { 
                echo "Row $i duplicated!<br>"; 
                $rowsSaved++; 
                $rs->appendRow(prep_val_save_arr($vals[$i])); 
            } 
            $rowsSaved++; 
            $rs->appendRow(prep_val_save_arr($vals[$i])); 
        } 
    } 
    
    echo "$rowsSaved Rows saved!<br>"; 
    
    
    if(isset($_POST['append_row'])) { 
        $rs->append(); 
        echo "1 Row appended!<br>"; 
    } 
    echo "colCount: $colCount<br>";
    for($i=0;$i<$colCount;++$i) { 
        if(isset($_POST['dupCol' . $i])) { 
            $rs->duplicateColumn($i); 
            echo "Column $i duplicated!<br>"; 
        } 
    } 
    
    for($i=0;$i<$colCount;++$i) { 
        if(isset($_POST['delCol' . $i])) { 
            $rs->removeColumn($i); 
            echo "Column $i deleted!<br>"; 
        } 
    } 
    
    $fd=fopen($table_file,"wb"); 
    $rp= new ResultSetParser(); 
    $rp->parseResultSetIntoFile($fd,$rs); 
    fclose($fd); 
    
    if(isset($_POST['close_table'])) { 
        echo "<br>"; 
        echo "Table saved and closed, klick <a href='" . $_SERVER['PHP_SELF'] . "'> here </a> to continue"; 
        $_SESSION['mode']='choose_table'; 
        unset($_SESSION['table_file']); 
        echo "<meta http-equiv='refresh' content='1;URL=". $_SERVER['PHP_SELF'] ."'>"; 
        
    } else { 
        $_SESSION['mode']='edit_table'; 
        echo "<br>"; 
        echo "Table saved, klick <a href='" . $_SERVER['PHP_SELF'] . "'> here </a> to continue"; 
        echo "<meta http-equiv='refresh' content='1;URL=". $_SERVER['PHP_SELF'] ."'>"; 
    } 
} 


function prep_val_show($val) { 
    if($val=="") return ""; 
    return htmlentities($val); 
} 

function prep_val_save($val) { 
    if($val=="") return ""; 
    return html_decode($val);
} 

function prep_val_save_arr($arr) { 
    $out=array(); 
    for($i=0;$i<count($arr);++$i) { 
        $out[$i]=prep_val_save($arr[$i]); 
    } 
    return $out; 
} 

function html_decode($string) { 
   $string = strtr($string, array_flip(get_html_translation_table(HTML_ENTITIES))); 
   $string = preg_replace("/&#([0-9]+);/me", "chr('\\1')", $string); 
   $string=sec_stripslashes($string); 
   return $string;
}

function sec_stripslashes($str) {
	if(get_magic_quotes_gpc()) {
		return stripslashes($str);
	}
	return $str;
}


?>
