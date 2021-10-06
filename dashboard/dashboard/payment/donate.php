<?php

    include("../../php/config.php");
    include("../../php/db_connection.php");

    // handle lang
    if (!isset($_COOKIE["lang"])) {
        include("php/language.php");
    };
    $STRINGS = array();
    $STRINGS = array_merge (
        $STRINGS, 
        json_decode(file_get_contents("../../assets/translations/" . $_COOKIE["lang"] . "/ActionBar.json"), true)
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

    // get heartbeat
    $reponse= $bdd->prepare("SELECT status FROM bot");
    $reponse->execute();
	$reponse_heartBeat = $reponse->fetch()[0];
	
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

        <link rel="stylesheet" href="../../assets/bootstrap/4.5.3-dist/css/bootstrap.min.css">
        <script src="../../assets/jquery/query-3.5.1.min.js"></script>
        <script src="../../assets/bootstrap/4.5.3-dist/js/bootstrap.bundle.min.js"></script>

        <link href="../../assets/fontawesome/5.15.1/css/all.css" rel="stylesheet">

        <link rel="stylesheet" href="../../css/main.css"/>
        <link rel="stylesheet" href="../../css/actionbar.css"/>
        <link rel="stylesheet" href="../../css/payment.css"/>
    </head>

	<body>

	<?php
		if (isset($_GET['success'])) {
	?>
			<div class='successBar'>
				your donation was successfully aquired, waiting for paypal to validate the transaction it may take from few seconds to an hour, thank you.
			</div>
	<?php
		};
	?>	

	<?php
		if (isset($_GET['cancel'])) {
	?>
			<div class='errorBar'>
				your transaction was cancelled :/<br>
			</div>
	<?php
		};
	?>


        <div class="container-fluid action-bar">
			<div class="row">
				<div class="col-sm-1"></div>
				<div class="col-sm-10">
					<div class="row">
						<div class="col-sm-5">
							<label class="site-path-label">
								<a href="../"><?php echo $STRINGS["actionbar_path_dashboard"]?></a>
                                &#62; <a href="./">Donate</a>
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
									<a class="dropdown-item" href="./"><?php echo $STRINGS["actionbar_user_points"]?>: 
										<?php
											echo $user["points"];
										?>
									</a>

									<div class="dropdown-divider"></div>
									<a class="dropdown-item user-action-join-discord" href="<?php echo $supportDiscordServerLink?>" target="_blank"><?php echo $STRINGS["actionbar_user_Join_Support_Server"]?></a>
									<a class="dropdown-item user-action-donate" href="./donate.php">Donate ❤️</a>
									<div class="dropdown-divider"></div>
									<a class="dropdown-item text-danger" href="../../php/discord.php?login=1"><?php echo $STRINGS["actionbar_user_Disconnect"]?></a>
								</div>

							</div>
						</div>

						<div class="col-sm-1 user-profile">
							<div class="dropdown dropdown-menu-right">
								<label class="dropdown-toggle user-profile-name" id="profile-button" data-toggle="dropdown">
										<image src='../../assets/images/flags/<?php echo $_COOKIE["lang"]?>.png' class='flag-logo'></image> 
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
											echo "\"href=\"../../php/language.php?lang=" . $languageCode . "\"> ";
											echo "<image src='../../assets/images/flags/" . $languageCode . ".png' class='flag-logo'></image>";
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






		<div class="container main-div">
			<div class="container donate-list-div">

		<?php
			if ($paypal_debug) {
				echo "
				<div class=\"alert alert-warning\" role=\"alert\">
					the donation system is in <b>DEBUG MODE</b> right now, if you want to donate please contact us on <a href=".  $supportDiscordServerLink . " target=\"_blank\">Our Discord</a> thank you. 
				</div>
				";
		?>
				<form class="form-horizontal" action="https://sandbox.paypal.com/cgi-bin/webscr" method="post">
					<input type="hidden" name="business" value="<?php echo $paypal_email_debug;?>">
		<?php
			} else {
		?>
				<form class="form-horizontal" action="https://www.paypal.com/cgi-bin/webscr" method="post">
					<input type="hidden" name="business" value="<?php echo $paypal_email;?>">
		<?php
			}
		?>
					<!-- <input type="hidden" name="cmd" value="_donations"> -->
					<input type="hidden" name="cmd" value="_xclick">

					<input id="form_amount_element" type="hidden" name="amount" value="5.00">
					<input type="hidden" name="currency_code" value="USD">
					<input type="hidden" name="item_name" value="Donation to Game Status Bot">
					<!-- <input type="hidden" name="notify_url" value="<?php echo $webPanel . "php/Paypal.php";?>"> -->
					<input type="hidden" name="notify_url" value="<?php echo "https://gamestatus.xyz/php/Paypal.php";?>">

					<input type="hidden" name="custom" value="<?php echo $_SESSION['user_id']?>">

					<input type="hidden" name="return" value="<?php echo $webPanel . "dashboard/payment/donate.php?success";?>">
					<input type="hidden" name="cancel_return" value="<?php echo $webPanel . "dashboard/payment/donate.php?cancel";?>">

					<input id="require-address" type="hidden" name="no_shipping" value="1">



					<div class="form-group">
						<h4>Donate:</h4>
						<button type="button" class="btn btn-outline-primary btn-lg donation-ammount-button" onclick="setDonationValue(0, this)">0$</button>
						<button type="button" class="btn btn-outline-primary btn-lg donation-ammount-button" onclick="setDonationValue(3, this)">3$</button>
						<button type="button" class="btn btn-outline-primary btn-lg donation-ammount-button" onclick="setDonationValue(5, this)">5$</button>
						<button type="button" class="btn btn-outline-primary btn-lg donation-ammount-button" onclick="setDonationValue(10, this)">10$</button>
						<!-- <button type="button" class="btn btn-outline-primary btn-lg donation-ammount-button" onclick="setDonationValue(500, this)">500$</button> -->
						<br>
						
						<h5>Custom:</h5>
						<input id="donation_custom_input" type="number" step="0.01" class="form-control custom-donation-input btn-lg" value="0">

						<br><br><br>
						<h3>Total: <label id="total_donation_ammount">0</label>$</h3>
					


						<div class="continueToPaypal">
							<p class="donation-only-text"></p>
							<!-- <button  class='btn btn-default link-paypal-btn' type="submit" disabled><i class='fab fa-paypal'></i> Continue with PayPal</i></button>-->
							<button  class='btn btn-default link-paypal-btn' type="submit"><i class='fab fa-paypal'></i> Continue with PayPal</i></button>
						</div>
					</div>
				</form>

				<p>for this amount <b><label id="donation_label_money">0</label>$</b>, you may get <b><label id="donation_label_points">0</label> points</b>.</p>

			</div>
		
			<div class="" style="color: white;">
				<h4><i class="fas fa-info-circle" style="color: #bb2437;"></i> Disclamer:</h4>
				<p>Remember this is a donation ! please do not expect any counterpart from us, we cannot garantee our servers will be up forever, you have 21 days to ask for a refund on our <a href="<?php echo $supportDiscordServerLink;?>" target=\"_blank\" style="color: white; opacity: 0.5;">Official Discord</a>, if you want your money back.</p>
			</div>

		</div>




		<script>
			var points_prices = <?php 
				echo "[";
				foreach ($points_prices as $value) {
					echo "[" . $value[0] . ", " . $value[1] . "],";
				};
				echo "]";
			?>;

			var form_amount = document.getElementById("form_amount_element");
			var donation_label_money = document.getElementById("donation_label_money");
			var donation_label_points = document.getElementById("donation_label_points");
			function updateTotalValue() {
				donation_label_points.innerHTML = 0;

				// set donaton value
				total = donation_custom_value + donation_value;
				if (total < 0) total = 0;
				total_label.innerHTML = total;

				// set form value
				form_amount.value = total;
				donation_label_money.innerHTML = total;

				for (var i = 0; i < points_prices.length; i++) {
					if (total >= points_prices[i][0]) {
						donation_label_points.innerHTML = points_prices[i][1];
					};
				};
			};

			var active_button = undefined;
			function setDonationValue(value, el) {
				// set new selected button
				if (active_button != undefined) active_button.classList.remove("active");
				active_button = el;
				el.classList.add("active");
				
				// set donaton value
				donation_value = Number.parseFloat(value);

				updateTotalValue();
			};

			var custom_input = document.getElementById("donation_custom_input");
			var total_label = document.getElementById("total_donation_ammount");

			custom_input.addEventListener('input', function (evt) {
				// get new custom donation value
				donation_custom_value = Number.parseFloat(custom_input.value);
				if (!donation_custom_value) {
					donation_custom_value = 0;
				};

				updateTotalValue();
			});

			var donation_value = 0;
			var donation_custom_value = 0;
			var total = 0;

			
        	// enable tooltip
			$(function () {
				$('[data-toggle="tooltip"]').tooltip()
			})

		</script>

        <div id="particles-js">
        <script src="../../js/particles.min.js"></script>
        <script src="../../js/app.js"></script>
    </body>

</html>

