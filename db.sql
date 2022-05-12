-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.24-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.0.0.6468
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for gamestatusbot
DROP DATABASE IF EXISTS `gamestatusbot`;
CREATE DATABASE IF NOT EXISTS `gamestatusbot` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `gamestatusbot`;

-- Dumping structure for table gamestatusbot.bot
DROP TABLE IF EXISTS `bot`;
CREATE TABLE IF NOT EXISTS `bot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Dumping data for table gamestatusbot.bot: ~0 rows (approximately)
DELETE FROM `bot`;
INSERT INTO `bot` (`id`, `status`) VALUES
	(1, 1630391101);

-- Dumping structure for table gamestatusbot.games
DROP TABLE IF EXISTS `games`;
CREATE TABLE IF NOT EXISTS `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` text NOT NULL,
  `name` text NOT NULL,
  `info` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=latin1;

-- Dumping data for table gamestatusbot.games: ~115 rows (approximately)
DELETE FROM `games`;
INSERT INTO `games` (`id`, `type`, `name`, `info`) VALUES
	(1, '7d2d', '7 Days to Die (2013)', NULL),
	(2, 'ageofchivalry', 'Age of Chivalry (2007)', NULL),
	(3, 'aoe2', 'Age of Empires 2 (1999)', NULL),
	(4, 'alienarena', 'Alien Arena (2004)', NULL),
	(5, 'alienswarm', 'Alien Swarm (2010)', NULL),
	(6, 'avp2', 'Aliens versus Predator 2 (2001)', NULL),
	(7, 'avp2010', 'Aliens vs. Predator (2010)', NULL),
	(8, 'americasarmy', 'America\'s Army (2002)', NULL),
	(9, 'americasarmy2', 'America\'s Army 2 (2003)', NULL),
	(10, 'americasarmy3', 'America\'s Army 3 (2009)', NULL),
	(11, 'americasarmypg', 'America\'s Army: Proving Grounds (2015)', NULL),
	(12, 'arcasimracing', 'Arca Sim Racing (2008)', NULL),
	(13, 'arkse', 'Ark: Survival Evolved (2017)', 'For ark you need to use the query port not the game port, you should find it on your server\'s config or on your host\'s panel.'),
	(14, 'arma2', 'ARMA 2 (2009)', NULL),
	(15, 'arma2oa', 'ARMA 2: Operation Arrowhead (2010)', NULL),
	(16, 'arma3', 'ARMA 3 (2013)', NULL),
	(17, 'arma', 'ARMA: Armed Assault (2007)', NULL),
	(18, 'armacwa', 'ARMA: Cold War Assault (2011)', NULL),
	(19, 'armar', 'ARMA: Resistance (2011)', NULL),
	(20, 'armagetron', 'Armagetron Advanced (2001)', NULL),
	(21, 'assettocorsa', 'Assetto Corsa (2014)', NULL),
	(22, 'atlas', 'Atlas (2018)', NULL),
	(23, 'baldursgate', 'Baldur\'s Gate (1998)', NULL),
	(24, 'bat1944', 'Battalion 1944 (2018)', NULL),
	(25, 'bf1942', 'Battlefield 1942 (2002)', NULL),
	(26, 'bf2', 'Battlefield 2 (2005)', NULL),
	(27, 'bf2142', 'Battlefield 2142 (2006)', NULL),
	(28, 'bf3', 'Battlefield 3 (2011)', NULL),
	(29, 'bf4', 'Battlefield 4 (2013)', NULL),
	(30, 'bfh', 'Battlefield Hardline (2015)', NULL),
	(31, 'bfv', 'Battlefield Vietnam (2004)', NULL),
	(32, 'bfbc2', 'Battlefield: Bad Company 2 (2010)', NULL),
	(33, 'breach', 'Breach (2011)', NULL),
	(34, 'breed', 'Breed (2004)', NULL),
	(35, 'brink', 'Brink (2011)', NULL),
	(36, 'buildandshoot', 'Build and Shoot / Ace of Spades Classic (2012)', NULL),
	(37, 'cod', 'Call of Duty (2003)', NULL),
	(38, 'cod2', 'Call of Duty 2 (2005)', NULL),
	(39, 'cod3', 'Call of Duty 3 (2006)', NULL),
	(40, 'cod4', 'Call of Duty 4: Modern Warfare (2007)', NULL),
	(41, 'codmw2', 'Call of Duty: Modern Warfare 2 (2009)', NULL),
	(42, 'codmw3', 'Call of Duty: Modern Warfare 3 (2011)', NULL),
	(43, 'coduo', 'Call of Duty: United Offensive (2004)', NULL),
	(44, 'codwaw', 'Call of Duty: World at War (2008)', NULL),
	(45, 'callofjuarez', 'Call of Juarez (2006)', NULL),
	(46, 'chaser', 'Chaser (2003)', NULL),
	(47, 'chrome', 'Chrome (2003)', NULL),
	(48, 'codenameeagle', 'Codename Eagle (2000)', NULL),
	(49, 'cacrenegade', 'Command and Conquer: Renegade (2002)', NULL),
	(50, 'commandos3', 'Commandos 3: Destination Berlin (2003)', NULL),
	(51, 'conanexiles', 'Conan Exiles (2018)', NULL),
	(52, 'contagion', 'Contagion (2011)', NULL),
	(53, 'contactjack', 'Contract J.A.C.K. (2003)', NULL),
	(54, 'cs15', 'Counter-Strike 1.5 (2002)', NULL),
	(55, 'cs16', 'Counter-Strike 1.6 (2003)', NULL),
	(56, 'cs2d', 'Counter-Strike: 2D (2004)', NULL),
	(57, 'cscz', 'Counter-Strike: Condition Zero (2004)', NULL),
	(58, 'csgo', 'Counter-Strike: Global Offensive (2012)', 'To receive a full player list response from CS:GO servers, the server must have set the cvar: host_players_show 2'),
	(59, 'css', 'Counter-Strike: Source (2004)', NULL),
	(60, 'crossracing', 'Cross Racing Championship Extreme 2005 (2005)', NULL),
	(61, 'crysis', 'Crysis (2007)', NULL),
	(62, 'crysis2', 'Crysis 2 (2011)', NULL),
	(63, 'crysiswars', 'Crysis Wars (2008)', NULL),
	(64, 'daikatana', 'Daikatana (2000)', NULL),
	(65, 'dnl', 'Dark and Light (2017)', NULL),
	(66, 'dmomam', 'Dark Messiah of Might and Magic (2006)', NULL),
	(67, 'darkesthour', 'Darkest Hour: Europe \'44-\'45 (2008)', NULL),
	(68, 'dod', 'Day of Defeat (2003)', NULL),
	(69, 'dods', 'Day of Defeat: Source (2005)', NULL),
	(70, 'doi', 'Day of Infamy (2017)', NULL),
	(71, 'daysofwar', 'Days of War (2017)', NULL),
	(72, 'dayz', 'DayZ (2018)', NULL),
	(73, 'dayzmod', 'DayZ Mod (2013)', NULL),
	(74, 'deadlydozenpt', 'Deadly Dozen: Pacific Theater (2002)', NULL),
	(75, 'dh2005', 'Deer Hunter 2005 (2004)', NULL),
	(76, 'descent3', 'Descent 3 (1999)', NULL),
	(77, 'deusex', 'Deus Ex (2000)', NULL),
	(78, 'devastation', 'Devastation (2003)', NULL),
	(79, 'dinodday', 'Dino D-Day (2011)', NULL),
	(80, 'dirttrackracing2', 'Dirt Track Racing 2 (2002)', NULL),
	(81, 'doom3', 'Doom 3 (2004)', NULL),
	(82, 'dota2', 'Dota 2 (2013)', NULL),
	(83, 'drakan', 'Drakan: Order of the Flame (1999)', NULL),
	(84, 'empyrion', 'Empyrion - Galactic Survival (2015)', NULL),
	(85, 'etqw', 'Enemy Territory: Quake Wars (2007)', NULL),
	(86, 'fear', 'F.E.A.R. (2005)', NULL),
	(87, 'f1c9902', 'F1 Challenge \'99-\'02 (2002)', NULL),
	(88, 'farcry', 'Far Cry (2004)', NULL),
	(89, 'farcry2', 'Far Cry 2 (2008)', NULL),
	(90, 'f12002', 'Formula One 2002 (2002)', NULL),
	(91, 'fortressforever', 'Fortress Forever (2007)', NULL),
	(92, 'ffow', 'Frontlines: Fuel of War (2008)', NULL),
	(93, 'garrysmod', 'Garry\'s Mod (2004)', NULL),
	(94, 'geneshift', 'Geneshift (2017)', NULL),
	(95, 'giantscitizenkabuto', 'Giants: Citizen Kabuto (2000)', NULL),
	(96, 'globaloperations', 'Global Operations (2002)', NULL),
	(97, 'ges', 'GoldenEye: Source (2010)', NULL),
	(98, 'gore', 'Gore: Ultimate Soldier (2002)', NULL),
	(99, 'fivem', 'Grand Theft Auto V - FiveM (2013)', 'you need your rcon to be enabled, for that just set rcon_password on your server.conf, keep your password safe the bot doesn\'t need it, it just need your rcon to be enabled.'),
	(100, 'mtasa', 'Grand Theft Auto: San Andreas - Multi Theft Auto (2004)', NULL),
	(101, 'mtavc', 'Grand Theft Auto: Vice City - Multi Theft Auto (2002)', NULL),
	(102, 'gunmanchronicles', 'Gunman Chronicles (2000)', NULL),
	(103, 'hl2dm', 'Half-Life 2: Deathmatch (2004)', NULL),
	(104, 'hldm', 'Half-Life Deathmatch (1998)', NULL),
	(105, 'hldms', 'Half-Life Deathmatch: Source (2005)', NULL),
	(106, 'halo', 'Halo (2003)', NULL),
	(107, 'halo2', 'Halo 2 (2007)', NULL),
	(108, 'hll', 'Hell Let Loose', 'please add the query port on your server\'s config.'),
	(109, 'heretic2', 'Heretic II (1998)', NULL),
	(110, 'hexen2', 'Hexen II (1997)', NULL),
	(111, 'had2', 'Hidden & Dangerous 2 (2003)', NULL),
	(112, 'homefront', 'Homefront (2011)', NULL),
	(113, 'homeworld2', 'Homeworld 2 (2003)', NULL),
	(114, 'hurtworld', 'Hurtworld (2015)', NULL),
	(115, 'igi2', 'I.G.I.-2: Covert Strike (2003)', NULL),
	(116, 'il2', 'IL-2 Sturmovik (2001)', NULL),
	(117, 'insurgency', 'Insurgency (2014)', NULL),
	(118, 'insurgencysandstorm', 'Insurgency: Sandstorm (2018)', NULL),
	(119, 'ironstorm', 'Iron Storm (2002)', NULL),
	(120, 'jamesbondnightfire', 'James Bond 007: Nightfire (2002)', NULL),
	(121, 'jc2mp', 'Just Cause 2 - Multiplayer (2010)', NULL),
	(122, 'jc3mp', 'Just Cause 3 - Multiplayer (2017)', NULL),
	(123, 'kspdmp', 'Kerbal Space Program - DMP Multiplayer (2015)', NULL),
	(124, 'killingfloor', 'Killing Floor (2009)', NULL),
	(125, 'killingfloor2', 'Killing Floor 2 (2016)', NULL),
	(126, 'kingpin', 'Kingpin: Life of Crime (1999)', NULL),
	(127, 'kisspc', 'Kiss: Psycho Circus: The Nightmare Child (2000)', NULL),
	(128, 'kzmod', 'Kreedz Climbing (2017)', NULL),
	(129, 'left4dead', 'Left 4 Dead (2008)', NULL),
	(130, 'left4dead2', 'Left 4 Dead 2 (2009)', NULL),
	(131, 'm2mp', 'Mafia II - Multiplayer (2010)', NULL),
	(132, 'm2o', 'Mafia II - Online (2010)', NULL),
	(133, 'moh2010', 'Medal of Honor (2010)', NULL),
	(134, 'mohab', 'Medal of Honor: Airborne (2007)', NULL),
	(135, 'mohaa', 'Medal of Honor: Allied Assault (2002)', NULL),
	(136, 'mohbt', 'Medal of Honor: Allied Assault Breakthrough (2003)', NULL),
	(137, 'mohsh', 'Medal of Honor: Allied Assault Spearhead (2002)', NULL),
	(138, 'mohpa', 'Medal of Honor: Pacific Assault (2004)', NULL),
	(139, 'mohwf', 'Medal of Honor: Warfighter (2012)', NULL),
	(140, 'medievalengineers', 'Medieval Engineers (2015)', NULL),
	(141, 'minecraftping', 'Minecraft ping (2009)', NULL),
	(142, 'minecraft', 'Minecraft (2009)', NULL),
	(143, 'minecraftbe', 'Minecraft: Bedrock Edition (2011)', NULL),
	(144, 'minecraftpe', 'Minecraft: Pocket Edition (2011)', NULL),
	(145, 'mnc', 'Monday Night Combat (2011)', NULL),
	(146, 'mordhau', 'Mordhau (2019)', NULL),
	(147, 'mumble', 'Mumble - GTmurmur Plugin (2005)', 'For full query results from Mumble, you must be running the GTmurmur plugin. If you do not wish to run the plugin, or do not require details such as channel and user lists, you can use the \'Mumble - Lightweight (2005)\' server type instead, which uses a less accurate but more reliable solution'),
	(148, 'mumbleping', 'Mumble - Lightweight (2005)', NULL),
	(149, 'nascarthunder2004', 'NASCAR Thunder 2004 (2003)', NULL),
	(150, 'ns', 'Natural Selection (2002)', NULL),
	(151, 'ns2', 'Natural Selection 2 (2012)', NULL),
	(152, 'nfshp2', 'Need for Speed: Hot Pursuit 2 (2002)', NULL),
	(153, 'nab', 'Nerf Arena Blast (1999)', NULL),
	(154, 'netpanzer', 'netPanzer (2002)', NULL),
	(155, 'nwn', 'Neverwinter Nights (2002)', NULL),
	(156, 'nwn2', 'Neverwinter Nights 2 (2006)', NULL),
	(157, 'nexuiz', 'Nexuiz (2005)', NULL),
	(158, 'nitrofamily', 'Nitro Family (2004)', NULL),
	(159, 'nmrih', 'No More Room in Hell (2011)', NULL),
	(160, 'nolf2', 'No One Lives Forever 2: A Spy in H.A.R.M.\'s Way (2002)', NULL),
	(161, 'nucleardawn', 'Nuclear Dawn (2011)', NULL),
	(162, 'openarena', 'OpenArena (2005)', NULL),
	(163, 'openttd', 'OpenTTD (2004)', NULL),
	(164, 'operationflashpoint', 'Operation Flashpoint: Cold War Crisis (2001)', NULL),
	(165, 'flashpoint', 'Operation Flashpoint: Cold War Crisis (2001)', NULL),
	(166, 'flashpointresistance', 'Operation Flashpoint: Resistance (2002)', NULL),
	(167, 'painkiller', 'Painkiller', NULL),
	(168, 'pixark', 'PixARK (2018)', NULL),
	(169, 'postal2', 'Postal 2', NULL),
	(170, 'prey', 'Prey', NULL),
	(171, 'primalcarnage', 'Primal Carnage: Extinction', NULL),
	(172, 'prbf2', 'Project Reality: Battlefield 2 (2005)', NULL),
	(173, 'quake1', 'Quake 1: QuakeWorld (1996)', NULL),
	(174, 'quake2', 'Quake 2 (1997)', NULL),
	(175, 'quake3', 'Quake 3: Arena (1999)', NULL),
	(176, 'quake4', 'Quake 4 (2005)', NULL),
	(177, 'quakelive', 'Quake Live (2010)', NULL),
	(178, 'ragdollkungfu', 'Rag Doll Kung Fu', NULL),
	(179, 'r6', 'Rainbow Six', NULL),
	(180, 'r6roguespear', 'Rainbow Six 2: Rogue Spear', NULL),
	(181, 'r6ravenshield', 'Rainbow Six 3: Raven Shield', NULL),
	(182, 'rallisportchallenge', 'RalliSport Challenge', NULL),
	(183, 'rallymasters', 'Rally Masters', NULL),
	(184, 'redorchestra', 'Red Orchestra', NULL),
	(185, 'redorchestra2', 'Red Orchestra 2', NULL),
	(186, 'redorchestraost', 'Red Orchestra: Ostfront 41-45', NULL),
	(187, 'redline', 'Redline', NULL),
	(188, 'rtcw', 'Return to Castle Wolfenstein', NULL),
	(189, 'rfactor', 'rFactor', NULL),
	(190, 'ricochet', 'Ricochet', NULL),
	(191, 'riseofnations', 'Rise of Nations', NULL),
	(192, 'rs2', 'Rising Storm 2: Vietnam', NULL),
	(193, 'rune', 'Rune', NULL),
	(194, 'rust', 'Rust', NULL),
	(195, 'stalker', 'S.T.A.L.K.E.R.', NULL),
	(196, 'samp', 'Grand Theft Auto: San Andreas Multiplayer SA-MP', NULL),
	(197, 'ss', 'Serious Sam', NULL),
	(198, 'ss2', 'Serious Sam 2', NULL),
	(199, 'shatteredhorizon', 'Shattered Horizon', NULL),
	(200, 'shogo', 'Shogo', NULL),
	(201, 'shootmania', 'Shootmania', 'The server must have xmlrpc enabled, and you must pass the xmlrpc port, not the connection port. You must have a user account on the server with access level User or higher. please contact us on our discord for more informations.'),
	(202, 'sin', 'SiN', NULL),
	(203, 'sinep', 'SiN Episodes', NULL),
	(204, 'soldat', 'Soldat', NULL),
	(205, 'sof', 'Soldier of Fortune', NULL),
	(206, 'sof2', 'Soldier of Fortune 2', NULL),
	(207, 'spaceengineers', 'Space Engineers', NULL),
	(208, 'squad', 'Squad', NULL),
	(209, 'stbc', 'Star Trek: Bridge Commander', NULL),
	(210, 'stvef', 'Star Trek: Voyager - Elite Force', NULL),
	(211, 'stvef2', 'Star Trek: Voyager - Elite Force 2', NULL),
	(212, 'swjk2', 'Star Wars Jedi Knight II: Jedi Outcast (2002)', NULL),
	(213, 'swjk', 'Star Wars Jedi Knight: Jedi Academy (2003)', NULL),
	(214, 'swbf', 'Star Wars: Battlefront', NULL),
	(215, 'swbf2', 'Star Wars: Battlefront 2', NULL),
	(216, 'swrc', 'Star Wars: Republic Commando', NULL),
	(217, 'starbound', 'Starbound', NULL),
	(218, 'starmade', 'StarMade', NULL),
	(219, 'starsiege', 'Starsiege (2009)', NULL),
	(220, 'suicidesurvival', 'Suicide Survival', NULL),
	(221, 'svencoop', 'Sven Coop', NULL),
	(222, 'swat4', 'SWAT 4', NULL),
	(223, 'synergy', 'Synergy', NULL),
	(224, 'tacticalops', 'Tactical Ops', NULL),
	(225, 'takeonhelicopters', 'Take On Helicopters (2011)', NULL),
	(226, 'teamfactor', 'Team Factor', NULL),
	(227, 'tf2', 'Team Fortress 2', NULL),
	(228, 'tfc', 'Team Fortress Classic', NULL),
	(229, 'teamspeak2', 'Teamspeak 2', NULL),
	(230, 'teamspeak3', 'Teamspeak 3', 'For teamspeak 3 queries to work correctly, the following permissions must be available for the guest server group:<br>\r\nVirtual Server:\r\n<ul>\r\n	<li>b_virtualserver_info_view</li>\r\n	<li>b_virtualserver_channel_list</li>\r\n	<li>b_virtualserver_client_list</li>\r\n</ul>\r\nGroup:\r\n<ul>\r\n	<li>b_virtualserver_servergroup_list</li>\r\n	<li>b_virtualserver_channelgroup_list</li>\r\n</ul>'),
	(231, 'terminus', 'Terminus', NULL),
	(232, 'terraria', 'Terraria (2011)', ''),
	(233, 'tshock', 'Terraria - TShock (2011)', NULL),
	(234, 'forrest', 'The Forest (2014)', NULL),
	(235, 'hidden', 'The Hidden (2005)', NULL),
	(236, 'nolf', 'The Operative: No One Lives Forever (2000)', NULL),
	(237, 'ship', 'The Ship', NULL),
	(238, 'graw', 'Tom Clancy\'s Ghost Recon Advanced Warfighter (2006)', NULL),
	(239, 'graw2', 'Tom Clancy\'s Ghost Recon Advanced Warfighter 2 (2007)', NULL),
	(240, 'thps3', 'Tony Hawk\'s Pro Skater 3', NULL),
	(241, 'thps4', 'Tony Hawk\'s Pro Skater 4', NULL),
	(242, 'thu2', 'Tony Hawk\'s Underground 2', NULL),
	(243, 'towerunite', 'Tower Unite', NULL),
	(244, 'trackmania2', 'Trackmania 2', NULL),
	(245, 'trackmaniaforever', 'Trackmania Forever', NULL),
	(246, 'tremulous', 'Tremulous', NULL),
	(247, 'tribes1', 'Tribes 1: Starsiege', NULL),
	(248, 'tribesvengeance', 'Tribes: Vengeance', NULL),
	(249, 'tron20', 'Tron 2.0', NULL),
	(250, 'turok2', 'Turok 2', NULL),
	(251, 'universalcombat', 'Universal Combat', NULL),
	(252, 'unreal', 'Unreal', NULL),
	(253, 'ut', 'Unreal Tournament', NULL),
	(254, 'ut2003', 'Unreal Tournament 2003', NULL),
	(255, 'ut2004', 'Unreal Tournament 2004', NULL),
	(256, 'ut3', 'Unreal Tournament 3', NULL),
	(257, 'unturned', 'Unturned', NULL),
	(258, 'urbanterror', 'Urban Terror', NULL),
	(259, 'v8supercar', 'V8 Supercar Challenge', NULL),
	(260, 'ventrilo', 'Ventrilo', NULL),
	(261, 'vcmp', 'Vice City Multiplayer', NULL),
	(262, 'vietcong', 'Vietcong', NULL),
	(263, 'vietcong2', 'Vietcong 2', NULL),
	(264, 'warsow', 'Warsow', NULL),
	(265, 'wheeloftime', 'Wheel of Time', NULL),
	(266, 'wolfenstein2009', 'Wolfenstein 2009', NULL),
	(267, 'wolfensteinet', 'Wolfenstein: Enemy Territory', NULL),
	(268, 'xpandrally', 'Xpand Rally', NULL),
	(269, 'zombiemaster', 'Zombie Master', NULL),
	(270, 'zps', 'Zombie Panic: Source', NULL),
	(272, 'ragemp', 'Grand Theft Auto V - RageMP', NULL),
	(273, 'protocol-valve', '# Steam Source Query protocol', NULL),
	(275, 'savage2', 'Savage 2: A Tortured Soul (2008)', NULL),
	(277, 'valheim', 'Valheim', NULL),
	(278, 'protocol-battlefield', '# BattleField Query Protocol', NULL),
	(279, 'protocol-ase', '# ASE Query Protocol', NULL),
	(280, 'protocol-doom3', '# Doom3 Query Protocol', NULL),
	(281, 'protocol-gamespy1', '# GameSpy1 Query Protocol', NULL),
	(282, 'protocol-gamespy2', '# GameSpy2 Query Protocol', NULL),
	(283, 'protocol-gamespy3', '# GameSpy3 Query Protocol', NULL),
	(284, 'protocol-nadeo', '# Nadeo Query Protocol', NULL),
	(285, 'protocol-quake2', '# Quake2 Query Protocol', NULL),
	(286, 'protocol-quake3', '# Quake3 Query Protocol', NULL),
	(287, 'protocol-unreal2', '# Unreal2 Query Protocol', NULL);

-- Dumping structure for table gamestatusbot.guilds
DROP TABLE IF EXISTS `guilds`;
CREATE TABLE IF NOT EXISTS `guilds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guild_id` text NOT NULL,
  `instances` text NOT NULL,
  `level` int(11) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0,
  `join_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5110 DEFAULT CHARSET=latin1;

