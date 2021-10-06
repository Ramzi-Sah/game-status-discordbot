<?php
    include("../php/config.php");
    include("../php/db_connection.php");

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
        json_decode(file_get_contents("../assets/translations/" . $_COOKIE["lang"] . "/Selfhost.json"), true)
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
    <link rel="stylesheet" href="../css/selfhost.css"/>
</head>
<body>
    <div class="container-fluid action-bar">
        <div class="row">
            <div class="col-sm-1"></div>
            <div class="col-sm-10">
                <div class="row">
                    <div class="col-sm-5">
                        <label class="site-path-label">
                            <a href="../"><?php echo $STRINGS["actionbar_path_dashboard"]?></a>
                            &#62; <a href="./">Self Host</a>
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
    
    <div class='container main-div'>
        <div class="container config-div">
            <form action="download.php" method="post">
                <label>OS :</label>
                <select name="os">
                    <option>Linux</option>
                    <option>Windows</option>
                <select>
                
                <br>

                <label>number of instances: </label>
                <label>1</label>

                <hr>
                <label>Discord Bot Token :</label>
                <input name="botToken"></input>
                <br>

                <br>
                <label>Channel ID :</label>
                <input name="channelId"></input>

                <hr>

                <label>Host :</label>
                <input name="host"></input>
                <br>

                <br>
                <label>Port :</label>
                <input name="port"></input>
                <br>

                <!-- <br>
                <label>Game :</label>
                <input name="game"></input>
                <br> -->

                <?php 
                    // get game types
                    $reponse = $bdd->query("SELECT * FROM games ORDER BY name");
                    $gametypes = $reponse->fetchAll();

                    $gameTypeInfo = false;

                    echo "<select id=\"instance-Game\" class=\"form-control\" name=\"game\" required>";
                    echo "<option value=\"\" >" . $STRINGS["instance_config_game"] . "</option>";
                    foreach ($gametypes as $game) {
                        // print_r($game);
                        if ($instance["game"] == $game["type"]) {
                            echo "<option value=\"" . $game["type"] . "\" selected=\"selected\">" . $game["name"] . "</option>";
                            if ($game["info"]) $gameTypeInfo = $game["info"];
                        } else {
                            echo "<option value=\"" . $game["type"] . "\" >" . $game["name"] . "</option>";
                        }
                    };
                    echo "</select>";

                    if ($gameTypeInfo) {
                        echo "<br><div class='alert alert-warning ErrorNotification' role='alert'>";
                        echo "<label style='font-size:20px;'>" . $STRINGS["instance_config_game_requirements"] . " :</label><br>";
                        echo $gameTypeInfo;
                        echo "</div>";
                    }
                ?>

            <!--
                <br>
                <hr>
                <br>

                <br>
                    <input name="minimalmode" type="checkbox">minimal mode</input>
                <br>

                <br>
                    <input name="playerlist" type="checkbox">Player list</input>
                <br>

                <br>
                    <input name="graph" type="checkbox">Graph</input>
                <br>
            -->

                <hr>

                <button>download</button>
            </form>
        </div>
    </div>
</body>