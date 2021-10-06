<?php
    include("config.php");

    $verification = getallheaders()["Authorization"];
    if ($verification === DBL_AUTH_VALUE) {
        // parse data
        $dbl_data = json_decode(file_get_contents('php://input'));

        // $fp = fopen(__DIR__ . '/../votes.txt', 'a');
        // fwrite($fp, json_decode(file_get_contents('php://input')) . "\n");
        // fclose($fp);

        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/webhook/vote");

        $data = array(
            'bot' => $dbl_data->bot,
            'user' => $dbl_data->user,
            'type' => $dbl_data->type,
            'query' => $dbl_data->query,
            'isWeekend' => $dbl_data->isWeekend
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);
        curl_close($ch);

        echo "thank you dbl.";
    };
?>