<?php
    include("../php/config.php");
    include("../php/db_connection.php");
    include("../php/affiliateBanners.php");
    
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
        json_decode(file_get_contents("../assets/translations/" . $_COOKIE["lang"] . "/Server.json"), true)
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
    if (!isset($_GET["id"]) || !preg_match('/^[0-9]*$/', $_GET["id"])) {
        // get user data
        header('Location: ' . $webPanel . 'dashboard');
        die();
    };
    
    // check if bot is in server
    if (!in_array($_GET["id"], $bot_guild_ids)) {
        echo "the bot is not in this server.";
        echo "<br>";
        echo "<a href=\"" . $webPanel . "dashboard\">return</a>";
        die();
    };

    // check if server is in user servers
    if (!in_array($_GET["id"], $user_guild_ids)) {
        echo "you do not have permission to edit this bot config.";
        echo "<br>";
        echo "<a href=\"" . $webPanel . "dashboard\">return</a>";
        die();
    };

    // get server info
    $managedServer = array();
    foreach ($_SESSION["user_servers"] as $server) {
        if ($server["id"] == $_GET["id"]) {
            $managedServer = $server;
            break;
        };
    };

    // get server's instances
    $reponse = $bdd->query("SELECT instances FROM guilds WHERE guild_id = " . $managedServer["id"]);
    $reponse = $reponse->fetch();

    $instances_id = json_decode($reponse["instances"]);

    // get user data from db
    $reponse = $bdd->query("SELECT * FROM users WHERE user_id = '" . $_SESSION['user_id'] . "'");
    $user = $reponse->fetch();

    if (!$user) {
        $user["points"] = 0;
    };

    // get guild info
    $reponse = $bdd->query("SELECT level, points FROM guilds WHERE guild_id = " . $managedServer["id"]);
    $reponse = $reponse->fetchAll();

    $guild_level = $reponse[0][0] + 1;
    $guild_points = $reponse[0][1];
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
    <link rel="stylesheet" href="../css/server.css"/>
