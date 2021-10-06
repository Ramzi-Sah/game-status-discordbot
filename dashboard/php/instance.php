<?php
    include("../php/config.php");
    include("../php/db_connection.php");

    session_start();

    // check if user connected
    if(!isset($_COOKIE['access_token'])) {
        // user is not connected
        header('Location: ' . $webPanel . '?error=3');
        die();
    };

    // check if have user data
    if (!isset($_SESSION['user_id'])) {
        // get user data
        header('Location: ' . $webPanel . 'php/discord.php?getUser');
        die();
    };

    // check if have user servers
    if (!isset($_SESSION["user_servers"])) {
        // get user servers
        header('Location: ' . $webPanel . 'php/discord.php?getServers');
        die();
    };

    // get bot servers
    $user_guild_ids = array();
    for ($i = 0; $i < count($_SESSION["user_servers"]); $i++) {
        array_push($user_guild_ids, $_SESSION["user_servers"][$i]["id"]);
    };

    $reponse = $bdd->query("SELECT guild_id FROM guilds");
    $reponse = $reponse->fetchAll();

    $bot_guild_ids = array();
    foreach ($reponse as $server) {
        array_push($bot_guild_ids, $server['guild_id']);
    };

    // check if server id is set
    if (!isset($_POST["serverid"]) || !preg_match('/^[0-9]*$/', $_POST["serverid"])) {
        // get user data
        header('Location: ' . $webPanel . 'dashboard');
        die();
    };

    // check if bot is in server
    if (!in_array($_POST["serverid"], $bot_guild_ids)) {
        echo "the bot is not in this server.";
        die();
    };

    // check if server is in user servers
    if (!in_array($_POST["serverid"], $user_guild_ids)) {
        echo "you do not have permission to edit this server config.";
        die();
    };

    // get server info
    $managedServer = array();
    foreach ($_SESSION["user_servers"] as $server) {
        if ($server["id"] == $_POST["serverid"]) {
            $managedServer = $server;
            break;
        };
    };

    // handle spam
    if (!isset($_SESSION["instance_action_delay"])) {
        $_SESSION["instance_action_delay"] = round(microtime(true) * 1000);
    } else if (round(microtime(true) * 1000) - $_SESSION["instance_action_delay"] < 1500) {
        // redirect to server.php
        header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&info=2");
        die();
    } else {
        $_SESSION["instance_action_delay"] = round(microtime(true) * 1000);
    };
    
    // handle request
    if (isset($_GET["create"])) {
        // get max instances
        // $reponse= $bdd->prepare("SELECT max_instances_nbr FROM bot");
        $reponse= $bdd->prepare("SELECT level FROM guilds WHERE guild_id = " . $managedServer["id"]);
        $reponse->execute();
        // $max_instances = (int)$reponse->fetch()[0];
        $max_instances = (int)($reponse->fetch()[0] + 1) * 3;

        // get server's instances
        $reponse = $bdd->query("SELECT instances FROM guilds WHERE guild_id = " . $managedServer["id"]);
        $reponse = $reponse->fetch();

        $nbr_instances = count(json_decode($reponse["instances"]));

        if ($nbr_instances >= $max_instances) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&info=3");
            die();
        };

        // handle instance name
        if (!isset($_POST["name"]) || empty($_POST["name"])) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=1");
            die();
        };

        if (!preg_match('/^[A-Za-z0-9-_".,\s]+$/', $_POST["name"]) || strlen($_POST["name"]) > 30) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=1");
            die();
        };

        $instance_name = trim($_POST["name"]);

        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/create");

        $data = array(
            'instance_name' => $instance_name,
            'instance_server' => $managedServer["id"]
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(2);

        // redirect to server.php
        header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"]);
        die();

    } else if (isset($_GET["delete"])) {
        if (!isset($_POST["instanceid"]) || empty($_POST["instanceid"])) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=2");
            die();
        };

        if (!preg_match('/^[A-Za-z0-9",\s]+$/', $_POST["instanceid"]) || strlen($_POST["instanceid"]) > 20) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=2");
            die();
        };

        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/delete");

        $data = array(
            'instance_server' => $managedServer["id"],
            'instance_id' => $_POST["instanceid"]
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(1);

        // redirect to server.php
        header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"]);
        die();

    } else if (isset($_GET["upgrade"])) {
        // echo  $_SESSION['user_id'] . " requested an upgrade for " . $managedServer["id"];

        // get server level and points
        $reponse = $bdd->query("SELECT level, points FROM guilds WHERE guild_id = " . $managedServer["id"]);
        $reponse = $reponse->fetchAll();
        
        $guild_level = $reponse[0][0] + 1;
        $guild_points = $reponse[0][1];

        // check if has enough points
        if ($guild_points < 50) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=3");
            die();    
        };

        // upgrade teh server and deduce points from the server
        $reponse= $bdd->prepare("UPDATE guilds SET level = '" . $guild_level . "', points = '" . ($guild_points - 50) . "' WHERE guild_id = '" . $managedServer["id"] . "';");
        $reponse->execute();

        header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&success=1");
        die();
    } else if (isset($_GET["transferPoints"])) {
        // echo  $_SESSION['user_id'] . " want to transfer points to " . $managedServer["id"];

        // check if points are ok
        if (!isset($_POST["nbr_points_transfer"]) || empty($_POST["nbr_points_transfer"])) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=4");
            die();
        };

        if (!preg_match('/^[0-9]*$/', $_POST["nbr_points_transfer"])) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=4");
            die();
        };

        $nbr_points_transfer = intval($_POST["nbr_points_transfer"]);

        if ($nbr_points_transfer < 0 || $nbr_points_transfer >= 1000) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=5");
            die();
        };

        // check if user has enough points
        $reponse = $bdd->query("SELECT points FROM users WHERE user_id = " . $_SESSION['user_id']);
        $user_points = $reponse->fetch()[0];

        if (!$user_points) {
            $user_points = 0;
        };

        if ($user_points < $nbr_points_transfer) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=6");
            die();
        };
        
        // deduce user points
        $reponse= $bdd->prepare("UPDATE users SET points = '" . ($user_points - $nbr_points_transfer) . "' WHERE user_id = '" . $_SESSION['user_id'] . "';");
        $reponse->execute();

        // get server points
        $reponse = $bdd->query("SELECT points FROM guilds WHERE guild_id = " . $managedServer["id"]);
        $reponse = $reponse->fetchAll();
        $guild_points = $reponse[0][0];

        // add server points
        $reponse= $bdd->prepare("UPDATE guilds SET points = '" . ($nbr_points_transfer + $guild_points) . "' WHERE guild_id = '" . $managedServer["id"] . "';");
        $reponse->execute();
		
		// log to database
		$reponse= $bdd->prepare("INSERT INTO logs (TYPE, LOG, user_id) VALUES (\"server points transfer\", \"transfered " . ($nbr_points_transfer + $guild_points) . " points to server " . $managedServer["id"] . "\", " . $_SESSION['user_id'] . ");");
        $reponse->execute();
		
        // redirect user
        header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&success=2");
        die();
    } else if (isset($_GET["edit"])) {
        // check the instance id
        if (!isset($_POST["instanceid"]) || empty($_POST["instanceid"])) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=2");
            die();
        };

        if (!preg_match('/^[A-Za-z0-9",\s]+$/', $_POST["instanceid"]) || strlen($_POST["instanceid"]) > 20) {
            header('Location: ' . $webPanel . "dashboard/server.php?id=" . $managedServer["id"] . "&error=2");
            die();
        };

        // check instance name
        if (!isset($_POST["name"]) || empty($_POST["name"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=6");
            die();
        };

        if (!preg_match('/^[A-Za-z0-9-_",\s]+$/', $_POST["name"]) || strlen($_POST["name"]) > 30) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=6");
            die();
        };

        // check the channel id
        if (!isset($_POST["channel"]) || empty($_POST["channel"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=1");
            die();
        };

        if (!preg_match('/^[0-9]*$/', $_POST["channel"]) || strlen($_POST["channel"]) > 20) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=1");
            die();
        };

        // check if channel alredy in use
        // $reponse = $bdd->query("SELECT COUNT(*) FROM instances WHERE channel = '" . $_POST["channel"] . "' AND instance_id != '" . $_POST["instanceid"] . "';");
        // $nbr_channel = $reponse->fetch();

        // if ($nbr_channel[0] != 0) {
        //     header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=14");
        //     die();
        // };

        // check the server host
        if (!isset($_POST["host"]) || empty($_POST["host"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=2");
            die();
        };

        if (!filter_var(gethostbyname($_POST["host"]), FILTER_VALIDATE_IP) || strlen($_POST["host"]) > 50) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=2");
            die();
        };

        // check ths server port
        if (!isset($_POST["port"]) || empty($_POST["port"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=3");
            die();
        };

        if (!preg_match('/^[0-9]*$/', $_POST["port"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=3");
            die();
        };

        if (intval($_POST["port"]) < 1 || intval($_POST["port"]) > 65500) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=3");
            die();
        };

        // check the game type
        if (!isset($_POST["game"]) || empty($_POST["game"]) || strlen($_POST["game"]) > 20) {
            // header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=4");
			echo "uh oh";
            die();
        };

        $reponse = $bdd->query("SELECT type FROM games");
        $reponse = $reponse->fetchAll();

        $supportedGames = array();
        foreach ($reponse as $gameType) {
            array_push($supportedGames, $gameType[0]);
        };

        if (!in_array($_POST["game"], $supportedGames)) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=4");
            die();
        };

        // check the graph option
        if (intval($_POST["graph"]) < 0 || intval($_POST["graph"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        if ($_POST["graph"] != "1") {
            $_POST["graph"] = "0";
        };
		
        // check the hide ip option
        if (intval($_POST["hide_ip"]) < 0 || intval($_POST["hide_ip"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        if ($_POST["hide_ip"] != "1") {
            $_POST["hide_ip"] = "0";
        };
		
        // check the hide port option
        if (intval($_POST["hide_port"]) < 0 || intval($_POST["hide_port"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        if ($_POST["hide_port"] != "1") {
            $_POST["hide_port"] = "0";
        };

        // check the playerlist option
        if (intval($_POST["playerlist"]) < 0 || intval($_POST["playerlist"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        if ($_POST["playerlist"] != "1") {
            $_POST["playerlist"] = "0";
        };
		
			
        // check the full playerlist option
        if (intval($_POST["full_playerlist"]) < 0 || intval($_POST["full_playerlist"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        if ($_POST["full_playerlist"] != "1") {
            $_POST["full_playerlist"] = "0";
        };

        // check the timezone option
        if (intval($_POST["timezone"]) < 0 || intval($_POST["timezone"]) > 37) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        // check the timeformat option
        if (intval($_POST["timeformat"]) < 0 || intval($_POST["timeformat"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        // check logo link
        if(!empty($_POST["logo"]) && !preg_match('/^(http|https):\\/\\/[a-z0-9_]+([\\-\\.]{1}[a-z_0-9]+)*\\.[_a-z]{2,5}'.'((:[0-9]{1,5})?\\/.*)?$/i', $_POST["logo"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=16");
            die();
        };

        // check the language option
        if (!array_key_exists($_POST["language"], $supportedLanguages)) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };
        if (!$supportedLanguages[$_POST["language"]][1]) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        // check the minimal option
        if (intval($_POST["minimal"]) < 0 || intval($_POST["minimal"]) > 1) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        if ($_POST["minimal"] != "1") {
            $_POST["minimal"] = "0";
        };

        // check the color
        if (!preg_match('/^#[0-9A-F]{6}$/i', $_POST["color"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/edit");

        $data = array(
            'guild' => trim($managedServer["id"]),
            'instance' => trim($_POST["instanceid"]),
            'name' => trim($_POST["name"]),
            'channel' => trim($_POST["channel"]),
            'host' => trim($_POST["host"]),
            'port' => trim($_POST["port"]),
            'game' => trim($_POST["game"]),

            'graph' => trim($_POST["graph"]),
            'hide_ip' => trim($_POST["hide_ip"]),
            'hide_port' => trim($_POST["hide_port"]),
            'playerlist' => trim($_POST["playerlist"]),
            'full_playerlist' => trim($_POST["full_playerlist"]),
            'logo' => $_POST["logo"],
            'language' => $_POST["language"],
            'timezone' => trim($_POST["timezone"]),
            'timeformat' => trim($_POST["timeformat"]),
            'minimal' => $_POST["minimal"],
            'color' => $_POST["color"],
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(1);

        if (empty($response)) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=5");
            die();
        };

        if ($response == "not ok.") {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=15");
            die();
        };

        header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&success=1");
        die();
    } else if (isset($_GET["start"])) {
        // get instance config
        $reponse = $bdd->query("SELECT * FROM instances WHERE instance_id = '" . $_POST["instanceid"] . "'");
        $instance = $reponse->fetch();

        // check if instance can start
        if (empty($instance["name"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=9");    
            die();
        };
        if (empty($instance["channel"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=10");
            die();
        };
        if (empty($instance["host"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=11");
            die();
        };
        if (empty($instance["port"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=12");
            die();
        };
        if (empty($instance["game"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=13");
            die();
        };

        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/start");

        $data = array(
            'guild' => trim($managedServer["id"]),
            'instance' => trim($_POST["instanceid"])
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(1);

        if (empty($response) || $response == "not ok.") {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=7");
            die();
        };

        header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&success=2");
        die();
    } else if (isset($_GET["clearGraph"])) {
        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/clearGraph");

        $data = array(
            'guild' => trim($managedServer["id"]),
            'instance' => trim($_POST["instanceid"])
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(1);

        if (empty($response) || $response == "not ok.") {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=17");
            die();
        };

        header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&success=4");
        die();
    } else if (isset($_GET["stop"])) {
        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/stop");

        $data = array(
            'guild' => trim($managedServer["id"]),
            'instance' => trim($_POST["instanceid"])
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(1);

        if (empty($response) || $response == "not ok.") {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=8");
            die();
        };

        header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&success=3");
        die();
    } else if (isset($_GET["restart"])) {
        // get instance config
        $reponse = $bdd->query("SELECT * FROM instances WHERE instance_id = '" . $_POST["instanceid"] . "'");
        $instance = $reponse->fetch();

        // check if instance can start
        if (empty($instance["name"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=9");    
            die();
        };
        if (empty($instance["channel"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=10");
            die();
        };
        if (empty($instance["host"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=11");
            die();
        };
        if (empty($instance["port"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=12");
            die();
        };
        if (empty($instance["game"])) {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=13");
            die();
        };

        // send request to bot's api
        $ch = curl_init("http://" . $botHost . ":" .  $botAPIPort . "/instance/restart");

        $data = array(
            'guild' => trim($managedServer["id"]),
            'instance' => trim($_POST["instanceid"])
        );

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        $response = curl_exec($ch);

        curl_close($ch);

        // wait for the bot to handle the request / temp fix :'(
        sleep(1);

        if (empty($response) || $response == "not ok.") {
            header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&error=8");
            die();
        };

        header('Location: ' . $webPanel . "dashboard/instance.php?id=" . $_POST["instanceid"] . "&guild=" . $managedServer["id"] . "&success=3");
        die();
    };

    // how dyou got here ?
    header('Location: ' . $webPanel . 'dashboard');
    die();
?>
