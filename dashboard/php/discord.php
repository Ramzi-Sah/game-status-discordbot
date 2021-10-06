<?php
    include("config.php");
    include("db_connection.php");

    $authorizeURL = 'https://discord.com/api/oauth2/authorize';
    $tokenURL = 'https://discord.com/api/oauth2/token';
    $apiURLBase = 'https://discord.com/api/users/@me';

    session_start();

    if (isset($_GET["login"])) {
        if ($_GET["login"] == 0) {
            // connect
            $params = array(
                'client_id' => OAUTH2_CLIENT_ID,
                'redirect_uri' => $webPanel,
                'response_type' => 'code',
                'scope' => 'identify guilds'
            );

            // Redirect the user to Discord's authorization page
            header('Location: ' . $authorizeURL . '?' . http_build_query($params));
            die();
        } else {
            // disconnect
            disconnectUser();

            // return to main panel page
            header('Location: ' . $webPanel);
            die();
        };

    // recieaved something from discord
    } else if (isset($_GET["code"])) {
        // check bot invite
        if (isset($_GET["guild_id"])) {
            // redirect user to dashboard
            header('Location: ' . $webPanel . "/dashboard");
            die();
        };

        // its a token request
        $response = getAccessTocken($tokenURL, 
            array(
                'client_id' => OAUTH2_CLIENT_ID,
                'client_secret' => OAUTH2_CLIENT_SECRET,
                "grant_type" => "authorization_code",
                'code' => $_GET["code"],
                'redirect_uri' => $webPanel,
                'scope' => 'identify guilds'
            )
        );

        if (!isset($response->access_token)) {
            disconnectUser();

            header('Location: ' . $webPanel . '?error=1');
            die();
        };

        setcookie('access_token', $response->access_token, time() + $response->expires_in - 86400, "/");
        
        header('Location: ' . $webPanel . 'php/discord.php?getUser');
        die();
    } else if (isset($_GET["getUser"])) {
        $response = getUserInfo($apiURLBase);

        if (!isset($response->id)) {
            disconnectUser();
            
            header('Location: ' . $webPanel . "?error=2");
            die();
        };

        $_SESSION['user_id'] = $response->id;
        $_SESSION['user_username'] = $response->username;
        $_SESSION['user_avatar'] = $response->avatar;
        $_SESSION['user_discriminator'] = $response->discriminator;

        header('Location: ' . $webPanel);
        die();

    } else if (isset($_GET["getServers"])) {
        $response = getUserServers($apiURLBase);

        if (!isset($response) || !is_array($response)) {
            disconnectUser();
            
            header('Location: ' . $webPanel . "?error=4");
            die();
        };

        $servers = array();
        foreach ($response as &$server) {
            $permission = decbin($server->permissions);

            // check if has admin or manage server permission on the server
            if (substr($permission, -4, 1) || substr($permission, -6, 1)) {
                array_push ($servers, 
                    array(
                        "id"=> $server->id,
                        "name"=> $server->name,
                        "permissions"=> $server->permissions,
                        "icon"=> "https://cdn.discordapp.com/icons/" . $server->id . "/" . $server->icon . ".png"
                    )
                );
            };
        };

        // set session servers var
        $_SESSION["user_servers"] = $servers;

        // redirect user to dashboard
        header('Location: ' . $webPanel . "dashboard");
        die();

    } else if (isset($_GET["clearUserServers"])) {
        clearUserServers();

        // redirect user to dashboard
        header('Location: ' . $webPanel . "dashboard");
        die();
    };
    
    // redirect user to main page
    header('Location: ' . $webPanel);
    die();  

    function getAccessTocken($tokenURL, $data) {
        // Exchange the auth code for a token
        $ch = curl_init($tokenURL);

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        $response = curl_exec($ch);

        curl_close($ch);

        return json_decode($response);
    };

    function getUserInfo($apiURLBase) {
        $ch = curl_init($apiURLBase);

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

        $headers[] = 'Authorization: Bearer ' .  $_COOKIE['access_token'];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);

        curl_close($ch);

        return json_decode($response);
    };

    function getUserServers($apiURLBase) {
        $ch = curl_init($apiURLBase . "/guilds");

        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

        $headers[] = 'Authorization: Bearer ' .  $_COOKIE['access_token'];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $response = curl_exec($ch);

        curl_close($ch);

        return json_decode($response);
    };

    function disconnectUser() {
        setcookie('access_token', '', time()-3600, '/');
        setcookie('patreon_access_tocken', '', time()-3600, '/');
        
        clearUserData();
        clearUserServers();

        session_destroy();
    };

    function clearUserData() {
        unset($_SESSION['user_id']);
        unset($_SESSION['user_username']);
        unset($_SESSION['user_avatar']);
        unset($_SESSION['user_discriminator']);
    };

    function clearUserServers() {
        unset($_SESSION["user_servers"]);
    };
?>
