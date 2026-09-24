CREATE DATABASE IF NOT EXISTS personal_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personal_blog;

CREATE TABLE IF NOT EXISTS entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('article', 'moment') NOT NULL,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(600) NOT NULL DEFAULT '',
  body_md MEDIUMTEXT NOT NULL,
  tags JSON NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  cover_media_id CHAR(36) NULL,
  image_ids JSON NOT NULL,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_entries_slug (slug),
  KEY idx_entries_public (type, status, published_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  mime VARCHAR(40) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  bytes LONGBLOB NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB;
