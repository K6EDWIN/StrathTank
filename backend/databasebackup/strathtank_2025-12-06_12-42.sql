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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,2,'Looking forward to improving the attendance system further.','2025-06-02 05:05:00'),(2,2,2,'Proud of the progress on this agriculture platform!','2025-06-02 05:35:00'),(3,3,4,'This AI bot can really help with basic medical queries.','2025-06-03 06:05:00'),(4,4,4,'Still optimizing the energy tracking algorithms.','2025-06-04 07:05:00'),(5,5,5,'Excited to see how matatu operators respond.','2025-06-05 07:35:00'),(6,6,6,'We’ll be testing budgeting features with students soon.','2025-06-06 08:05:00'),(7,7,14,'Hope this platform helps students collaborate better.','2025-06-07 09:05:00'),(8,8,14,'We are working on mapping more waste locations in Nairobi.','2025-06-08 10:05:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,2,'2025-06-02 05:00:00'),(2,2,2,'2025-06-02 05:30:00'),(3,3,4,'2025-06-03 06:00:00'),(4,4,4,'2025-06-04 07:00:00'),(5,5,5,'2025-06-05 07:30:00'),(6,6,6,'2025-06-06 08:00:00'),(7,7,14,'2025-06-07 09:00:00'),(8,8,14,'2025-06-08 10:00:00');
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
  `category` varchar(225) DEFAULT NULL,
  `description` text,
  `file_path` varchar(255) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,2,'Smart Attendance System','Education','A system for automated class attendance using QR codes.','/uploads/trigo.jpg','1.0','pending','2025-06-01 07:15:00'),(2,2,'AgriMarket Connect','Agriculture','A platform that connects farmers directly to buyers.','/uploads/agri_connect_v2.pdf','2.0','approved','2025-06-02 08:45:00'),(3,4,'MediCheck AI Bot','Healthcare','AI chatbot for checking drug interactions and basic medical queries.','/uploads/medicheck_ai.pdf','1.1','pending','2025-06-03 06:30:00'),(4,4,'EcoSave Energy App','Environment','Mobile app for tracking and reducing household energy usage.','/uploads/ecosave_energy.pdf','1.0','pending','2025-06-04 11:00:00'),(5,5,'QuickMatatu Booking','Transport','Matatu booking system with live tracking and route info.','/uploads/quickmatatu.pdf','1.2','approved','2025-06-05 10:20:00'),(6,6,'FinTrack Budget Planner','Finance','A personal budget tracking tool for students and workers.','/uploads/fintrack_planner.pdf','2.1','rejected','2025-06-06 09:10:00'),(7,14,'EduCollab Projects','Education','Web platform for students to share, publish, and continue academic projects.','/uploads/educollab_projects.pdf','1.3','pending','2025-06-07 12:45:00'),(8,14,'City Waste Mapper','Environment','Crowdsourced waste dump reporting and mapping tool.','/uploads/citywaste_mapper.pdf','1.0','pending','2025-06-08 05:50:00');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Hassan_Abdi','edkyle6@gmail.com','$2b$10$TIUXEV7G2guudfbnGVdNwOcetF5yzA48y0.S6pO8jsZxtlMVWk8ha','student',NULL,0,NULL),(4,'Ewin','edle6@gmail.com','$2b$10$6mApsSwX.4oBzdKK.ej6DuC8XGW7l2Az4vOC27KHZUvswJuCsPllG','student',NULL,0,NULL),(5,'mailayonni','sssssssc@gmail.com','$2b$10$zxeV8vLYGeB1YkCdktZKre2IUQNzIVwx0VpFglTGN8lRWOObAHMOK','student',NULL,0,NULL),(6,'mailayonnidssssss','edkyle0ss6@gmail.com','$2b$10$Ml.ifSh86KX6Qen/COI7KuKm1YfCVd1YyXLMivMeJ48EXNenzv5c6','student',NULL,0,NULL),(14,'robby','Robbymwangi353@gmail.com','$2b$10$MepzHe5WbVCiocM4BIUhg.njbX22sceCWj4Gc8INShF0ypP88QPpC','student',NULL,1,NULL),(17,'Karuku','k6354943@gmail.com',NULL,'student',NULL,1,NULL),(19,'Strathtank','strathtank@gmail.com',NULL,'student',NULL,1,NULL),(20,'KAMAU EDWIN KAMAU','Edwink.kamau@strathmore.edu',NULL,'student',NULL,1,NULL),(23,'Edgar','ndongakareithiii@gmail.com','$2b$10$IPO65ai1QHN/k55qT.750.Q02N7TWKGINvrFCLrhwlhvmQcKKveha','student',NULL,1,NULL),(24,'Edwin kamau','edkyle06@gmail.com','$2b$10$tVDEbgNEI4m7ld6gha6Z.ekvVYU/gAAwzbAeAAXTFqKalFl37frVG','student',930083,0,NULL),(25,'Edwin kamau','edkamauworks@gmail.com',NULL,'student',NULL,1,NULL),(26,'Edu Snatchez','snatchez840@gmail.com',NULL,'student',NULL,1,NULL),(32,'kamaubackups@gmail.com','kamaubackups@gmail.com','$2b$10$OrwhGpGLXfuKGxRYK0hZbOwjKTRt4yzHWJJ9AJ12hGQj2wB/Ko40C','student',NULL,1,NULL);
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

-- Dump completed on 2025-06-12 12:42:25
