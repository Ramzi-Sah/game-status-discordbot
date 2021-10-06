<?php
    print_r($_POST);

    $args = 
    "token:'" . $_POST["botToken"] . "' " . 
    "channelId:'" . $_POST["channelId"] . "' " .
    "host:'" . $_POST["host"] . "' " .
    "port:'" . $_POST["port"] . "' " .
    "game:'" . $_POST["game"] . "' " ;
    
    $ret = exec("node generate/ 2>&1 " . $args, $out, $err);

    echo implode("\n", $out);
?>