-- Dumping data for table gamestatusbot.guilds: ~2,662 rows (approximately)
DELETE FROM `guilds`;
INSERT INTO `guilds` (`id`, `guild_id`, `instances`, `level`, `points`, `join_date`) VALUES
	(151, '730060387679993916', '["BlRgH4YKcHQ7aqY"]', 5, 0, '2021-02-20 22:33:10');

-- Dumping structure for table gamestatusbot.instances
DROP TABLE IF EXISTS `instances`;
CREATE TABLE IF NOT EXISTS `instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instance_id` text DEFAULT NULL,
  `error` int(11) DEFAULT -1,
  `started` int(11) DEFAULT 0,
  `name` text DEFAULT NULL,
  `channel` text DEFAULT NULL,
  `host` text DEFAULT NULL,
  `port` text DEFAULT NULL,
  `game` text DEFAULT NULL,
  `graph` int(11) DEFAULT 1,
  `hide_ip` int(11) DEFAULT 0,
  `hide_port` int(11) DEFAULT 0,
  `playerlist` int(11) DEFAULT 1,
  `full_playerlist` int(11) DEFAULT 0,
  `timezone` int(11) DEFAULT 14,
  `timeformat` int(11) DEFAULT 0,
  `minimal` int(11) DEFAULT 0,
  `logo` text DEFAULT NULL,
  `language` text DEFAULT NULL,
  `color` text DEFAULT NULL,
  `refresh_rate` int(11) DEFAULT 0,
  `custom_field` text DEFAULT NULL,
  `create_date` timestamp NULL DEFAULT current_timestamp(),
  `edit_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9898 DEFAULT CHARSET=latin1;

-- Dumping data for table gamestatusbot.instances: ~4,044 rows (approximately)
DELETE FROM `instances`;
INSERT INTO `instances` (`id`, `instance_id`, `error`, `started`, `name`, `channel`, `host`, `port`, `game`, `graph`, `hide_ip`, `hide_port`, `playerlist`, `full_playerlist`, `timezone`, `timeformat`, `minimal`, `logo`, `language`, `color`, `refresh_rate`, `custom_field`, `create_date`, `edit_date`) VALUES
	(236, 'BlRgH4YKcHQ7aqY', -1, 1, 'GTA FiveM server', '781247669564604427', 'localhost', '30120', 'fivem', 1, 1, 0, 1, 0, 14, 1, 0, 'https://images-ext-1.discordapp.net/external/2TlQdN53PQqxVFVzI62TFQbzQ3OBC-Tm-VjtYMbJDyg/https/logodix.com/logo/1609859.jpg', 'EN', '#0059ff', 0, NULL, '2021-02-20 22:33:45', '2022-05-12 10:18:02');

-- Dumping structure for table gamestatusbot.logs
DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` text NOT NULL,
  `log` text NOT NULL,
  `user_id` text NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=latin1;

-- Dumping data for table gamestatusbot.logs: ~0 rows (approximately)
DELETE FROM `logs`;
INSERT INTO `logs` (`id`, `type`, `log`, `user_id`, `date`) VALUES
	(2, 'server points transfer', 'transfered 2 points to server 753946332766404689', '329777395307511818', '2021-05-23 20:06:19');

-- Dumping structure for table gamestatusbot.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` text NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `is_self_hosted` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`(18))
) ENGINE=InnoDB AUTO_INCREMENT=525 DEFAULT CHARSET=latin1;

-- Dumping data for table gamestatusbot.users: ~0 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `user_id`, `points`, `is_self_hosted`) VALUES
	(221, '329777395307511818', 500, 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
