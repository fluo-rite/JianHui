SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `submission_answer`;
DROP TABLE IF EXISTS `submission`;
DROP TABLE IF EXISTS `component_data`;
DROP TABLE IF EXISTS `component`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `page`;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `head_img` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `open_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `page` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `page_name` VARCHAR(255) NOT NULL,
  `tdk` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `published_at` DATETIME NULL,
  `closed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_page_account_created_at` (`account_id`, `created_at`),
  KEY `idx_page_account_updated_at` (`account_id`, `updated_at`),
  CONSTRAINT `fk_page_account_id` FOREIGN KEY (`account_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `component` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `page_id` INT NOT NULL,
  `sort_index` INT NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `options` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_component_page_sort_index` (`page_id`, `sort_index`),
  KEY `idx_component_page_type` (`page_id`, `type`),
  CONSTRAINT `fk_component_page_id` FOREIGN KEY (`page_id`) REFERENCES `page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `submission` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `page_id` INT NOT NULL,
  `submitter_key` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submission_page_submitter` (`page_id`, `submitter_key`),
  KEY `idx_submission_page_created` (`page_id`, `created_at`, `id`),
  KEY `idx_submission_page_id` (`page_id`, `id`),
  CONSTRAINT `fk_submission_page_id` FOREIGN KEY (`page_id`) REFERENCES `page` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `submission_answer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `submission_id` INT NOT NULL,
  `page_id` INT NOT NULL,
  `component_id` INT NOT NULL,
  `component_type` VARCHAR(64) NOT NULL,
  `value_text` TEXT NULL,
  `value_option_id` VARCHAR(64) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_answer_submission_component` (`submission_id`, `component_id`),
  KEY `idx_answer_page_component_option` (`page_id`, `component_id`, `value_option_id`),
  KEY `idx_answer_page_submission` (`page_id`, `submission_id`),
  CONSTRAINT `fk_submission_answer_submission_id` FOREIGN KEY (`submission_id`) REFERENCES `submission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `resources` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_resources_account_type` (`account_id`, `type`),
  CONSTRAINT `fk_resources_account_id` FOREIGN KEY (`account_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
