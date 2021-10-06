<?php
    include("./config.php");

    if (isset($_GET["lang"]) && array_key_exists($_GET["lang"], $supportedLanguages)) {
        setcookie('lang', $_GET["lang"], 2147483647, '/');
        header('Location: ' . $webPanel . 'dashboard');
    } else {
        setcookie('lang', "EN", 2147483647, '/');
        header('Location: ' . $webPanel);
    };
?>