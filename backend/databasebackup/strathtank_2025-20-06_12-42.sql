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
-- Table structure for table `collaborations`
--

DROP TABLE IF EXISTS `collaborations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `collaborations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `collaborator_id` int(11) DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `collaborator_id` (`collaborator_id`),
  CONSTRAINT `collaborations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `collaborations_ibfk_2` FOREIGN KEY (`collaborator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaborations`
--

LOCK TABLES `collaborations` WRITE;
/*!40000 ALTER TABLE `collaborations` DISABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,2,'Looking forward to improving the attendance system further.','2025-06-02 05:05:00'),(2,2,2,'Proud of the progress on this agriculture platform!','2025-06-02 05:35:00'),(3,3,4,'This AI bot can really help with basic medical queries.','2025-06-03 06:05:00'),(4,4,4,'Still optimizing the energy tracking algorithms.','2025-06-04 07:05:00'),(5,5,5,'Excited to see how matatu operators respond.','2025-06-05 07:35:00'),(6,6,6,'We’ll be testing budgeting features with students soon.','2025-06-06 08:05:00'),(7,7,14,'Hope this platform helps students collaborate better.','2025-06-07 09:05:00'),(8,8,14,'We are working on mapping more waste locations in Nairobi.','2025-06-08 10:05:00'),(9,1,4,'Great work!','2025-06-13 09:52:29'),(10,2,4,'Great work!','2025-06-13 09:52:29'),(11,2,5,'Very innovative!','2025-06-13 09:52:29'),(12,3,2,'Great work!','2025-06-13 09:52:29'),(13,3,5,'Very innovative!','2025-06-13 09:52:29'),(14,3,6,'Looks promising.','2025-06-13 09:52:29'),(15,4,2,'Great work!','2025-06-13 09:52:29'),(16,4,5,'Very innovative!','2025-06-13 09:52:29'),(17,4,6,'Looks promising.','2025-06-13 09:52:29'),(18,4,14,'Nice concept.','2025-06-13 09:52:29'),(19,5,2,'Great work!','2025-06-13 09:52:29'),(20,5,4,'Very innovative!','2025-06-13 09:52:29'),(21,5,6,'Looks promising.','2025-06-13 09:52:29'),(22,5,14,'Nice concept.','2025-06-13 09:52:29'),(23,5,17,'How can I contribute?','2025-06-13 09:52:29'),(24,6,2,'Great work!','2025-06-13 09:52:29'),(25,6,4,'Very innovative!','2025-06-13 09:52:29'),(26,6,5,'Looks promising.','2025-06-13 09:52:29'),(27,6,14,'Nice concept.','2025-06-13 09:52:29'),(28,6,17,'How can I contribute?','2025-06-13 09:52:29'),(29,6,19,'I like the idea!','2025-06-13 09:52:29'),(30,7,2,'Great work!','2025-06-13 09:52:29'),(31,7,4,'Very innovative!','2025-06-13 09:52:29'),(32,7,5,'Looks promising.','2025-06-13 09:52:29'),(33,7,6,'Nice concept.','2025-06-13 09:52:29'),(34,7,17,'How can I contribute?','2025-06-13 09:52:29'),(35,7,19,'I like the idea!','2025-06-13 09:52:29'),(36,7,20,'Would love to collaborate.','2025-06-13 09:52:29'),(37,8,2,'Great work!','2025-06-13 09:52:29'),(38,8,4,'Very innovative!','2025-06-13 09:52:29'),(39,8,5,'Looks promising.','2025-06-13 09:52:29'),(40,8,6,'Nice concept.','2025-06-13 09:52:29'),(41,8,17,'How can I contribute?','2025-06-13 09:52:29'),(42,8,19,'I like the idea!','2025-06-13 09:52:29'),(43,8,20,'Would love to collaborate.','2025-06-13 09:52:29'),(44,8,23,'Clean UI!','2025-06-13 09:52:29'),(46,5,23,'oh well','2025-06-17 17:42:13'),(47,5,23,'yooooh','2025-06-17 18:13:53'),(48,9,23,'interesting','2025-06-18 09:53:21');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `github_metadata`
--

LOCK TABLES `github_metadata` WRITE;
/*!40000 ALTER TABLE `github_metadata` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,2,'2025-06-02 05:00:00'),(2,2,2,'2025-06-02 05:30:00'),(3,3,4,'2025-06-03 06:00:00'),(4,4,4,'2025-06-04 07:00:00'),(5,5,5,'2025-06-05 07:30:00'),(6,6,6,'2025-06-06 08:00:00'),(7,7,14,'2025-06-07 09:00:00'),(8,8,14,'2025-06-08 10:00:00'),(10,1,2,'2025-06-11 05:00:00'),(11,1,4,'2025-06-11 05:01:00'),(12,1,5,'2025-06-11 05:02:00'),(13,1,6,'2025-06-11 05:03:00'),(14,1,14,'2025-06-11 05:04:00'),(15,3,17,'2025-06-11 06:00:00'),(16,3,19,'2025-06-11 06:01:00'),(17,3,20,'2025-06-11 06:02:00'),(18,3,23,'2025-06-11 06:03:00'),(19,3,24,'2025-06-11 06:04:00'),(20,3,25,'2025-06-11 06:05:00'),(21,3,26,'2025-06-11 06:06:00'),(22,6,32,'2025-06-11 07:00:00'),(23,6,33,'2025-06-11 07:01:00'),(24,6,2,'2025-06-11 07:02:00'),(25,6,4,'2025-06-11 07:03:00'),(26,6,5,'2025-06-11 07:04:00'),(27,6,6,'2025-06-11 07:05:00'),(28,6,14,'2025-06-11 07:06:00'),(29,6,17,'2025-06-11 07:07:00'),(30,6,19,'2025-06-11 07:08:00'),(31,6,20,'2025-06-11 07:09:00'),(58,5,23,'2025-06-17 21:27:02'),(59,9,23,'2025-06-18 09:53:08');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
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
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `feedback` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `mentee_id` (`mentee_id`),
  KEY `mentor_id` (`mentor_id`),
  CONSTRAINT `mentorship_requests_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `mentorship_requests_ibfk_2` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `mentorship_requests_ibfk_3` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentorship_requests`
--

LOCK TABLES `mentorship_requests` WRITE;
/*!40000 ALTER TABLE `mentorship_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `mentorship_requests` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_interactions`
--

LOCK TABLES `project_interactions` WRITE;
/*!40000 ALTER TABLE `project_interactions` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_team_members`
--

