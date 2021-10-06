<?php
    include("../php/config.php");
    include("../php/db_connection.php");
    include("../php/affiliateBanners.php");

    $inviteAPI = 'https://discord.com/api/oauth2/authorize';

    // handle lang
    if (!isset($_COOKIE["lang"])) {
        include("php/language.php");
    };
    $STRINGS = array();
    $STRINGS = array_merge (
        $STRINGS, 
        json_decode(file_get_contents("../assets/translations/" . $_COOKIE["lang"] . "/ActionBar.json"), true)
    );
    $STRINGS = array_merge (
        $STRINGS, 
        json_decode(file_get_contents("../assets/translations/" . $_COOKIE["lang"] . "/Dashboard.json"), true)
    );

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
    $guild_ids = array();
    for ($i = 0; $i < count($_SESSION["user_servers"]); $i++) {
        array_push($guild_ids, $_SESSION["user_servers"][$i]["id"]);
    };

    $guild_ids = implode("','", $guild_ids);
    $reponse = $bdd->query("SELECT guild_id, level FROM guilds WHERE guild_id IN ('" . $guild_ids . "')");
    $reponse = $reponse->fetchAll();

    $guild_ids = array();
    $guild_levels = array();
    foreach ($reponse as $server) {
        array_push($guild_ids, $server['guild_id']);
        $guild_levels[$server['guild_id']] = $server['level'];
    };

    // get user data from db
    $reponse = $bdd->query("SELECT * FROM users WHERE user_id = '" . $_SESSION['user_id'] . "'");
    $user = $reponse->fetch();

    if (!$user) {
        $user["points"] = 0;
    };
?>

<!DOCTYPE html>
<html>
<head>
    <title>Server Status Bot</title>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="../assets/bootstrap/4.5.3-dist/css/bootstrap.min.css">
    <script src="../assets/jquery/query-3.5.1.min.js"></script>
    <script src="../assets/bootstrap/4.5.3-dist/js/bootstrap.bundle.min.js"></script>

    <link href="../assets/fontawesome/5.15.1/css/all.css" rel="stylesheet">

    <link rel="stylesheet" href="../css/main.css"/>
    <link rel="stylesheet" href="../css/actionbar.css"/>
    <link rel="stylesheet" href="../css/dashboard.css"/>
