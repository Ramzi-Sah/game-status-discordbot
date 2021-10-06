<?php
    include("php/config.php");
    include("php/db_connection.php");

    // handle lang
    if (!isset($_COOKIE["lang"])) {
        include("php/language.php");
    };

    // load translations
    $STRINGS = array();
    $STRINGS = array_merge (
        $STRINGS, 
        json_decode(file_get_contents("./assets/translations/" . $_COOKIE["lang"] . "/ActionBar.json"), true)
    );
    $STRINGS = array_merge (
        $STRINGS, 
        json_decode(file_get_contents("./assets/translations/" . $_COOKIE["lang"] . "/HomePage.json"), true)
    );
    
    session_start();

    // check for discord code
    if (isset($_GET['code'])) {
        // check bot invite
        if (isset($_GET["guild_id"])) {
            header('Location: php/discord.php?code=' . $_GET['code'] . '&guild_id=' . $_GET["guild_id"]);
            die();
        };

        header('Location: php/discord.php?code=' . $_GET['code']);
        die();
    };

    // get heartbeat
    $reponse= $bdd->prepare("SELECT status FROM bot");
    $reponse->execute();
    $reponse_heartBeat = $reponse->fetch()[0];
?>

<!DOCTYPE html>
<html>
<head>
    <title>Server Status Bot</title>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="assets/bootstrap/4.5.3-dist/css/bootstrap.min.css">
    <script src="assets/jquery/query-3.5.1.min.js"></script>
    <script src="assets/bootstrap/4.5.3-dist/js/bootstrap.bundle.min.js"></script>

    <link href="assets/fontawesome/5.15.1/css/all.css" rel="stylesheet">

    <link rel="stylesheet" href="css/main.css"/>
    <link rel="stylesheet" href="css/actionbar.css"/>
    <link rel="stylesheet" href="css/index.css"/>
