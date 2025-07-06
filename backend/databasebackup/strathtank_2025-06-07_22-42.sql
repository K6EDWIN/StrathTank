-- MySQL dump 10.13  Distrib 5.7.24, for Win64 (x86_64)
--
-- Host: localhost    Database: strathtank
-- ------------------------------------------------------
-- Server version	5.7.24

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `collaboration_messages`
--

DROP TABLE IF EXISTS `collaboration_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collaboration_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `collaboration_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `collaboration_id` (`collaboration_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `collaboration_messages_ibfk_1` FOREIGN KEY (`collaboration_id`) REFERENCES `collaborations` (`id`),
  CONSTRAINT `collaboration_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaboration_messages`
--

LOCK TABLES `collaboration_messages` WRITE;
/*!40000 ALTER TABLE `collaboration_messages` DISABLE KEYS */;
INSERT INTO `collaboration_messages` VALUES (1,22,24,'hi','2025-07-06 18:10:42'),(2,27,24,'hi','2025-07-06 18:30:31'),(3,27,50,'hi','2025-07-06 18:50:02'),(4,27,50,'hi','2025-07-06 18:51:28'),(5,27,50,'hi','2025-07-06 19:09:15'),(6,27,50,'eee','2025-07-06 19:23:42'),(7,27,50,'vsdvvvf','2025-07-06 19:35:17');
/*!40000 ALTER TABLE `collaboration_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaborations`
--

DROP TABLE IF EXISTS `collaborations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collaborations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `collaborator_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `collaborator_id` (`collaborator_id`),
  CONSTRAINT `collaborations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `collaborations_ibfk_2` FOREIGN KEY (`collaborator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborations`
--

LOCK TABLES `collaborations` WRITE;
/*!40000 ALTER TABLE `collaborations` DISABLE KEYS */;
INSERT INTO `collaborations` VALUES (21,18,24,'declined','2025-06-25 11:55:32'),(22,5,24,'pending','2025-06-25 11:55:32'),(23,18,34,'pending','2025-06-25 11:56:24'),(25,17,24,'pending','2025-07-06 12:40:42'),(26,5,33,'accepted','2025-07-06 12:46:51'),(27,5,50,'accepted','2025-07-06 18:29:13');
/*!40000 ALTER TABLE `collaborations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,2,'Looking forward to improving the attendance system further.','2025-06-02 05:05:00',NULL),(2,2,2,'Proud of the progress on this agriculture platform!','2025-06-02 05:35:00',NULL),(3,3,4,'This AI bot can really help with basic medical queries.','2025-06-03 06:05:00',NULL),(4,4,4,'Still optimizing the energy tracking algorithms.','2025-06-04 07:05:00',NULL),(5,5,5,'Excited to see how matatu operators respond.','2025-06-05 07:35:00',NULL),(6,6,6,'We’ll be testing budgeting features with students soon.','2025-06-06 08:05:00',NULL),(7,7,14,'Hope this platform helps students collaborate better.','2025-06-07 09:05:00',NULL),(8,8,14,'We are working on mapping more waste locations in Nairobi.','2025-06-08 10:05:00',NULL),(9,1,4,'Great work!','2025-06-13 09:52:29',NULL),(10,2,4,'Great work!','2025-06-13 09:52:29',NULL),(11,2,5,'Very innovative!','2025-06-13 09:52:29',NULL),(12,3,2,'Great work!','2025-06-13 09:52:29',NULL),(13,3,5,'Very innovative!','2025-06-13 09:52:29',NULL),(14,3,6,'Looks promising.','2025-06-13 09:52:29',NULL),(15,4,2,'Great work!','2025-06-13 09:52:29',NULL),(16,4,5,'Very innovative!','2025-06-13 09:52:29',NULL),(17,4,6,'Looks promising.','2025-06-13 09:52:29',NULL),(18,4,14,'Nice concept.','2025-06-13 09:52:29',NULL),(19,5,2,'Great work!','2025-06-13 09:52:29',NULL),(20,5,4,'Very innovative!','2025-06-13 09:52:29',NULL),(21,5,6,'Looks promising.','2025-06-13 09:52:29',NULL),(22,5,14,'Nice concept.','2025-06-13 09:52:29',NULL),(24,6,2,'Great work!','2025-06-13 09:52:29',NULL),(25,6,4,'Very innovative!','2025-06-13 09:52:29',NULL),(26,6,5,'Looks promising.','2025-06-13 09:52:29',NULL),(27,6,14,'Nice concept.','2025-06-13 09:52:29',NULL),(28,6,17,'How can I contribute?','2025-06-13 09:52:29',NULL),(30,7,2,'Great work!','2025-06-13 09:52:29',NULL),(31,7,4,'Very innovative!','2025-06-13 09:52:29',NULL),(32,7,5,'Looks promising.','2025-06-13 09:52:29',NULL),(33,7,6,'Nice concept.','2025-06-13 09:52:29',NULL),(34,7,17,'How can I contribute?','2025-06-13 09:52:29',NULL),(37,8,2,'Great work!','2025-06-13 09:52:29',NULL),(38,8,4,'Very innovative!','2025-06-13 09:52:29',NULL),(39,8,5,'Looks promising.','2025-06-13 09:52:29',NULL),(40,8,6,'Nice concept.','2025-06-13 09:52:29',NULL),(41,8,17,'How can I contribute?','2025-06-13 09:52:29',NULL),(44,8,23,'Clean UI!','2025-06-13 09:52:29',NULL),(46,5,23,'oh well','2025-06-17 17:42:13',NULL),(48,9,23,'interesting','2025-06-18 09:53:21',NULL),(49,5,26,'huh','2025-06-22 16:48:53',NULL),(50,17,24,'eyooo\n','2025-06-22 19:45:54',NULL),(51,17,24,'oh well','2025-06-23 09:25:24',NULL),(53,18,24,'oh well','2025-06-24 23:17:15',NULL),(56,18,24,'huh','2025-06-24 23:30:37',NULL),(57,18,24,'well','2025-06-24 23:35:53',NULL),(58,18,24,'wow','2025-06-24 23:41:11',NULL),(59,18,24,'oh well','2025-06-24 23:44:49',NULL),(60,18,24,'huh','2025-06-24 23:45:10',NULL),(61,18,24,'well','2025-06-24 23:46:55',NULL),(62,17,24,'huh','2025-06-24 23:57:33',NULL),(63,18,24,'huh','2025-06-24 23:59:13',61),(64,18,24,'well','2025-06-25 00:06:39',60),(65,18,24,'wwelllllllllllllllllllllll','2025-06-25 00:18:37',64),(66,18,24,'wekk\'','2025-06-25 07:57:21',65),(67,18,24,'yeaaaaahhhhhhhhhhhhhhhhhhhh','2025-06-25 08:03:03',61),(68,18,24,'yeahhhhhhhhhhhhhhhhhhhhhhhhh','2025-06-25 08:03:12',67),(69,5,34,'heh','2025-06-25 10:47:13',52),(71,18,17,'gffffffg','2025-06-25 11:01:02',NULL),(75,5,17,'yea','2025-07-04 14:31:46',70),(76,18,24,'well','2025-07-04 18:53:55',NULL),(77,5,24,'thats nice','2025-07-04 19:10:52',52),(78,17,24,'technologia','2025-07-04 19:22:05',74),(79,5,24,'yea boii','2025-07-04 19:28:49',49),(81,5,24,'same to be honest','2025-07-04 19:31:17',5),(82,9,34,'ikr','2025-07-04 19:33:05',48),(84,1,17,'indeed','2025-07-04 19:36:39',9),(85,5,17,'well done','2025-07-06 08:55:32',49);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `comments_after_insert` AFTER INSERT ON `comments` FOR EACH ROW CALL update_project_interactions() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `comments_after_delete` AFTER DELETE ON `comments` FOR EACH ROW CALL update_project_interactions() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `flaggedprojects`
--

DROP TABLE IF EXISTS `flaggedprojects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `flaggedprojects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `flagged_by` int(11) DEFAULT NULL,
  `flag_reason` text,
  `flagged_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `flagged_by` (`flagged_by`),
  CONSTRAINT `flaggedprojects_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `flaggedprojects_ibfk_2` FOREIGN KEY (`flagged_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flaggedprojects`
--

LOCK TABLES `flaggedprojects` WRITE;
/*!40000 ALTER TABLE `flaggedprojects` DISABLE KEYS */;
INSERT INTO `flaggedprojects` VALUES (1,18,'smart',24,'plagiarism','2025-06-24 21:03:49'),(2,18,'smart',24,'used plagiarised content','2025-06-24 21:09:49'),(3,5,'QuickMatatu Booking',24,'its too good','2025-06-24 21:28:08'),(4,17,'EcoFuel: Converting Kitchen Waste to Biogas',24,'plagiarism','2025-07-06 12:51:47'),(5,17,'EcoFuel: Converting Kitchen Waste to Biogas',24,'plagiarism','2025-07-06 12:52:25');
/*!40000 ALTER TABLE `flaggedprojects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `github_metadata`
--

DROP TABLE IF EXISTS `github_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `github_metadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `repo_url` varchar(255) NOT NULL,
  `stars` int(11) DEFAULT '0',
  `forks` int(11) DEFAULT '0',
  `last_synced_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `github_metadata_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `github_metadata`
--

LOCK TABLES `github_metadata` WRITE;
/*!40000 ALTER TABLE `github_metadata` DISABLE KEYS */;
INSERT INTO `github_metadata` VALUES (1,5,'https://github.com/n-mungai/QuickMatatu.git',0,0,'2025-06-22 17:17:00');
/*!40000 ALTER TABLE `github_metadata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,2,'2025-06-02 05:00:00'),(2,2,2,'2025-06-02 05:30:00'),(3,3,4,'2025-06-03 06:00:00'),(4,4,4,'2025-06-04 07:00:00'),(5,5,5,'2025-06-05 07:30:00'),(6,6,6,'2025-06-06 08:00:00'),(7,7,14,'2025-06-07 09:00:00'),(8,8,14,'2025-06-08 10:00:00'),(10,1,2,'2025-06-11 05:00:00'),(11,1,4,'2025-06-11 05:01:00'),(12,1,5,'2025-06-11 05:02:00'),(13,1,6,'2025-06-11 05:03:00'),(14,1,14,'2025-06-11 05:04:00'),(15,3,17,'2025-06-11 06:00:00'),(18,3,23,'2025-06-11 06:03:00'),(19,3,24,'2025-06-11 06:04:00'),(20,3,25,'2025-06-11 06:05:00'),(21,3,26,'2025-06-11 06:06:00'),(22,6,32,'2025-06-11 07:00:00'),(23,6,33,'2025-06-11 07:01:00'),(24,6,2,'2025-06-11 07:02:00'),(25,6,4,'2025-06-11 07:03:00'),(26,6,5,'2025-06-11 07:04:00'),(27,6,6,'2025-06-11 07:05:00'),(28,6,14,'2025-06-11 07:06:00'),(29,6,17,'2025-06-11 07:07:00'),(58,5,23,'2025-06-17 21:27:02'),(59,9,23,'2025-06-18 09:53:08'),(60,5,26,'2025-06-22 16:48:38'),(61,6,24,'2025-06-22 18:00:25'),(62,17,24,'2025-06-23 09:25:31'),(63,18,17,'2025-06-24 20:43:44'),(73,1,24,'2025-06-24 21:54:31'),(78,9,17,'2025-07-04 17:51:17'),(79,5,24,'2025-07-06 12:56:19');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `likes_after_insert` AFTER INSERT ON `likes` FOR EACH ROW CALL update_project_interactions() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `likes_after_delete` BEFORE DELETE ON `likes` FOR EACH ROW CALL update_project_interactions() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `mentorship_messages`
--

DROP TABLE IF EXISTS `mentorship_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mentorship_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `sender` enum('mentor','mentee') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `mentorship_messages_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `mentorship_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentorship_messages`
--

LOCK TABLES `mentorship_messages` WRITE;
/*!40000 ALTER TABLE `mentorship_messages` DISABLE KEYS */;
INSERT INTO `mentorship_messages` VALUES (1,5,'mentor','fix it','2025-06-30 10:59:01'),(2,5,'mentor','huh','2025-07-01 11:41:45'),(3,5,'mentee','24','2025-07-01 11:53:39'),(4,5,'mentee','24','2025-07-01 11:53:48'),(5,5,'mentee','24','2025-07-01 11:54:04'),(7,5,'mentee','i will do so sir','2025-07-01 12:21:36'),(8,5,'mentee','Well','2025-07-04 00:48:39'),(9,5,'mentee','Yea boyy','2025-07-04 20:29:19'),(10,3,'mentee','hi','2025-07-05 19:49:27'),(11,8,'mentee','HI','2025-07-06 13:09:22'),(12,8,'mentor','Hi edwin','2025-07-06 13:09:55');
/*!40000 ALTER TABLE `mentorship_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentorship_requests`
--

DROP TABLE IF EXISTS `mentorship_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mentorship_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `mentee_id` int(11) DEFAULT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','assigned') DEFAULT 'pending',
  `feedback` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subject` text,
  `challenge` text,
  `primary_area` varchar(255) DEFAULT NULL,
  `preferred_skills` varchar(255) DEFAULT NULL,
  `availability` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `mentee_id` (`mentee_id`),
  KEY `mentor_id` (`mentor_id`),
  CONSTRAINT `mentorship_requests_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `mentorship_requests_ibfk_2` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `mentorship_requests_ibfk_3` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentorship_requests`
--

LOCK TABLES `mentorship_requests` WRITE;
/*!40000 ALTER TABLE `mentorship_requests` DISABLE KEYS */;
INSERT INTO `mentorship_requests` VALUES (1,1,24,NULL,'pending',NULL,'2025-06-24 11:26:18','questions on ai','dsvdvvsd','Data science',NULL,'weekdays at 5pm'),(2,1,24,NULL,'pending',NULL,'2025-06-24 11:32:25','questions on ai','dvvvv','Data science',NULL,'weekdays at 5pm'),(3,1,24,34,'accepted',NULL,'2025-06-24 11:52:28','questions on ai','cccccdc','Data science',NULL,'weekdays at 5pm'),(4,1,24,34,'accepted',NULL,'2025-06-24 11:55:44','questions on ai','vdasvvdv','Data science','python','weekdays at 5pm'),(5,1,24,34,'accepted','huh','2025-06-29 08:44:41','questions on ai','challengesss','Data science','data science','weekdays at 5pm'),(6,1,24,34,'assigned',NULL,'2025-07-06 13:07:59','questions on data science','i can comprehend data science','Data science','data science','weekdays at 5pm'),(7,1,24,34,'assigned',NULL,'2025-07-06 13:08:01','questions on data science','i can comprehend data science','Data science','data science','weekdays at 5pm'),(8,20,24,34,'assigned','Hi edwin','2025-07-06 13:08:41','questions on data science','xcxca','Data science','data science','weekdays at 5pm');
/*!40000 ALTER TABLE `mentorship_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `mentorship_after_insert` AFTER INSERT ON `mentorship_requests` FOR EACH ROW CALL update_project_interactions() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `mentorship_after_delete` AFTER DELETE ON `mentorship_requests` FOR EACH ROW CALL update_project_interactions() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `moderation_reports`
--

DROP TABLE IF EXISTS `moderation_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `moderation_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `reported_by` int(11) DEFAULT NULL,
  `reason` text,
  `status` enum('open','resolved') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `reported_by` (`reported_by`),
  CONSTRAINT `moderation_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `moderation_reports_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderation_reports`
--

LOCK TABLES `moderation_reports` WRITE;
/*!40000 ALTER TABLE `moderation_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderation_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_approvals`
--

DROP TABLE IF EXISTS `project_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `decision` enum('approved','rejected') DEFAULT NULL,
  `comment` text,
  `reviewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `project_approvals_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_approvals_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_approvals`
--

LOCK TABLES `project_approvals` WRITE;
/*!40000 ALTER TABLE `project_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_interactions`
--

DROP TABLE IF EXISTS `project_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_interactions` (
  `interaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `Project_id` int(11) NOT NULL,
  `Likes` int(11) NOT NULL,
  `Comments` varchar(225) NOT NULL,
  `Comment_count` int(11) NOT NULL,
  `Mentor_request_count` int(11) NOT NULL,
  PRIMARY KEY (`interaction_id`),
  KEY `fk_project_interactions_project` (`Project_id`),
  CONSTRAINT `fk_project_interactions_project` FOREIGN KEY (`Project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_interactions`
--

LOCK TABLES `project_interactions` WRITE;
/*!40000 ALTER TABLE `project_interactions` DISABLE KEYS */;
INSERT INTO `project_interactions` VALUES (1,1,7,'3',3,7),(2,2,1,'3',3,0),(3,3,6,'4',4,0),(4,4,1,'5',5,0),(5,5,4,'13',13,0),(6,6,10,'6',6,0),(7,7,1,'6',6,0),(8,8,1,'7',7,0),(9,9,2,'2',2,0),(17,17,1,'4',4,0),(18,18,1,'15',15,0),(20,20,0,'0',0,1),(21,21,0,'0',0,0);
/*!40000 ALTER TABLE `project_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_team_members`
--

DROP TABLE IF EXISTS `project_team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_team_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_team_members`
--

LOCK TABLES `project_team_members` WRITE;
/*!40000 ALTER TABLE `project_team_members` DISABLE KEYS */;
INSERT INTO `project_team_members` VALUES (1,1,2,'Backend Developer'),(2,1,4,'UI/UX Designer'),(3,1,25,'QA Tester'),(4,2,5,'Frontend Developer'),(5,2,23,'Database Admin'),(6,2,14,'Data Analyst'),(7,3,6,'AI Engineer'),(9,3,33,'System Tester'),(10,4,24,'Android Developer'),(11,4,26,'Sustainability Researcher'),(12,4,32,'UI Designer'),(13,5,25,'Flutter Developer'),(14,5,2,'Backend Developer'),(15,5,17,'Route Analyst'),(16,6,14,'Financial Analyst'),(17,6,5,'Laravel Developer'),(18,6,23,'Frontend Developer'),(19,7,4,'Full Stack Developer'),(21,7,26,'Content Coordinator'),(22,8,32,'Map Integration Specialist'),(23,8,6,'Data Visualizer'),(24,8,14,'Community Engagement'),(26,9,24,'Health Educator'),(27,18,23,'backend'),(29,20,24,'backend'),(30,21,23,'backend');
/*!40000 ALTER TABLE `project_team_members` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_team_member_added` AFTER INSERT ON `project_team_members` FOR EACH ROW UPDATE projects
SET team_size = (
  SELECT COUNT(*) 
  FROM project_team_members 
  WHERE project_id = NEW.project_id
)
WHERE id = NEW.project_id */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`workbench_access`@`localhost`*/ /*!50003 TRIGGER after_team_member_updated
AFTER UPDATE ON project_team_members
FOR EACH ROW
BEGIN
  -- Update old project team size
  UPDATE projects
  SET team_size = (
    SELECT COUNT(*)
    FROM project_team_members
    WHERE project_id = OLD.project_id
  )
  WHERE id = OLD.project_id;

  -- Update new project team size
  UPDATE projects
  SET team_size = (
    SELECT COUNT(*)
    FROM project_team_members
    WHERE project_id = NEW.project_id
  )
  WHERE id = NEW.project_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_team_member_removed` AFTER DELETE ON `project_team_members` FOR EACH ROW UPDATE projects
SET team_size = (
  SELECT COUNT(*) 
  FROM project_team_members 
  WHERE project_id = OLD.project_id
)
WHERE id = OLD.project_id */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `Short_description` text,
  `Project_profile_picture` varchar(255) NOT NULL,
  `category` varchar(225) DEFAULT NULL,
  `description` text,
  `file_path` varchar(255) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
  `project_type` enum('it','non-it') DEFAULT 'it',
  `launch_date` date DEFAULT NULL,
  `project_lead` varchar(255) DEFAULT NULL,
  `team_size` int(11) DEFAULT NULL,
  `tags` text,
  `technical_details` text,
  `screenshots` varchar(255) DEFAULT NULL,
  `documents` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,24,'Smart Attendance System','Tracks class attendance using QR codes for automation and efficiency.','/uploads/2.png','Education','A system for automated class attendance using QR codes.','/uploads/2.png','1.0','approved','it','2025-06-01','John Mwangi',3,'Attendance, QR Code, Education, Automation','Programming: Java, Android\nFrameworks: Firebase, ZXing\nDatabase: Firestore\nDeployment: Play Store','/uploads/attendance.jpg,/uploads/attendance.jpg,/uploads/attendance.jpg','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-01 07:15:00'),(2,23,'AgriMarket Connect','Connects farmers directly with buyers through an online marketplace.','/uploads/trigo.jpg','Agriculture','A platform that connects farmers directly to buyers.','/uploads/trigo.jpg','2.0','approved','it','2025-06-02','Grace Njeri',3,'Agriculture, Marketplace, Farmers, eCommerce','Programming: JavaScript\nFrameworks: React, Node.js\nDatabase: MySQL\nDeployment: Vercel',NULL,'/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-02 08:45:00'),(3,4,'MediCheck AI Bot','AI-powered chatbot for drug interaction and symptom checks.','\\uploads\\default image project.png','Healthcare','AI chatbot for checking drug interactions and basic medical queries.','\\uploads\\default image project.png','1.1','approved','it','2025-06-03','Dr. James Otieno',2,'Healthcare, AI, Chatbot, Medicine','Programming: Python\nFrameworks: Flask, TensorFlow\nDatabase: MongoDB\nDeployment: AWS',NULL,'/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-03 06:30:00'),(4,4,'EcoSave Energy App','Helps users monitor and reduce household energy consumption.','/uploads/trigo.jpg','Environment','Mobile app for tracking and reducing household energy usage.','/uploads/trigo.jpg','1.0','approved','it','2025-06-04','Mary Wanjiku',3,'Energy, Environment, Sustainability, Green Tech','Programming: Kotlin\nFrameworks: Android SDK\nDatabase: SQLite\nDeployment: Play Store',NULL,'/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-04 11:00:00'),(5,24,'QuickMatatu Booking','Enables real-time matatu booking and live location tracking.','/uploads/QuickMatatu.png','Transport','Matatu booking system with live tracking and route info.','/uploads/QuickMatatu.png','1.2','approved','it','2025-06-05','Kevin Oduor',3,'Transport, Matatu, Booking, Navigation','Programming: Dart.\nFrameworks: Flutter, Google Maps API.\nDatabase: Firebase.\nDeployment: Android, iOS','/uploads/QuickMatatu.png,/uploads/2.png,/uploads/trigo.jpg\n\n','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-05 10:20:00'),(6,6,'FinTrack Budget Planner','Budget management tool for students and young professionals.','\\uploads\\default image project.png','Finance','A personal budget tracking tool for students and workers.','\\uploads\\default image project.png','2.1','rejected','it','2025-06-06','Alice Nyambura',3,'Finance, Budget, Students, Tracking','Programming: PHP\nFrameworks: Laravel\nDatabase: MySQL\nDeployment: cPanel',NULL,'/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-06 09:10:00'),(7,14,'EduCollab Projects','Platform for students to publish, collaborate, and showcase academic projects.','\\uploads\\educollab.png','Education','Web platform for students to share, publish, and continue academic projects.','\\uploads\\default image project.png','1.3','approved','it','2025-06-07','Brian Omondi',2,'Education, Collaboration, Sharing, Web Platform','Programming: TypeScript\nFrameworks: Next.js, Tailwind CSS\nDatabase: PostgreSQL\nDeployment: Vercel',NULL,'/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-07 12:45:00'),(8,14,'City Waste Mapper','Allows users to report and map illegal waste dumps in urban areas.','\\uploads\\default image project.png','Environment','Crowdsourced waste dump reporting and mapping tool.','\\uploads\\default image project.png','1.0','approved','it','2025-06-08','Lucy Achieng',3,'Environment, Waste Management, Mapping, Crowdsourcing','Programming: Python\nFrameworks: Django, Leaflet.js\nDatabase: PostgreSQL\nDeployment: Railway, Netlify',NULL,'/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-08 05:50:00'),(9,2,'Community Health Outreach','Improves rural health awareness through outreach and education initiatives.','\\uploads\\program.jpg','Healthcare','A project aimed at improving health awareness in rural areas through community engagement and mobile clinics.','\\uploads\\default image project.png','1.0','approved','non-it','2025-06-10','Susan Kendi',1,'Community Health, Outreach, Rural Development, Awareness','Project Focus: Community Health Education\nTarget Beneficiaries: Rural Communities\nMethodology: Health workshops, door-to-door visits, printed materials\nImpact Goals: Improve basic health knowledge, Reduce preventable illnesses, Empower local health champions','/uploads/QuickMatatu.png,/uploads/2.png,/uploads/trigo.jpg\n\n','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-16 09:55:30'),(17,33,'EcoFuel: Converting Kitchen Waste to Biogas','A low-cost solution for converting everyday kitchen waste into clean-burning biogas for household use in rural communities.','uploads\\EcoFuel.png','Sustainabilility','A low-cost solution for converting everyday kitchen waste into clean-burning biogas for household use in rural communities.',NULL,'1.0','approved','non-it','2025-06-22','Edwin kyle',0,'ai,iot,credentiaal','Project Focus: clean\nMethodology: field\nTarget Beneficiaries: rural\nImpact Goals: reduce waste','uploads\\1750621533043-488995148-default image project.png','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-22 19:45:33'),(18,24,'Smart Water Monitoring System','IoT-based system for real-time water quality and usage tracking','/uploads/Monitoring System.jpg','Environment','An IoT-based system that monitors water quality and usage in real time. It uses sensors to detect pH, turbidity, and flow rate, sending data to a dashboard for household or municipal management. Aimed at reducing water wastage and ensuring safe drinking water.','/uploads/smart_water_monitor.png','1.0','approved','it','2025-06-23','Edwin Kyle',3,'IoT, Water Management, Environment, Sensors','Programming: Python, C++ (Arduino)\nFrameworks: Flask, MQTT Broker\nDatabase: Firebase','/uploads/smart_water_monitor_1.png,/uploads/smart_water_monitor_2.png','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-06-23 18:18:28'),(20,24,'GreenCycle Community Composting','Neighborhood-based composting to reduce organic waste','/uploads/bio cycle.jpeg','Sustainability','A sustainable project that sets up local composting hubs where households can drop organic waste. Produces nutrient-rich compost for community gardens and local farmers, reducing landfill burden and supporting circular agriculture.','/uploads/greencycle_compost.png','1.0','approved','non-it','2025-07-02','Edwin Kyle',5,'Sustainability, Composting, Circular Economy, Community','Project Focus: Waste Reduction, Community Engagement\nMethodology: Community Training, Hub Setup\nTarget Beneficiaries: Local Households, Farmers','/uploads/greencycle_compost_1.png,/uploads/greencycle_compost_2.png','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-07-02 18:31:26'),(21,24,'EduBridge Literacy Initiative','Community-driven adult literacy program with mobile support','/uploads/literacy.png','Education','A community project aimed at improving adult literacy through blended learning. Offers in-person classes and a mobile app with lessons, quizzes, and audio support in local languages. Empowers adults in rural areas to achieve basic reading and writing skills.','/uploads/edubridge_literacy.png','1.0','approved','non-it','2025-07-02','Edwin Kyle',4,'Education, Literacy, Community Development','Project Focus: Adult Literacy\nMethodology: Participatory Design, Local Language Support\nTarget Beneficiaries: Rural Adults','/uploads/edubridge_literacy_1.png,/uploads/edubridge_literacy_2.png','/uploads/sample.pdf,\n/uploads/sample.pdf','2025-07-02 18:54:35'),(30,4,'AgriSense Soil Monitor','IoT device for real-time soil monitoring and analysis.','/uploads/agrisense.jpg','Agriculture','A smart system for measuring soil moisture, pH, and nutrients to optimize farming.','/uploads/agrisense_doc.pdf','1.0','pending','it','2025-07-10','Daniel Mwangi',3,'Agriculture, IoT, Sensors, Automation','Programming: Python, C++. Frameworks: Flask, Arduino.','/uploads/agrisense_1.png,/uploads/agrisense_2.png','/uploads/sample.pdf,/uploads/sample.pdf','2025-07-06 09:30:00'),(31,14,'SafeRoute Women Safety App','App for real-time location sharing and SOS alerts.','\\uploads\\default image project.png','Safety','A mobile app providing safe routes, alerts, and emergency contacts for women.','/uploads/saferoute_doc.pdf','1.0','pending','it','2025-07-11','Grace Wanjiru',4,'Safety, Mobile, Location, Women Empowerment','Programming: Kotlin. Frameworks: Android SDK.','/uploads/saferoute_1.png,/uploads/saferoute_2.png','/uploads/sample.pdf,/uploads/sample.pdf','2025-07-06 09:45:00'),(32,24,'UrbanGarden Hydroponics','Hydroponic farming system for urban spaces.','/uploads/trigo.jpg','Agriculture','A compact hydroponics solution for growing vegetables in small apartments.','/uploads/urbangarden_doc.pdf','1.0','pending','non-it','2025-07-12','John Otieno',2,'Agriculture, Hydroponics, Sustainability','Project Focus: Urban Farming. Methodology: Hydroponics setup.','/uploads/urbangarden_1.png,/uploads/urbangarden_2.png','/uploads/sample.pdf,/uploads/sample.pdf','2025-07-06 10:00:00'),(33,2,'LocalArtisans Marketplace','Platform for local artisans to sell handcrafted goods.','\\uploads\\default image project.png','Commerce','A web app to connect local artisans with customers, showcasing handmade products.','/uploads/localartisans_doc.pdf','1.0','pending','it','2025-07-13','Fatma Ahmed',5,'Commerce, Marketplace, Handcrafted, Local Business','Programming: JavaScript. Frameworks: React, Node.js.','/uploads/localartisans_1.png,/uploads/localartisans_2.png','/uploads/sample.pdf,/uploads/sample.pdf','2025-07-06 10:15:00'),(34,6,'CleanCook Biomass Stove','Affordable, low-emission stove for rural households.','\\uploads\\default image project.png','Energy','An improved biomass stove design that reduces smoke and saves fuel.','/uploads/cleancook_doc.pdf','1.0','pending','non-it','2025-07-14','Peter Njoroge',3,'Energy, Biomass, Rural Development, Sustainability','Project Focus: Clean Cooking. Methodology: Prototyping and Field Testing.','/uploads/cleancook_1.png,/uploads/cleancook_2.png','/uploads/sample.pdf,/uploads/sample.pdf','2025-07-06 10:30:00');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('CSh2Rn63inzZtbAHnFoGtcNpY1dxUpQO',1751838139,'{\"cookie\":{\"originalMaxAge\":7200000,\"expires\":\"2025-07-06T20:05:22.669Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":{\"id\":24,\"githubAccessToken\":null}},\"user\":{\"id\":24,\"name\":\"Edwin kyle\",\"email\":\"edkyle06@gmail.com\",\"role\":\"student\"}}'),('U7HwSfuMK9BxpBattDSHjgIsRLclVMU0',1751830984,'{\"cookie\":{\"originalMaxAge\":7200000,\"expires\":\"2025-07-06T19:31:44.614Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":{\"id\":34,\"githubAccessToken\":null}},\"user\":{\"id\":34,\"name\":\"Neo\",\"email\":\"carolgichanga003@gmail.com\",\"role\":\"mentor\"},\"_isNewUser\":false}'),('my6GWaFgqsKxF1mb9_5I5zReKEkkxfpd',1751837994,'{\"cookie\":{\"originalMaxAge\":7200000,\"expires\":\"2025-07-06T21:34:55.275Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":{\"id\":50,\"githubAccessToken\":null}},\"user\":{\"id\":50,\"name\":\"Strathtank\",\"email\":\"strathtank@gmail.com\",\"role\":\"student\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('student','mentor','admin') DEFAULT NULL,
  `verification_code` int(11) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `reset_code` varchar(10) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `Bio` varchar(255) DEFAULT NULL,
  `skills` varchar(255) DEFAULT NULL,
  `suspended` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Hassan Abdi','edkyle6@gmail.com','$2b$10$TIUXEV7G2guudfbnGVdNwOcetF5yzA48y0.S6pO8jsZxtlMVWk8ha','student',NULL,0,NULL,NULL,NULL,NULL,0),(4,'Edwin','edle6@gmail.com','$2b$10$6mApsSwX.4oBzdKK.ej6DuC8XGW7l2Az4vOC27KHZUvswJuCsPllG','student',NULL,0,NULL,NULL,NULL,NULL,0),(5,'Mailyoni ','sssssssc@gmail.com','$2b$10$zxeV8vLYGeB1YkCdktZKre2IUQNzIVwx0VpFglTGN8lRWOObAHMOK','student',NULL,0,NULL,NULL,NULL,NULL,0),(6,'Maili','edkyle0ss6@gmail.com','$2b$10$Ml.ifSh86KX6Qen/COI7KuKm1YfCVd1YyXLMivMeJ48EXNenzv5c6','student',NULL,0,NULL,NULL,NULL,NULL,0),(14,'Robby','Robbymwangi353@gmail.com','$2b$10$MepzHe5WbVCiocM4BIUhg.njbX22sceCWj4Gc8INShF0ypP88QPpC','student',NULL,1,NULL,NULL,NULL,NULL,0),(17,'Karuku','k6354943@gmail.com','$2b$10$tUvsqevQSgommWpS0bX84uYZcAfL87hYoUJfXiGqEZZm0/haAOLTm','admin',NULL,1,NULL,'uploads\\admin-17-1751799920184.jpg',NULL,NULL,0),(23,'Edgar','ndongakareithiii@gmail.com','$2b$10$IPO65ai1QHN/k55qT.750.Q02N7TWKGINvrFCLrhwlhvmQcKKveha','student',NULL,1,NULL,NULL,'professional gambler','developer',0),(24,'Edwin kyle','edkyle06@gmail.com','$2b$10$1xhRwBN9Hx4PCrar5psHzu5r8ZRo4o7E.7whV5tD/ElZgk6iaol9.','student',930083,1,'631155','uploads/1751807650282-667888445-noprofile.jpg','Oh well sometimes you crash and reboot yep','developer,Backend developer,frontend developer',0),(25,'Edwin kamau','edkamauworks@gmail.com',NULL,'student',NULL,1,NULL,'uploads/1750697993235-852158155-WhatsApp Image 2025-04-08 at 23.02.56_742ee725.jpg',NULL,NULL,0),(26,'Edu Snatchez','snatchez840@gmail.com',NULL,'student',NULL,1,NULL,NULL,NULL,NULL,0),(32,'kamau','kamaubackups@gmail.com','$2b$10$OrwhGpGLXfuKGxRYK0hZbOwjKTRt4yzHWJJ9AJ12hGQj2wB/Ko40C','student',NULL,1,NULL,NULL,NULL,NULL,0),(33,'Denzel','denzelsam.omondi@strathmore.edu','$2b$10$BaoQxgT/3Lr2C4fl.J5ug.yqhHX5evgZl0.VrKrjtsf35jEVGdDA6','student',NULL,1,NULL,NULL,NULL,NULL,0),(34,'Neo','carolgichanga003@gmail.com','$2b$10$B5icA.lV2h3F/e.zWYQe2eR.faGDSvq0Wa3m8gD4YQaPjKA6S7h32','mentor',NULL,1,NULL,'uploads/1751800653409-354878532-noprofile.jpg','Tech mentor passionate about helping students turn ideas into real projects. Experienced in software development, problem-solving, and guiding teams to success.','Data science,python',0),(44,'KAMAU EDWIN KAMAU','Edwink.kamau@strathmore.edu',NULL,NULL,NULL,1,NULL,'https://avatars.githubusercontent.com/u/166378939?v=4',NULL,NULL,0),(50,'Strathtank','strathtank@gmail.com',NULL,'student',NULL,1,NULL,'/assets/noprofile.jpg',NULL,NULL,0),(51,'Sam','Sam@gmail.com','$2b$10$dLhk9VkTmsUL8NofSyATjuJfuKXPptDRCbC5xOJ5LwEAy5r0crKey','student',274683,0,NULL,NULL,NULL,'JavaScript',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-06 22:42:25