</head>
<body>

    <div class="container-fluid action-bar">
        <div class="row">
            <div class="col-sm-1"></div>
            <div class="col-sm-10">
                <div class="row">
                    <div class="col-sm-5">
                        <label class="site-path-label">
                            <a href="../"><?php echo $STRINGS["actionbar_path_main"]?></a>
                            &#62; <?php echo $STRINGS["actionbar_path_dashboard"]?>
                        </label>
                    </div>
                    <div class="col-sm-3 bot-status">
                        <?php echo $STRINGS["actionbar_botStatus"]?>:
                        <?php
                            $reponse= $bdd->prepare("SELECT status FROM bot");
                            $reponse->execute();
                            $reponse = $reponse->fetch()[0];

                            if(strtotime('now') - $reponse < $hert_beat_time) {
                        ?>
                            <span class="fa-stack bot-status-icon">
                                <i style="color: rgba(50, 220, 25, 0.5)" class="fas fa-circle fa-stack-1x" id="botStatus_icon"></i>
                                <i style="color: rgb(50 220 25); font-size:0.65em;" class="fas fa-circle fa-stack-1x" id="botStatus_icon_2"></i>
                            </span>
                            <label style="color: #1dd01d"><?php echo $STRINGS["actionbar_botStatus_online"]?></label>
                        <?php
                            } else {
                        ?>
                            <span class="fa-stack bot-status-icon">
                                <i style="color: rgba(255, 0, 0, 0.5)" class="fas fa-circle fa-stack-1x" id="botStatus_icon"></i>
                                <i style="color: rgb(245 0 0); font-size:0.65em;" class="fas fa-circle fa-stack-1x" id="botStatus_icon_2"></i>
                            </span>
                            <label style="color: #e21a36"><?php echo $STRINGS["actionbar_botStatus_offline"]?></label>
                        <?php
                            };
                        ?>
                    </div>
                    <div class="col-sm-3 user-profile">

                        <div class="dropdown dropdown-menu-right">
                            <label class="dropdown-toggle user-profile-name" id="profile-button" data-toggle="dropdown">
                                <?php
                                    echo "<img src=\"https://cdn.discordapp.com/avatars/" . $_SESSION['user_id']  . "/" . $_SESSION['user_avatar']  . ".png\" class=\"rounded-circle user-profile-pic\">";
                                    echo $_SESSION['user_username'] . "#" . $_SESSION['user_discriminator'] . "<i class=\"fas fa-angle-down down-arrow\"></i>";
                                ?>
                            </label>

                            <div class="dropdown-menu animate slideIn">                                
                                <a class="dropdown-item" href="./payment"><?php echo $STRINGS["actionbar_user_points"]?>: 
                                    <?php 
                                        echo $user["points"];                                   
                                    ?>
                                </a>

                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item user-action-join-discord" href="<?php echo $supportDiscordServerLink?>" target="_blank"><?php echo $STRINGS["actionbar_user_Join_Support_Server"]?></a>
                                <a class="dropdown-item user-action-donate" href="./payment/donate.php">Donate ❤️</a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item text-danger" href="../php/discord.php?login=1"><?php echo $STRINGS["actionbar_user_Disconnect"]?></a>
                            </div>

                        </div>

                    </div>

                    <div class="col-sm-1 user-profile">
                        <div class="dropdown dropdown-menu-right">
                            <label class="dropdown-toggle user-profile-name" id="profile-button" data-toggle="dropdown">
                                    <image src='../assets/images/flags/<?php echo $_COOKIE["lang"]?>.png' class='flag-logo'></image> 
                                    <?php echo $_COOKIE["lang"]?>
                                    <i class="fas fa-angle-down down-arrow"></i>
                            </label>
                            <div class="dropdown-menu animate slideIn">
                                <?php 
                                    foreach($supportedLanguages as $languageCode=>$language) {
                                        echo "<a class=\"dropdown-item ";
                                        if (!$language[1]) {
                                            echo "disabled text-danger";
                                        };
                                        echo "\"href=\"../php/language.php?lang=" . $languageCode . "\"> ";
                                        echo "<image src='../assets/images/flags/" . $languageCode . ".png' class='flag-logo'></image>";
                                        echo $language[0];
                                        echo "</a>";
                                    };
                                ?>
                            </div>
                        </div>
                    </div>


                </div>
                <!-- <div class="row line-horizontal"></div> -->
            </div>
            <div class="col-sm-1"></div>
        </div>
    </div>

    <div class="container main-div">
        <div class="row">
            <div class="col-sm-11">
                <div class="container server-list-div">
                    <h3 class="list-label"><?php echo $STRINGS["serverlist_title"]?></h3>
                    <a class="list-refresh" href="../php/discord.php?clearUserServers"><?php echo $STRINGS["serverlist_refresh"]?></a>

                        <?php
                            if (empty($_SESSION["user_servers"])) {
                                echo "<br><br>you are not administrating any server.";
                            } else {
                                ?>
                                    <table class="table" id="server-list-table">
                                        <thead>
                                            <tr>
                                            <th scope="col"></th>
                                            <th scope="col"><?php echo $STRINGS["serverlist_table_name"]?></th>
                                            <th scope="col"><?php echo $STRINGS["serverlist_table_id"]?></th>
                                            <th scope="col"><?php echo "Level"?></th>
                                            <th scope="col"><?php echo $STRINGS["serverlist_table_action"]?></th>
                                            </tr>
                                        </thead>
                                    <tbody>
                                <?php

                                foreach ($_SESSION["user_servers"] as &$server) {
                                    echo "<tr>";
                                    $serverName = explode(" ", $server["name"]);

                                    echo "<td image=\"" . $server["icon"] . "\"><label style=\"display:block;\">";
                                    
                                    foreach($serverName as &$word) {
                                        echo $word[0];
                                    };
                                    
                                    echo "</label>
                                        <img style=\"display:none;\" class=\"rounded-circle guild-profile-pic\"/>
                                    </td>";
                                    echo "<td>" . $server["name"] . "</td>";
                                    echo "<td>" . $server["id"] . "</td>";

                                    // check if bot joined this guild
                                    if (in_array($server["id"], $guild_ids)) {
                                        echo "<td>" . strval($guild_levels[$server["id"]] + 1) . "</td>";
                                        
                                        echo "<td><a href=\"server.php?id=" . $server["id"] . "\">" .  $STRINGS["serverlist_table_action_configure"] . "</a></td>";
                                    } else {
                                        echo "<td>" . 0 . "</td>";

                                        $invite = $inviteAPI . "?client_id=" . OAUTH2_CLIENT_ID . "&permissions=" . BOT_PERMISSION_VALUE . "&redirect_uri=" . urlencode($webPanel) . "&guild_id=" . $server["id"] . "&scope=bot&response_type=code";
                                        echo "<td><a href=\"" . $invite . "\">" . $STRINGS["serverlist_table_action_invite"] . "</a></td>";
                                    };
                                    echo "</tr>";
                                };
                            };
                        ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <div class="col-sm-1">
            <div class="row">

                <?php 
                    echo $zap_upright_banners[array_rand($zap_upright_banners)];
                ?>
            </div>
            <div class="row">
                <p style="color:white;">With the code <b>gamestatusbot-7455</b> you will receive a 20% discount on the entire duration of all products.</p>
            </div>
        </div>
        </div>
    </div>

    <script>
        var rows = document.getElementById("server-list-table").rows;
        for (let i = 0; i < rows.length; i++) {
            let cell = rows[i].cells[0].children;
            let label = cell[0];
            let img = cell[1];

            let server_img = new Image();
            server_img.onload = function() {
                label.style.display = "none";
                img.src = server_img.src;
                img.style.display = "block";
            }; 
            server_img.src = rows[i].cells[0].getAttribute("image");
        };

    </script>

    <div id="particles-js">
    <script src="../js/particles.min.js"></script>
    <script src="../js/app.js"></script>
</body>
</html>