</head>
<body>
    <?php
        // handle error bar
        if (isset($_GET['error'])) {

            // handle error
            if ($_GET['error'] == "access_denied") {

            } else {
                echo "<div class='errorBar'>";
                switch ($_GET['error']) {
                    case 0:
                        echo $STRINGS["errorbar_unkown"];
                        break;
                    case 1:
                        echo $STRINGS["errorbar_access_tocken"];
                        break;
                    case 2:
                        echo $STRINGS["errorbar_discord_out"];
                        break;
                    case 3:
                        echo $STRINGS["errorbar_need_login"];
                        break;
                    case 4:
                        echo $STRINGS["errorbar_discord_not_responding"];
                        break;
                    case 5:
                        echo $STRINGS["errorbar_serverinstance"];
                        break;
                    case 6:
                        echo "Couldn't link your patreon Account with the Dashboard :(";
                        break;
                }
                echo "</div>";
            };
        };
    ?>

    <?php
        // check if user connected
        if(isset($_COOKIE['access_token'])) {

            // check if have user data
            if (isset($_SESSION['user_id'])) {
                // get user data from db
                $reponse = $bdd->query("SELECT * FROM users WHERE user_id = '" . $_SESSION['user_id'] . "'");
                $user = $reponse->fetch();

                if (!$user) {
                    $user["points"] = 0;
                };

    ?>
            <!--#################################### dashboard ####################################-->
            <div class="container-fluid action-bar">
                <div class="row">
                    <div class="col-sm-1"></div>
                    <div class="col-sm-10">
                        <div class="row">
                            <div class="col-sm-5">
                                <label class="site-path-label">
                                    <a href="./dashboard"><?php echo $STRINGS["actionbar_path_dashboard"]?></a>
                                </label>
                            </div>
                            <div class="col-sm-3 bot-status">
                                <?php echo $STRINGS["actionbar_botStatus"]?>:
                                <?php
                                    if(strtotime('now') - $reponse_heartBeat < $hert_beat_time) {
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
                                        <a class="dropdown-item" href="./dashboard/payment"><?php echo $STRINGS["actionbar_user_points"]?>: 
                                            <?php
                                                echo $user["points"];
                                            ?>
                                        </a>

                                        <div class="dropdown-divider"></div>
                                        <a class="dropdown-item user-action-join-discord" href="<?php echo $supportDiscordServerLink?>" target="_blank"><?php echo $STRINGS["actionbar_user_Join_Support_Server"]?></a>
                                        <a class="dropdown-item user-action-donate" href="./dashboard/payment/donate.php">Donate ❤️</a>
									    <div class="dropdown-divider"></div>
                                        <a class="dropdown-item text-danger" href="php/discord.php?login=1"><?php echo $STRINGS["actionbar_user_Disconnect"]?></a>
                                    </div>

                                </div>
                            </div>

                            <div class="col-sm-1 user-profile">
                                <div class="dropdown dropdown-menu-right">
                                    <label class="dropdown-toggle user-profile-name" id="profile-button" data-toggle="dropdown">
                                            <image src='./assets/images/flags/<?php echo $_COOKIE["lang"]?>.png' class='flag-logo'></image> 
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
                                                echo "\"href=\"./php/language.php?lang=" . $languageCode . "\"> ";
                                                echo "<image src='./assets/images/flags/" . $languageCode . ".png' class='flag-logo'></image>";
                                                echo $language[0];
                                                echo "</a>";
                                            };
                                        ?>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <div class="col-sm-1"></div>
                </div>
            </div>
 
            <div class='container-fluid main-div'>
                <div class="row presantation-bot-text-row">
                    <div class="col-sm-2"></div>
                        <div class="col-sm-6">
                            <img src="./assets/images/avatar.png" class="rounded presantation-bot-avatar">

                            <?php
                                if(strtotime('now') - $reponse_heartBeat < $hert_beat_time) {
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
                            <h3 class="presantation-text">Game Status Bot</h3>
                        </div>
                    <div class="col-sm-2"></div>
                </div>

                <div class="row presantation-text-row">
                    <div class="col-sm-2"></div>
                    <div class="col-sm-8 center-inRow">
                        <h1 class="presantation-text"><?php echo $STRINGS["presentation_text_main"]?></h1>
                    </div>
                    <div class="col-sm-2"></div>
                </div>
                <div class="row">
                    <div class="col-sm-2"></div>
                    <div class="col-sm-8 center-inRow">
                        <p class="presantation-mini-text">
                            <?php echo $STRINGS["presentation_text_secondary"]?>
                        </p>
                    </div>
                    <div class="col-sm-2"></div>
                </div>
                <div class="row presantation-btns-row">
                    <div class="col-sm-3"></div>
                    <div class="col-sm-3 center-inRow">
                        <button type="button" class="btn btn-light btn-lg" onclick="window.location.href='./dashboard'">
                            <?php echo $STRINGS["presentation_button_invite"]?>
                        </button>
                    </div>
                    <div class="col-sm-3 center-inRow">
                        <button type="button" class="btn btn-outline-secondary btn-lg" onclick="window.open('https://top.gg/bot/731586234769735750', '_blank');">
                            <i class="fas fa-angle-up"></i>
                            <?php echo $STRINGS["presentation_button_upvote"]?>
                        </button>
                    </div>
                    <div class="col-sm-3"></div>
                </div>
    <?php
            } else {
                // get user data
                header('Location: ' . $webPanel . 'php/discord.php?getUser');
                die();
            };
        } else {
    ?>
        
        <div class='container-fluid main-div'>
            <div class="row presantation-bot-text-row">
                <div class="col-sm-2"></div>
                    <div class="col-sm-6">
                        <img src="./assets/images/avatar.png" class="rounded presantation-bot-avatar">

                        <?php
                            if(strtotime('now') - $reponse_heartBeat < $hert_beat_time) {
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
                        <h3 class="presantation-text">Game Status Bot</h3>
                    </div>
                    <div class="col-sm-2"></div>
                </div>
            <div class="row presantation-text-row">
                <div class="col-sm-2"></div>
                <div class="col-sm-8 center-inRow">
                    <h1 class="presantation-text"><?php echo $STRINGS["presentation_text_main"]?></h1>
                </div>
                <div class="col-sm-2"></div>
            </div>
            <div class="row">
                <div class="col-sm-2"></div>
                <div class="col-sm-8 center-inRow">
                    <p class="presantation-mini-text">
                        <?php echo $STRINGS["presentation_text_secondary"]?>
                    </p>
                </div>
                <div class="col-sm-2"></div>
            </div>
            <div class="row">
                <div class="col-sm-3"></div>
                <div class="col-sm-3 center-inRow">
                    <button type="button" class="btn btn-outline-primary btn-lg" onclick="window.location.href='php/discord.php?login=0'">
                        <i class="fab fa-discord"></i>
                        <?php echo $STRINGS["presentation_button_login"]?>
                    </button>
                </div>
                <div class="col-sm-3 center-inRow">
                    <button type="button" class="btn btn-outline-secondary btn-lg" onclick="window.open('https://top.gg/bot/731586234769735750', '_blank');">
                        <i class="fas fa-angle-up"></i>
                        <?php echo $STRINGS["presentation_button_upvote"]?>
                    </button>
                </div>
                <div class="col-sm-3"></div>
            </div>

            <?php
                };

                $reponse = $bdd->query("SELECT COUNT(*) FROM guilds;");
                $nbr_servers = $reponse->fetch()[0];
                
                $reponse = $bdd->query("SELECT COUNT(*) FROM instances;");
                $nbr_instances = $reponse->fetch()[0];

                $reponse = $bdd->query("SELECT COUNT(*) FROM instances WHERE started = 1;");
                $nbr_started_instances = $reponse->fetch()[0];

                // echo "nbr servers: " . $nbr_servers;
                // echo "nbr instances: " . $nbr_started_instances . " / " . $nbr_instances;
            ?>

        </div>

        <div id="particles-js">
        <script src="js/particles.min.js"></script>
        <script src="js/app.js"></script>

    </body>
</html>