LOCK TABLES `project_team_members` WRITE;
/*!40000 ALTER TABLE `project_team_members` DISABLE KEYS */;
INSERT INTO `project_team_members` VALUES (1,1,2,'Backend Developer'),(2,1,4,'UI/UX Designer'),(3,1,25,'QA Tester'),(4,2,5,'Frontend Developer'),(5,2,23,'Database Admin'),(6,2,14,'Data Analyst'),(7,3,6,'AI Engineer'),(8,3,20,'Medical Consultant'),(9,3,33,'System Tester'),(10,4,24,'Android Developer'),(11,4,26,'Sustainability Researcher'),(12,4,32,'UI Designer'),(13,5,25,'Flutter Developer'),(14,5,2,'Backend Developer'),(15,5,17,'Route Analyst'),(16,6,14,'Financial Analyst'),(17,6,5,'Laravel Developer'),(18,6,23,'Frontend Developer'),(19,7,4,'Full Stack Developer'),(20,7,20,'UX Strategist'),(21,7,26,'Content Coordinator'),(22,8,32,'Map Integration Specialist'),(23,8,6,'Data Visualizer'),(24,8,14,'Community Engagement'),(25,9,19,'Outreach Coordinator'),(26,9,24,'Health Educator'),(27,9,33,'Survey Analyst');
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
-- Table structure for table `project_versions`
--