</head>
<body>
    <?php
        // handle error bar
        if (isset($_GET['error'])) {

            // handle error
            if ($_GET['error'] == "") {

            } else {
                echo "<div class='errorBar'>";
                switch ($_GET['error']) {
                    case 0:
                        echo $STRINGS["errorbar_unkown"];
                        break;
                    case 1:
                        echo $STRINGS["errorbar_instance_name"];
                        break;
                    case 2:
                        echo $STRINGS["errorbar_invalid_id"];
                        break;
                    case 3:
                        echo "Your server does not have enough points to be upgraded.";
                        break;
                    case 4:
                        echo "You have to set the number of points you want to transfer.";
                        break;
                    case 5:
                        echo "You want to transfer an invalid number of points.";
                        break;
                    case 6:
                        echo "You do not have enough points.";
                        break;
                }
                echo "</div>";
            };
        };
        // handle info bar
        if (isset($_GET['info'])) {

            // handle error
            if ($_GET['info'] == "") {

            } else {
                echo "<div class='infoBar'>";
                switch ($_GET['info']) {
                    case 0:
                        echo $STRINGS["infobar_unkown"];
                        break;
                    case 2:
                        echo $STRINGS["infobar_spamm"];
                        break;
                    case 3:
                        echo $STRINGS["infobar_max_instances"];
                        break;
                }
                echo "</div>";
            };
        };


        // handle info bar
        if (isset($_GET['success'])) {

            // handle error
            if ($_GET['success'] == "") {

            } else {
                echo "<div class='successBar'>";
                switch ($_GET['success']) {
                    case 0:
                        echo "i don't know what you are tring to do but its a success.";
                        break;
                    case 1:
                        echo "Server upgraded successfully.";
                        break;
                    case 2:
                        echo "Points transferred successfully.";
                        break;
                }
                echo "</div>";
            };
        };
    ?>

    <div class="container-fluid action-bar">
        <div class="row">
            <div class="col-sm-1"></div>
            <div class="col-sm-10">
                <div class="row">
                    <div class="col-sm-5">
                        <label class="site-path-label">
                            <a href="../"><?php echo $STRINGS["actionbar_path_main"];?></a>
                            &#62; <a href="./"><?php echo $STRINGS["actionbar_path_dashboard"];?></a>
                            &#62; <?php echo $STRINGS["actionbar_path_server"];?>
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
        
        <?php
            if (sizeof($instances_id) > ($guild_level * 3)) {
        ?>
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Too many Instances !</h4>
                    Your server baypassed the instances limit for its level, you need to delete some instances or <b><a onclick="openUpgradeServerLevelModal()">level up the server</a></b>. 
                </div>
        <?php
            };
        ?>

        <div class="container instance-list-div">
            <h3 class="list-label"><?php echo $STRINGS["instancelist_title"]?></h3>

            <div class="instance-server-div">
                <?php
                    echo $managedServer["name"] . " (" . $managedServer["id"] . ")";
                ?>
                <div class="server-level-div" onclick="openUpgradeServerLevelModal()">
                    Instances: 
                    <label style="<?php if (sizeof($instances_id) > ($guild_level * 3)) echo 'color:red;'?>">
                    <?php
                        echo sizeof($instances_id);?> out of <?php echo $guild_level * 3;
                    ?>
                    </label>
                    <div class="progress">
                        <div class="progress-bar bg-success" role="progressbar" style="width: <?php echo (intval($guild_level)/5*100)?>%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                            level <?php echo $guild_level;?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Upgrade server level Modal -->
            <div class="modal fade" id="upgradeServerLevelModal" tabindex="-1" role="dialog" aria-labelledby="upgradeServerLevelModalTitle" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLongTitle">Server Level</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <center><b>
                            <?php  echo $managedServer["name"] . " (" . $managedServer["id"] . ")";?>
                        </b></center>

                        <!-- <br>
                        <div class="progress">
                            <div class="progress-bar bg-success" role="progressbar" style="width: <?php echo (intval($guild_level)/5*100)?>%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                                level <?php echo $guild_level;?>
                            </div>
                        </div> -->

                        <br>
                        Server Level: <?php echo $guild_level;?>
                        <br>
                        Max instances: <?php echo $guild_level * 3;?>
                        <br>
                        Instances: <?php echo sizeof($instances_id);?>
                        <br>

                        <hr>
                        <b>Transfer my points to this server:</b>
                        <br>
                        <br>
                        My Points: <?php echo $user["points"]?>
                        <br>
                        Server Points: <?php echo $guild_points;?>
                        <br>
                        <br>
                        <form class="instance-action-form" action="../php/instance.php?transferPoints" method="post">
                            <input type="hidden" name="serverid" value="<?php echo $managedServer["id"]?>">
                            <input type="number" name="nbr_points_transfer" value="0">
                            <span class="d-inline-block" tabindex="0" data-toggle="tooltip" title="you cannot get back your points after they get transfered to the server.">
                                <input type="submit" class="btn text-danger" value="Transfer Points">
                            </span>
                        </form>

                    </div>
                    <div class="modal-footer"> 
                        <form class="instance-action-form" action="../php/instance.php?upgrade" method="post">
                            <input type="hidden" name="serverid" value="<?php echo $managedServer["id"]?>">
                            <input type="submit" class="btn btn-success" value="Upgrade Server (50 points)" <?php if ($guild_points < 50) echo "disabled"?>>
                        </form>
                    </div>
                </div>
            </div>
        </div>

            <br><br>

            <div class="create-instance-div">
                <form action="../php/instance.php?create" method="post">
                    <input type="text" name="name" value="instance name">
                    <input type="hidden" name="serverid" value="<?php echo $managedServer["id"]?>">
                    <input type="submit" value="<?php echo $STRINGS["instancelist_button_create_new"]?>">
                </form>
            </div>

        <?php
            if (empty($instances_id)) {
            // if (true) {
                echo "<br><br>";
                echo $STRINGS["instancelist_noInstances"];
            } else {
                ?>
                    <table class="table" id="instance-list-table">
                        <thead>
                            <tr>
                            <!-- <th scope="col"></th> -->
                            <th scope="col"><?php echo $STRINGS["instancelist_table_name"]?></th>
                            <th scope="col"><?php echo $STRINGS["instancelist_table_id"]?></th>
                            <th scope="col"><?php echo $STRINGS["instancelist_table_status"]?></th>
                            <th scope="col"><?php echo $STRINGS["instancelist_table_setup"]?></th>
                            <th scope="col"><?php echo $STRINGS["instancelist_table_action"]?></th>
                            </tr>
                        </thead>
                    <tbody>
                <?php


                $instances_id_sql = implode("','", $instances_id);
                $reponse = $bdd->query("SELECT * FROM instances WHERE instance_id IN ('" . $instances_id_sql . "')");
                $reponse = $reponse->fetchAll();

                foreach ($reponse as $instance) {
                    $started = "<span class=\"badge badge-danger\">" . $STRINGS["instancelist_table_status_stopped"] . "</span>";
                    if ( $instance["started"]) $started = "<span class=\"badge badge-success\">" . $STRINGS["instancelist_table_status_started"] . "</span>";
                    if (sizeof($instances_id) > ($guild_level * 3)) $started = "<span class=\"badge badge-secondary\">" . "FROZEN" . "</span>";

                ?>
                    <tr>

                    <td><?php echo $instance["name"];?></td>
                    <td><?php echo $instance["instance_id"];?></td>
                    <td><?php echo $started;?></td>

                        <td>
                            <form class="instance-action-form" action="./instance.php" method="get">
                                <input type="hidden" name="id" value="<?php echo $instance["instance_id"];?>">
                                <input type="hidden" name="guild" value="<?php echo $managedServer["id"];?>">
                                <input type="submit" class="btn btn-primary" value="<?php echo $STRINGS["instancelist_table_action_configure"];?>">
                            </form>
                        </td>

                        <td>
   
                            <!-- Button delete instance trigger modal -->
                            <button class="btn btn-outline-danger" data-toggle="modal" data-target="#deleteInstanceConfirmationModal_<?php echo $instance["instance_id"];?>"><?php echo $STRINGS["instancelist_table_action_delete"];?></button>

                            <!-- Modal -->
                            <div class="modal fade" id="deleteInstanceConfirmationModal_<?php echo $instance["instance_id"];?>" tabindex="-1" role="dialog" aria-labelledby="deleteInstanceConfirmationModalTitle" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered" role="document">
                                    <div class="modal-content">
                                    <div class="modal-body">
                                        Are you sure you want to delete this instance ?<br>
                                        This will delete all of the instace configuration and possible bought items.
                                    </div>
                                    <div class="modal-footer">

                                        <form class="instance-action-form" action="../php/instance.php?delete" method="post">
                                            <input type="hidden" name="instanceid" value="<?php echo $instance["instance_id"];?>">
                                            <input type="hidden" name="serverid" value="<?php echo $managedServer["id"];?>">
                                            <input type="submit" class="btn btn-outline-danger" value="<?php echo $STRINGS["instancelist_table_action_delete"];?>">
                                        </form>

                                        <button class="btn btn-primary" data-dismiss="modal" aria-label="Close">
                                            Cancel
                                        </button>

                                    </div>
                                    </div>
                                </div>
                            </div>

                        </td>
                    </tr>

                <?php
                };
            };

        ?>
                </tbody>
            </table>
        </div>
        <div style="text-align:center;">
            <?php 
                echo $zap_landscape_banners[array_rand($zap_landscape_banners)];
            ?>
            <p style="color:white;">With the code <b>gamestatusbot-7455</b> you will receive a 20% discount on the entire duration of all products.</p>
        </div>
    </div>

    <div id="particles-js">
    <script src="../js/particles.min.js"></script>
    <script src="../js/app.js"></script>

    <!-- toggle upgrade server leve+l modal-->
    <script>
        function openUpgradeServerLevelModal() {
            $('#upgradeServerLevelModal').modal('toggle');
        };

        // enable tooltip
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    </script>


</body>
</html>
