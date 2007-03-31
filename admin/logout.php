<?php
setcookie("logged", "no", time()-3600);
header("Location: ./index.php");
?>