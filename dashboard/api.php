<?php
    include("php/config.php");
    include("php/db_connection.php");
    
    if (isset($_GET["botStatus"])) {
        $reponse= $bdd->prepare("SELECT status FROM bot");
        $reponse->execute();
        echo "{\"heartbeat\":" . $reponse->fetch()[0] . "}";
    };

    if (isset($_GET["getGuild"])) {
        if (!empty($_GET["getGuild"])) {

            if (!preg_match('/^[0-9]*$/', $_GET["getGuild"])) {
                // get user data
                echo "{\"error\": \"not valid server id\"}";
                die();
            };

            // send request to bot's api
            $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/guild/getChannels");

            $data = array(
                'guildId' => $_GET["getGuild"]
            );

            curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            curl_setopt($ch, CURLINFO_HEADER_OUT, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

            $response = curl_exec($ch);

            curl_close($ch);

            echo $response;
        };
    };
?>