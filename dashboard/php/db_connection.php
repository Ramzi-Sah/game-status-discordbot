<?php
    include("db_config.php");

    try {
        $bdd = new PDO('mysql:host='.$db_hostname.';dbname='.$db_name.';charset=utf8', $db_Username, $db_Password);
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
    } catch (Exception $e) {
        die('fatal error : ' . $e->getMessage());
    };
?>