DROP TABLE IF EXISTS `project_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_versions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `version` varchar(50) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `project_versions_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_versions`
--

LOCK TABLES `project_versions` WRITE;
/*!40000 ALTER TABLE `project_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_versions` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,26,'Smart Attendance System','Tracks class attendance using QR codes for automation and efficiency.','','Education','A system for automated class attendance using QR codes.','/uploads/2.png','1.0','approved','it','2025-06-01','John Mwangi',3,'Attendance, QR Code, Education, Automation','Programming: Java, Android\nFrameworks: Firebase, ZXing\nDatabase: Firestore\nDeployment: Play Store',NULL,NULL,'2025-06-01 07:15:00'),(2,2,'AgriMarket Connect','Connects farmers directly with buyers through an online marketplace.','','Agriculture','A platform that connects farmers directly to buyers.','/uploads/trigo.jpg','2.0','approved','it','2025-06-02','Grace Njeri',3,'Agriculture, Marketplace, Farmers, eCommerce','Programming: JavaScript\nFrameworks: React, Node.js\nDatabase: MySQL\nDeployment: Vercel',NULL,NULL,'2025-06-02 08:45:00'),(3,4,'MediCheck AI Bot','AI-powered chatbot for drug interaction and symptom checks.','','Healthcare','AI chatbot for checking drug interactions and basic medical queries.','\\uploads\\default image project.png','1.1','pending','it','2025-06-03','Dr. James Otieno',3,'Healthcare, AI, Chatbot, Medicine','Programming: Python\nFrameworks: Flask, TensorFlow\nDatabase: MongoDB\nDeployment: AWS',NULL,NULL,'2025-06-03 06:30:00'),(4,4,'EcoSave Energy App','Helps users monitor and reduce household energy consumption.','','Environment','Mobile app for tracking and reducing household energy usage.','/uploads/trigo.jpg','1.0','pending','it','2025-06-04','Mary Wanjiku',3,'Energy, Environment, Sustainability, Green Tech','Programming: Kotlin\nFrameworks: Android SDK\nDatabase: SQLite\nDeployment: Play Store',NULL,NULL,'2025-06-04 11:00:00'),(5,5,'QuickMatatu Booking','Enables real-time matatu booking and live location tracking.','/uploads/2.png','Transport','Matatu booking system with live tracking and route info.','/uploads/QuickMatatu.png','1.2','approved','it','2025-06-05','Kevin Oduor',3,'Transport, Matatu, Booking, Navigation','Programming: Dart.\nFrameworks: Flutter, Google Maps API.\nDatabase: Firebase.\nDeployment: Android, iOS','/uploads/QuickMatatu.png,/uploads/2.png,/uploads/trigo.jpg\n\n','/uploads/sample.pdf,\n/uploads/sample.docx','2025-06-05 10:20:00'),(6,6,'FinTrack Budget Planner','Budget management tool for students and young professionals.','','Finance','A personal budget tracking tool for students and workers.','\\uploads\\default image project.png','2.1','rejected','it','2025-06-06','Alice Nyambura',3,'Finance, Budget, Students, Tracking','Programming: PHP\nFrameworks: Laravel\nDatabase: MySQL\nDeployment: cPanel',NULL,NULL,'2025-06-06 09:10:00'),(7,14,'EduCollab Projects','Platform for students to publish, collaborate, and showcase academic projects.','','Education','Web platform for students to share, publish, and continue academic projects.','\\uploads\\default image project.png','1.3','pending','it','2025-06-07','Brian Omondi',3,'Education, Collaboration, Sharing, Web Platform','Programming: TypeScript\nFrameworks: Next.js, Tailwind CSS\nDatabase: PostgreSQL\nDeployment: Vercel',NULL,NULL,'2025-06-07 12:45:00'),(8,14,'City Waste Mapper','Allows users to report and map illegal waste dumps in urban areas.','','Environment','Crowdsourced waste dump reporting and mapping tool.','\\uploads\\default image project.png','1.0','pending','it','2025-06-08','Lucy Achieng',3,'Environment, Waste Management, Mapping, Crowdsourcing','Programming: Python\nFrameworks: Django, Leaflet.js\nDatabase: PostgreSQL\nDeployment: Railway, Netlify',NULL,NULL,'2025-06-08 05:50:00'),(9,2,'Community Health Outreach','Improves rural health awareness through outreach and education initiatives.','','Healthcare','A project aimed at improving health awareness in rural areas through community engagement and mobile clinics.','\\uploads\\default image project.png','1.0','pending','non-it','2025-06-10','Susan Kendi',3,'Community Health, Outreach, Rural Development, Awareness','Project Focus: Community Health Education\nTarget Beneficiaries: Rural Communities\nMethodology: Health workshops, door-to-door visits, printed materials\nImpact Goals: Improve basic health knowledge, Reduce preventable illnesses, Empower local health champions','/uploads/QuickMatatu.png,/uploads/2.png,/uploads/trigo.jpg\n\n','/uploads/sample.pdf,\n/uploads/sample.docx','2025-06-16 09:55:30');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Hassan_Abdi','edkyle6@gmail.com','$2b$10$TIUXEV7G2guudfbnGVdNwOcetF5yzA48y0.S6pO8jsZxtlMVWk8ha','student',NULL,0,NULL,NULL),(4,'Ewin','edle6@gmail.com','$2b$10$6mApsSwX.4oBzdKK.ej6DuC8XGW7l2Az4vOC27KHZUvswJuCsPllG','student',NULL,0,NULL,NULL),(5,'mailayonni','sssssssc@gmail.com','$2b$10$zxeV8vLYGeB1YkCdktZKre2IUQNzIVwx0VpFglTGN8lRWOObAHMOK','student',NULL,0,NULL,NULL),(6,'mailayonnidssssss','edkyle0ss6@gmail.com','$2b$10$Ml.ifSh86KX6Qen/COI7KuKm1YfCVd1YyXLMivMeJ48EXNenzv5c6','student',NULL,0,NULL,NULL),(14,'robby','Robbymwangi353@gmail.com','$2b$10$MepzHe5WbVCiocM4BIUhg.njbX22sceCWj4Gc8INShF0ypP88QPpC','student',NULL,1,NULL,NULL),(17,'Karuku','k6354943@gmail.com',NULL,'student',NULL,1,NULL,NULL),(19,'Strathtank','strathtank@gmail.com',NULL,'student',NULL,1,NULL,NULL),(20,'KAMAU EDWIN KAMAU','Edwink.kamau@strathmore.edu',NULL,'student',NULL,1,NULL,NULL),(23,'Edgar','ndongakareithiii@gmail.com','$2b$10$IPO65ai1QHN/k55qT.750.Q02N7TWKGINvrFCLrhwlhvmQcKKveha','student',NULL,1,NULL,NULL),(24,'Edwin kamau','edkyle06@gmail.com','$2b$10$tVDEbgNEI4m7ld6gha6Z.ekvVYU/gAAwzbAeAAXTFqKalFl37frVG','student',930083,0,NULL,'\\uploads\\ profilepicture.jpeg'),(25,'Edwin kamau','edkamauworks@gmail.com',NULL,'student',NULL,1,NULL,'\\uploads\\ profilepicture.jpeg'),(26,'Edu Snatchez','snatchez840@gmail.com',NULL,'student',NULL,1,NULL,NULL),(32,'kamaubackups@gmail.com','kamaubackups@gmail.com','$2b$10$OrwhGpGLXfuKGxRYK0hZbOwjKTRt4yzHWJJ9AJ12hGQj2wB/Ko40C','student',NULL,1,NULL,NULL),(33,'Denzel','denzelsam.omondi@strathmore.edu','$2b$10$9d5yWENeYs9G1Wyf.kb9UOnGCN22jwfxIaaPWYq5TUggr9v4Dnyky','student',NULL,1,NULL,NULL),(34,'testuser','test@example.com','$2b$10$w/E8Mw9Ob/AOHM7vspl7MeFTysc29wo/pK4uV4/Mp0xue7cfD3dmO','student',788262,0,NULL,NULL);
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

-- Dump completed on 2025-06-20 12:42:25
