<?php
    $webPanel = 'http://localhost/web/StatusBot/';

    define('OAUTH2_CLIENT_ID', '');
    define('OAUTH2_CLIENT_SECRET', '');
    define('BOT_PERMISSION_VALUE', '93248');

    $hert_beat_time = 5;

    $botHost = 'localhost';
    $botAPIPort = 2727;

    define('DBL_AUTH_VALUE', '');

    $supportDiscordServerLink = 'https://discord.gg/vsw2ecxYnH';
 
    // language -----------------------------------------------------------------------
    $supportedLanguages = array(
        "AR" => array("عربى", false),
        "CN" => array("中文", false),
		"DE" => array("Deutsch", true),
        "EN" => array("English", true),
        "ES" => array("Español", true),
        "FR" => array("Français", true),
        // "IN" => array("हिंदी", false),
        "IT" => array("Italiano", true),
        "PL" => array("Polski", true),
        "RU" => array("русский", true),
        "SW" => array("Svenska", true),
        "TR" => array("Türk", false)
    );

    // donations ----------------------------------------------------------------------
    $points_prices = [[3.00, 100], [5.00, 200], [10.00, 500], [500.00, 9999]];


    $paypal_debug = false;
    $paypal_email_debug = "sb-cuqfw1281561@business.example.com"; // FR account, DZ does not work :(

    $paypal_email = "ramzifouadsaheb@google.com";
?>
