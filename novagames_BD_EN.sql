DROP DATABASE IF EXISTS novagames;
CREATE DATABASE novagames;
USE novagames;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_image VARCHAR(255) DEFAULT 'user_profile_image.png',
    password VARCHAR(100),
    role ENUM('user', 'developer', 'admin'),
    registration_date DATETIME DEFAULT NOW(),
    is_verified BOOLEAN,
    verification_token VARCHAR(255),
    novapoints INT DEFAULT 0
);

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    developer_id INT,
    title VARCHAR(100),
    upload_date DATETIME DEFAULT NOW(),
    download_url VARCHAR(255),
    downloads INT,
    cover VARCHAR(255),
    is_open BOOLEAN DEFAULT FALSE,
    rating_count INT DEFAULT 0,
    rating_sum DECIMAL(65,1) DEFAULT 0
);

CREATE TABLE content_blocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id INT, 
  block_type ENUM('text', 'image'),
  block_number INT,
  content TEXT,
  block_row int,
  block_col int,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE game_ratings (
  game_id INT,
  user_id INT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5)
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

CREATE TABLE game_categories (
    game_id INT,
    category_id INT
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT,
    developer_id INT,
    title VARCHAR(100),
    content TEXT,
    post_date DATETIME DEFAULT NOW()
);

CREATE TABLE posts_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT, 
  type ENUM('image'), 
  content TEXT,
  order_index INT
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT,
    post_id INT,
    comment_id INT,
    user_id INT,
    content TEXT,
    comment_date DATETIME DEFAULT NOW()
);

CREATE TABLE game_jams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    winner_id INT DEFAULT NULL,
    winning_game_id INT DEFAULT NULL,
    title VARCHAR(100),
    description TEXT,
    theme VARCHAR(50),
    registration_start DATETIME,
    registration_end DATETIME,
    creation_start DATETIME,
    creation_end DATETIME,
    voting_start DATETIME,
    voting_end DATETIME,
    is_open BOOLEAN,
    cover VARCHAR(255),
    rewards INT,
    is_last BOOLEAN DEFAULT FALSE
);

CREATE TABLE games_game_jams (
    game_id INT,
    game_jam_id INT,
    average_score DECIMAL(2,1)
);

CREATE TABLE game_jam_participants (
    game_jam_id INT,
    developer_id INT
);

CREATE TABLE game_jam_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_jam_id INT,
    game_id INT,
    user_id INT,
    comment VARCHAR(255),
    vote_date DATETIME DEFAULT NOW(),
    originality INT,
    art INT,
    music INT,
    fun INT,
    theme INT
);

-- Juegos creados por el usuario (desarrollador)
ALTER TABLE games
    ADD CONSTRAINT fk_game_developer FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD COLUMN total_rating DECIMAL(3,2) 
		GENERATED ALWAYS AS (
			CASE 
			WHEN rating_count > 0 THEN rating_sum / rating_count 
			ELSE 0 
			END
		) VIRTUAL;
    
-- Juegos y sus categorias
ALTER TABLE game_categories
	ADD CONSTRAINT pk_game_categories PRIMARY KEY (game_id, category_id);

-- Valoraciones de los juegos por usuarios
ALTER TABLE game_ratings
    ADD CONSTRAINT pk_valoracion PRIMARY KEY (game_id, user_id),
    ADD CONSTRAINT fk_game_ratings FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_valoracion_usuario FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Publicaciones hechas por el usuario (desarrollador)
ALTER TABLE posts
    ADD CONSTRAINT fk_post_developer FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE;
-- Publicaciones hechas por el usuario (desarrollador)
ALTER TABLE posts_images
    ADD CONSTRAINT fk_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Comentarios hechos por el usuario
ALTER TABLE comments
    ADD CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_comment_reply FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Votos emitidos por el usuario
-- 1. Agregar la columna calculada
ALTER TABLE game_jam_votes
ADD vote_score DECIMAL(4,2)
  GENERATED ALWAYS AS ((originality + art + music + fun + theme) / 5) VIRTUAL;

-- 2. Agregar la clave foránea
ALTER TABLE game_jam_votes
ADD CONSTRAINT fk_vote_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;


-- Ganador de una game jam (si se elimina el ganador, puedes dejarlo en NULL si prefieres)
ALTER TABLE game_jams
    ADD CONSTRAINT fk_jam_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_jam_winning_game FOREIGN KEY (winning_game_id) REFERENCES games(id) ON DELETE SET NULL;

-- Participación en game jams
ALTER TABLE game_jam_participants
    ADD CONSTRAINT fk_participant_user FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE;


-- TRIGGERS
DELIMITER //

CREATE TRIGGER trg_avg_score_after_insert
AFTER INSERT ON game_jam_votes
FOR EACH ROW
BEGIN
  UPDATE games_game_jams
  SET average_score = (
    SELECT ROUND(AVG(v.vote_score), 2)
    FROM game_jam_votes v
    WHERE v.game_id = NEW.game_id
  )
  WHERE game_id = NEW.game_id;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_avg_score_after_update
AFTER UPDATE ON game_jam_votes
FOR EACH ROW
BEGIN
  UPDATE games_game_jams
  SET average_score = (
    SELECT ROUND(AVG(v.vote_score), 2)
    FROM game_jam_votes v
    WHERE v.game_id = NEW.game_id
  )
  WHERE game_id = NEW.game_id;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_avg_score_after_delete
AFTER DELETE ON game_jam_votes
FOR EACH ROW
BEGIN
  UPDATE games_game_jams
  SET average_score = (
    SELECT ROUND(AVG(v.vote_score), 2)
    FROM game_jam_votes v
    WHERE v.game_id = OLD.game_id
  )
  WHERE game_id = OLD.game_id;
END;
//

DELIMITER ;



-- INSERTS

-- USERS
INSERT INTO users (username, email, password, role, registration_date, is_verified, verification_token) VALUES
('Ana Torres', 'ana@gmail.com', '$2a$10$4NOL8uzp5Yy9QYsXuYmaCujfU2ec.vDNBffhV1Ymplh.kfqQw3h0y', 'user', '2025-05-04 00:00:00', true, null), -- Ana123456789?
('Pedro García', 'pedro@gmail.com', '$2a$10$mvF.RLPcu0YxmPkH5gpFq.j.julpY1di4tBPDOw2xNs4qeL5L6/Vu', 'user', '2022-05-01 00:00:00', false, null), -- Ana123456789?
('Luis Pérez', 'luis@gmail.com', '$2a$10$Nzfkb8c3ReQM5uk7uXsQ4u5NstRK7xHGZtKgtivVa6BMm8FDK2foa', 'developer', '2022-04-23 00:00:00', true, null), -- Luis123456789?
('Mario Ruiz', 'mario@gmail.com', '$2a$10$ASuFC/nWF9uwqWdgD2puteOY2bjRJG4MDnEgn00FnHI90mCRD2sqi', 'developer', '2022-09-04 00:00:00', true, null), -- Mario123456789?
('Lucía Fernández', 'lucia@gmail.com', '$2a$10$PD6bvc3bf8rXyYfAbqwRgeGTyxTBRxwnFnB6LyvM0LzPKPI0YzzKe', 'developer', '2022-01-12 00:00:00', true, null), -- Lucía123456789?
('Carlos Sánchez', 'carlos@gmail.com', '$2a$10$wFSm2qj208oq8YLMWgLbEuhqtTp9yxjZj4RBW9JrkCaKDrERIDUra', 'developer', '2022-12-12 00:00:00', true, null), -- Carlos123456789?
('Clara Gómez', 'clara@gmail.com', '$2a$10$YhihmZMOcN6cZFOQGCIDTOLSRUKUvQYfR.A5fuYcD1Jof2775Ree.', 'admin', '2022-05-04 00:00:00', true, null); -- Clara123456789?

-- GAMES
INSERT INTO games (developer_id, title, upload_date, download_url, downloads, cover, is_open, rating_sum, rating_count) VALUES
(3, 'Galactic War', '2024-11-03 16:49:10', 'url1', 1234567, 'gamecover.png', TRUE, 192, 94),
(2, 'Mystic Island', '2024-07-22 09:24:43', 'url2', 2345678, 'gamecover.png', FALSE, 654, 159),
(3, 'Shadow Hunter', '2023-07-17 08:56:42', 'url3', 3456789, 'gamecover.png', TRUE, 437, 145),
(3, 'Pixel Dash', '2024-11-01 18:55:30', 'url4', 4567890, 'gamecover.png', FALSE, 543, 218),
(3, 'Dragon Trials', '2025-02-13 07:07:23', 'url5', 5678901, 'gamecover.png', TRUE, 88, 44),
(5, 'Rogue Quest', '2024-07-20 17:34:28', 'url6', 6789012, 'gamecover.png', FALSE, 218, 85),
(5, 'Zombie School', '2023-11-27 00:19:39', 'url7', 7890123, 'gamecover.png', TRUE, 694, 436),
(3, 'Dark Moon', '2024-01-21 13:55:00', 'url8', 8901234, 'gamecover.png', FALSE, 1159, 284),
(2, 'Neon Drift', '2025-03-24 03:56:53', 'url9', 9012345, 'gamecover.png', TRUE, 1496, 445),
(4, 'Frozen Tundra', '2024-12-08 03:36:20', 'url10', 123456, 'gamecover.png', FALSE, 455, 145),
(2, 'Lost in Space', '2023-09-01 16:51:55', 'url11', 234567, 'gamecover.png', TRUE, 851, 264),
(5, 'Quantum Breaker', '2024-04-27 10:57:04', 'url12', 345678, 'gamecover.png', FALSE, 1166, 291),
(2, 'Jungle Trap', '2025-01-14 11:57:03', 'url13', 456789, 'gamecover.png', TRUE, 1008, 445),
(3, 'Tower Defense', '2024-11-06 00:12:48', 'url14', 567890, 'gamecover.png', FALSE, 1251, 442),
(4, 'Mega Bot', '2024-11-24 18:48:05', 'url15', 678901, 'gamecover.png', TRUE, 379, 142),
(5, 'Alien Siege', '2023-06-06 20:17:30', 'url16', 789012, 'gamecover.png', FALSE, 1015, 354),
(5, 'Crystal Maze', '2024-02-25 13:50:01', 'url17', 890123, 'gamecover.png', TRUE, 499, 132),
(5, 'Solar Battle', '2023-11-23 14:26:18', 'url18', 901234, 'gamecover.png', FALSE, 782, 256),
(2, 'Cursed Castle', '2023-07-05 18:50:47', 'url19', 12345, 'gamecover.png', TRUE, 365, 112),
(2, 'Iron Mecha', '2025-04-04 10:42:40', 'url20', 23456, 'gamecover.png', FALSE, 539, 190),
(3, 'Cyber Clash', '2024-10-14 04:42:42', 'url21', 2198758, 'gamecover.png', TRUE, 1015, 281),
(3, 'Lava Run', '2024-06-07 17:44:44', 'url22', 9557832, 'gamecover.png', FALSE, 1702, 347),
(2, 'Toxic Swamp', '2024-06-06 03:54:53', 'url23', 3295145, 'gamecover.png', FALSE, 409, 424),
(2, 'Dream Catcher', '2024-09-04 14:00:38', 'url24', 3900958, 'gamecover.png', TRUE, 667, 144),
(4, 'Haunted Circus', '2024-01-06 11:42:57', 'url25', 9152246, 'gamecover.png', FALSE, 303, 196),
(5, 'Biohazard X', '2024-07-18 06:16:16', 'url26', 4169490, 'gamecover.png', FALSE, 154, 118),
(4, 'Twilight Arena', '2024-08-01 11:40:59', 'url27', 8619617, 'gamecover.png', FALSE, 1480, 420),
(3, 'Sky High', '2024-08-03 10:15:49', 'url28', 5636319, 'gamecover.png', TRUE, 142, 31),
(2, 'Retro Space', '2024-07-28 20:28:04', 'url29', 6405386, 'gamecover.png', TRUE, 20, 58),
(3, 'Phantom City', '2024-09-27 08:03:04', 'url30', 2409161, 'gamecover.png', FALSE, 2218, 469),
(2, 'Starlight', '2024-03-08 07:26:27', 'url31', 9471755, 'gamecover.png', FALSE, 279, 154),
(2, 'Ocean Escape', '2024-09-12 11:33:25', 'url32', 7676345, 'gamecover.png', TRUE, 669, 424),
(3, 'Witchcraft', '2024-10-22 03:44:16', 'url33', 311710, 'gamecover.png', FALSE, 1283, 273),
(5, 'Monster Dungeon', '2024-05-28 21:34:07', 'url34', 8802210, 'gamecover.png', TRUE, 1085, 445),
(2, 'Digital Storm', '2024-10-04 03:08:27', 'url35', 2290911, 'gamecover.png', FALSE, 339, 240),
(2, 'Magic Beats', '2024-08-18 11:36:55', 'url36', 6585843, 'gamecover.png', FALSE, 1356, 277),
(5, 'Stealth Ops', '2024-10-02 01:33:11', 'url37', 3273846, 'gamecover.png', FALSE, 788, 352),
(2, 'Heroic Tactics', '2024-02-28 13:29:34', 'url38', 5743569, 'gamecover.png', TRUE, 548, 142),
(3, 'Lost Relic', '2024-09-07 22:52:39', 'url39', 4016874, 'gamecover.png', TRUE, 8, 16),
(3, 'Rocket League', '2024-02-16 02:52:18', 'url40', 5744909, 'gamecover.png', FALSE, 340, 74),
(4, 'Battlezone VR', '2024-04-07 14:02:37', 'url41', 109372, 'gamecover.png', FALSE, 673, 412),
(3, 'Mech Factory', '2024-08-20 11:09:29', 'url42', 8965152, 'gamecover.png', FALSE, 982, 309),
(2, 'Sniper Alley', '2024-06-22 19:25:05', 'url43', 2178708, 'gamecover.png', FALSE, 361, 156),
(2, 'Island Raiders', '2024-03-12 13:22:36', 'url44', 9387185, 'gamecover.png', TRUE, 410, 202),
(4, 'Death Highway', '2024-03-11 23:18:58', 'url45', 8934246, 'gamecover.png', TRUE, 1469, 379),
(3, 'Asteroid Miner', '2024-04-22 05:04:34', 'url46', 8694066, 'gamecover.png', FALSE, 835, 168),
(3, 'Tropical Dash', '2024-08-04 20:43:46', 'url47', 3145439, 'gamecover.png', TRUE, 705, 165),
(5, 'Underworld', '2024-09-09 21:13:40', 'url48', 9598971, 'gamecover.png', FALSE, 913, 324),
(3, 'Firestorm', '2024-08-12 13:50:50', 'url49', 6678363, 'gamecover.png', FALSE, 422, 365),
(5, 'Cyber Samurai', '2024-02-02 12:02:14', 'url50', 1024520, 'gamecover.png', FALSE, 189, 55),
(1, 'Sky Raiders', '2025-01-12 12:45:21', 'url51', 134598, 'gamecover.png', TRUE, 502, 129),
(2, 'Nightmare Hollow', '2025-01-13 14:33:10', 'url52', 345891, 'gamecover.png', TRUE, 745, 201),
(3, 'Code Rush', '2025-01-14 16:22:08', 'url53', 948230, 'gamecover.png', TRUE, 896, 234),
(4, 'Battle of Ice', '2025-01-15 18:11:07', 'url54', 187324, 'gamecover.png', TRUE, 312, 98),
(5, 'Cyber Jungle', '2025-01-16 20:00:06', 'url55', 293847, 'gamecover.png', TRUE, 438, 112),
(1, 'Moonlight Arena', '2025-01-17 09:45:05', 'url56', 123984, 'gamecover.png', TRUE, 384, 84),
(2, 'Tornado Smash', '2025-01-18 11:34:04', 'url57', 567823, 'gamecover.png', TRUE, 920, 211),
(3, 'Dungeon Pixel', '2025-01-19 13:23:03', 'url58', 345982, 'gamecover.png', TRUE, 673, 165),
(4, 'Time Paradox', '2025-01-20 15:12:02', 'url59', 891237, 'gamecover.png', TRUE, 1023, 304),
(5, 'Rogue Planet', '2025-01-21 17:01:01', 'url60', 789231, 'gamecover.png', TRUE, 546, 176),
(1, 'Inferno Run', '2025-01-22 08:55:59', 'url61', 234765, 'gamecover.png', TRUE, 678, 201),
(2, 'Toxic Planet', '2025-01-23 10:44:58', 'url62', 893421, 'gamecover.png', TRUE, 745, 233),
(3, 'Last Survivor', '2025-01-24 12:33:57', 'url63', 123456, 'gamecover.png', TRUE, 321, 95),
(4, 'Desert Echoes', '2025-01-25 14:22:56', 'url64', 654321, 'gamecover.png', TRUE, 879, 298),
(5, 'Shadow City', '2025-01-26 16:11:55', 'url65', 321789, 'gamecover.png', TRUE, 420, 144),
(1, 'Titanium Drift', '2025-01-27 18:00:54', 'url66', 978231, 'gamecover.png', TRUE, 1056, 333),
(2, 'Plasma Break', '2025-01-28 19:49:53', 'url67', 482931, 'gamecover.png', TRUE, 690, 221),
(3, 'Zombie Rush', '2025-01-29 21:38:52', 'url68', 573829, 'gamecover.png', TRUE, 360, 130),
(4, 'Alien Shadows', '2025-01-30 23:27:51', 'url69', 293857, 'gamecover.png', TRUE, 548, 162),
(5, 'Mystic Quest', '2025-02-01 01:16:50', 'url70', 712983, 'gamecover.png', TRUE, 802, 189),
(1, 'Robot Brawl', '2025-02-02 03:05:49', 'url71', 682371, 'gamecover.png', TRUE, 952, 278),
(2, 'Nightwatch', '2025-02-03 04:54:48', 'url72', 123098, 'gamecover.png', TRUE, 198, 77),
(3, 'Ocean Maze', '2025-02-04 06:43:47', 'url73', 876543, 'gamecover.png', TRUE, 742, 200),
(4, 'Pixel World', '2025-02-05 08:32:46', 'url74', 293847, 'gamecover.png', TRUE, 615, 172),
(5, 'Steel Titans', '2025-02-06 10:21:45', 'url75', 385721, 'gamecover.png', TRUE, 832, 256),
(1, 'Volcano Base', '2025-02-07 12:10:44', 'url76', 983217, 'gamecover.png', TRUE, 723, 243),
(2, 'Haunted Forest', '2025-02-08 13:59:43', 'url77', 234567, 'gamecover.png', TRUE, 387, 123),
(3, 'Subzero Strike', '2025-02-09 15:48:42', 'url78', 456789, 'gamecover.png', TRUE, 541, 156),
(4, 'Warp Dimension', '2025-02-10 17:37:41', 'url79', 123789, 'gamecover.png', TRUE, 456, 128),
(5, 'Crystal Kingdom', '2025-02-11 19:26:40', 'url80', 789654, 'gamecover.png', TRUE, 802, 231),
(1, 'Stormfront', '2025-02-12 21:15:39', 'url81', 891234, 'gamecover.png', TRUE, 1023, 289),
(2, 'Twilight Clash', '2025-02-13 23:04:38', 'url82', 324987, 'gamecover.png', TRUE, 672, 213),
(3, 'Digital Fortress', '2025-02-14 00:53:37', 'url83', 564738, 'gamecover.png', TRUE, 896, 277),
(4, 'Frozen Chaos', '2025-02-15 02:42:36', 'url84', 785634, 'gamecover.png', TRUE, 745, 198),
(5, 'Quantum Speed', '2025-02-16 04:31:35', 'url85', 982371, 'gamecover.png', TRUE, 615, 175),
(1, 'Fire Temple', '2025-02-17 06:20:34', 'url86', 473829, 'gamecover.png', TRUE, 684, 214),
(2, 'Neon Lights', '2025-02-18 08:09:33', 'url87', 349871, 'gamecover.png', TRUE, 723, 265),
(3, 'Skull Fortress', '2025-02-19 09:58:32', 'url88', 124578, 'gamecover.png', TRUE, 832, 201),
(4, 'Electric Racer', '2025-02-20 11:47:31', 'url89', 934857, 'gamecover.png', TRUE, 940, 248),
(5, 'Apocalypse Run', '2025-02-21 13:36:30', 'url90', 124398, 'gamecover.png', TRUE, 360, 97),
(1, 'Meteor Shower', '2025-02-22 15:25:29', 'url91', 384756, 'gamecover.png', TRUE, 712, 203),
(2, 'Dream Valley', '2025-02-23 17:14:28', 'url92', 981273, 'gamecover.png', TRUE, 803, 249),
(3, 'Frostbite Peak', '2025-02-24 19:03:27', 'url93', 768932, 'gamecover.png', TRUE, 690, 231),
(4, 'Steampunk Ops', '2025-02-25 20:52:26', 'url94', 489321, 'gamecover.png', TRUE, 512, 177),
(5, 'Raging Thunder', '2025-02-26 22:41:25', 'url95', 573890, 'gamecover.png', TRUE, 833, 245),
(1, 'Ancient Prophecy', '2025-02-27 00:30:24', 'url96', 918273, 'gamecover.png', TRUE, 915, 281),
(2, 'Dark Fortress', '2025-02-28 02:19:23', 'url97', 742689, 'gamecover.png', TRUE, 684, 197),
(3, 'Savage Hunt', '2025-03-01 04:08:22', 'url98', 129384, 'gamecover.png', TRUE, 415, 123),
(4, 'Wind Rider', '2025-03-02 05:57:21', 'url99', 302948, 'gamecover.png', TRUE, 489, 140),
(5, 'Star Colony', '2025-03-03 07:46:20', 'url100', 573891, 'gamecover.png', TRUE, 678, 185);

-- CONTENT_BLOCKS
INSERT INTO content_blocks (game_id, block_type, content, block_number, block_row, block_col) VALUES
(1, 'text', 'BC:1 Texto corto 1', 1, 1, 1),
(1, 'image', 'BC:1 mountain.jpg', 1, 1, 2),
(1, 'image', 'BC:1 mountain.jpg', 1, 1, 3),
(1, 'text', 'BC:1 Texto corto 4', 1, 2, 1),
(1, 'text', 'BC:1 Texto corto 5', 1, 2, 2),
(1, 'text', 'BC:1 Texto corto 6', 1, 2, 3),
(1, 'text', 'BC:2 Texto corto 7', 2, 1, 1),
(1, 'text', 'BC:2 Texto corto 8', 2, 1, 2);


-- USERS_RATING
INSERT INTO game_ratings (game_id, user_id, rating) VALUES
(1, 1, 4.2),
(2, 1, 3.5),
(3, 1, 2.8),
(4, 1, 4.0),
(5, 1, 3.7),
(6, 1, 4.5),
(7, 1, 3.2),
(8, 1, 4.1),
(9, 1, 2.9),
(10, 1, 3.0),
(11, 2, 4.0),
(12, 2, 4.2),
(13, 2, 2.6),
(14, 2, 3.8),
(15, 2, 3.1),
(16, 2, 3.9),
(17, 2, 4.4),
(18, 2, 2.7),
(19, 2, 3.3),
(20, 2, 2.4),
(21, 3, 4.5),
(22, 3, 3.2),
(23, 3, 2.8),
(24, 3, 3.5),
(25, 3, 3.9),
(26, 3, 4.1),
(27, 3, 4.0),
(28, 3, 3.7),
(29, 3, 4.3),
(30, 3, 3.6),
(31, 4, 2.9),
(32, 4, 3.4),
(33, 4, 3.1),
(34, 4, 3.8),
(35, 4, 2.6),
(36, 4, 4.2),
(37, 4, 4.4),
(38, 4, 3.0),
(39, 4, 3.9),
(40, 4, 2.7),
(41, 5, 3.6),
(42, 5, 4.1),
(43, 5, 4.0),
(44, 5, 3.7),
(45, 5, 2.8),
(46, 5, 4.3),
(47, 5, 4.5),
(48, 5, 3.2),
(49, 5, 3.9),
(50, 5, 2.9),
(1, 6, 3.4),
(2, 6, 4.1),
(3, 6, 2.5),
(4, 6, 3.8),
(5, 6, 3.2),
(6, 6, 4.3),
(7, 6, 4.0),
(8, 6, 3.6),
(9, 6, 4.2),
(10, 6, 3.9),
(11, 7, 2.7),
(12, 7, 3.5),
(13, 7, 2.9),
(14, 7, 3.3),
(15, 7, 4.0),
(16, 7, 2.8),
(17, 7, 4.4),
(18, 7, 3.6),
(19, 7, 2.6),
(20, 7, 3.7),
(21, 1, 4.0),
(22, 1, 3.2),
(23, 1, 2.9),
(24, 1, 3.5),
(25, 1, 4.3),
(26, 1, 3.8),
(27, 1, 4.2),
(28, 1, 3.7),
(29, 1, 4.1),
(30, 1, 3.4),
(31, 2, 3.3),
(32, 2, 2.8),
(33, 2, 4.1),
(34, 2, 3.6),
(35, 2, 3.7),
(36, 2, 2.9),
(37, 2, 4.3),
(38, 2, 3.2),
(39, 2, 4.0),
(40, 2, 3.5),
(41, 3, 4.4),
(42, 3, 3.1),
(43, 3, 3.6),
(44, 3, 4.2),
(45, 3, 4.1),
(46, 3, 3.7),
(47, 3, 2.9),
(48, 3, 4.3),
(49, 3, 3.8),
(50, 3, 4.5);

-- CATEGORIES
INSERT INTO categories (name) VALUES
('action'),
('adventure'),
('platformer'),
('shooter_first_person'),
('shooter_third_person'),
('fighting'),
('survival_horror'),
('stealth'),
('open_world'),
('rpg'),
('jrpg'),
('tactical_rpg'),
('mmorpg'),
('simulation'),
('life_simulation'),
('flight_simulation'),
('driving_simulation'),
('job_simulation'),
('sports'),
('football'),
('basketball'),
('racing'),
('skateboarding'),
('golf'),
('wrestling'),
('puzzle'),
('strategy_turn_based'),
('strategy_real_time'),
('city_builder'),
('metroidvania'),
('roguelike'),
('roguelite'),
('rhythm'),
('battle_royale'),
('party_game'),
('visual_novel'),
('dating_simulator'),
('educational'),
('idle_incremental'),
('card_game'),
('arcade'),
('hack_and_slash'),
('bullet_hell'),
('psychological_horror'),
('narrative'),
('moba'),
('tower_defense'),
('sandbox'),
('vr'),
('ar'),
('tycoon'),
('text_adventure'),
('rhythm_platformer'),
('fitness_exergaming'),
('social_casual');

-- GAME_CATEGORIES
INSERT INTO game_categories (game_id, category_id) VALUES
(1, 3),
(1, 5),
(1, 9),
(2, 16),
(3, 9),
(4, 6),
(4, 40),
(4, 35),
(5, 26),
(5, 32),
(6, 3),
(6, 7),
(7, 23),
(8, 32),
(8, 15),
(8, 36),
(9, 37),
(9, 17),
(10, 38),
(11, 19),
(12, 18),
(12, 24),
(12, 52),
(13, 2),
(14, 49),
(15, 36),
(16, 14),
(16, 2),
(17, 48),
(17, 22),
(18, 12),
(18, 41),
(19, 43),
(19, 40),
(20, 55),
(21, 9),
(21, 8),
(22, 35),
(23, 21),
(24, 47),
(24, 11),
(25, 28),
(25, 29),
(25, 13),
(26, 38),
(27, 23),
(28, 5),
(28, 22),
(29, 44),
(30, 23),
(31, 37),
(31, 36),
(31, 34),
(32, 21),
(33, 53),
(34, 6),
(34, 18),
(34, 28),
(35, 26),
(35, 44),
(36, 3),
(36, 52),
(36, 39),
(37, 35),
(38, 25),
(39, 36),
(39, 3),
(40, 8),
(40, 54),
(41, 33),
(42, 20),
(42, 47),
(43, 42),
(43, 21),
(44, 12),
(44, 43),
(45, 55),
(45, 22),
(46, 8),
(46, 53),
(47, 25),
(47, 1),
(48, 19),
(49, 39),
(50, 40);

-- POSTS
INSERT INTO posts (game_id, developer_id, title, content, post_date) VALUES
(1, 3, 'Minor bugs fixed', 'In this update, we focused on fixing minor bugs that were causing issues with the gameplay experience. We addressed small inconsistencies in the game logic that could affect performance, as well as some graphical glitches that appeared in certain scenarios. Players should now notice smoother transitions and fewer crashes or unexpected behavior in the game.', '2024-11-03 16:49:10'),
(1, 3, 'New level added', 'A brand new level has been added to the game, expanding the overall experience. This level introduces new environmental challenges, puzzles, and enemies, designed to test the skills of even the most seasoned players. We’ve added several interactive elements that make this level unique, along with a new soundtrack to immerse players in the atmosphere of the new world.', '2024-11-24 10:12:25'),
(1, 3, 'Improved graphics performance', 'This update brings significant improvements to the graphics performance. We’ve optimized several rendering processes, particularly in high-intensity areas where performance issues were most noticeable. Players will now experience faster loading times, more stable frame rates, and reduced graphical lag. Additionally, we’ve improved texture quality in specific environments to enhance visual fidelity.', '2024-12-15 14:45:00'),
(1, 3, 'Bug fixes and tweaks', 'In this patch, we’ve focused on several key bug fixes and gameplay tweaks. These include adjustments to AI behavior in certain combat scenarios, which now makes enemy tactics more challenging and realistic. We\'ve also fixed several collision issues, ensuring that characters and objects no longer get stuck in walls or other environmental features. Several minor visual bugs in the HUD have also been addressed for a more polished experience.', '2025-01-05 09:30:50'),
(1, 3, 'Added multiplayer mode', 'This major update introduces multiplayer mode to the game. Players can now team up with friends and enjoy a cooperative experience, tackling challenges together. Multiplayer features include voice chat, leaderboards, and cross-platform support. In addition, we’ve included dedicated servers to ensure a smooth and lag-free gaming experience. We’ve also added new multiplayer-specific missions and rewards to make the experience more exciting.', '2025-01-26 11:00:12'),
(1, 3, 'Minor UI adjustments', 'In this update, we’ve made several adjustments to the user interface to improve overall usability. The menus have been redesigned for better navigation, and we’ve streamlined the HUD to reduce clutter. Additionally, we’ve added customizations for players to adjust the layout according to their preferences. New icons and more intuitive tooltips have been introduced to help users understand the features at a glance.', '2025-02-16 13:25:35'),
(1, 3, 'Optimization for better performance', 'This update focuses on optimizing game performance across all platforms. We’ve worked on reducing memory usage and improving the overall frame rate stability. Specifically, we\'ve enhanced loading times, reduced stuttering in certain areas, and improved the responsiveness of the controls. Several game assets were compressed to decrease loading times and improve in-game performance, making it smoother for all users.', '2025-03-09 16:55:40'),
(1, 3, 'New characters introduced', 'The game now features new characters, each with their own unique abilities, backstories, and playstyles. These characters are introduced through a series of story-driven quests that expand the game’s narrative. In addition to these characters, new voice lines and animated cutscenes have been included to provide a richer storytelling experience. Players can unlock these characters through progression or special in-game events.', '2025-03-30 18:22:10'),
(1, 3, 'Bug fixes and level balancing', 'This update focuses on resolving several remaining bugs and balancing issues across the game’s levels. We’ve fine-tuned enemy difficulty to ensure a smoother progression curve, making the game more enjoyable for players of all skill levels. A number of platforming sections have been tweaked for better fluidity, and we’ve fixed some minor bugs related to quest triggers. Additionally, we’ve made adjustments to the loot system, ensuring that rewards are more balanced across the various difficulty levels.', '2025-04-20 12:10:05'),
(1, 3, 'Major content expansion', 'In this significant update, we’ve added a large amount of new content to the game. This includes several new quests, areas to explore, and optional side missions. We’ve expanded the game’s lore with new NPCs and storylines that provide deeper context to the world. New gameplay mechanics have also been introduced, allowing for greater customization of characters. Additionally, we’ve added a plethora of new gear, items, and cosmetic options, ensuring that players have even more ways to personalize their experience.', '2025-05-11 14:00:45');

INSERT INTO posts_images (post_id, type, content, order_index) VALUES
(10, 'image', 'url1', 1),
(10, 'image', 'url2', 2),
(10, 'image', 'url3', 3);

-- COMMENTS
-- Comentarios para el juego con id 1 (Galactic War)
INSERT INTO comments (game_id, post_id, user_id, content, comment_date, comment_id) VALUES
(1, 1, 1, 'Great improvement!', '2024-11-04 10:00:00', NULL),
(1, 1, 2, 'Really enjoyed the new features!', '2024-11-04 12:00:00', NULL),
(1, 1, 3, 'Could use more levels', '2024-11-04 14:00:00', NULL),
(1, 1, 4, 'Awesome gameplay!', '2024-11-04 16:00:00', NULL),
(1, 1, 5, 'I agree, but some improvements are needed', '2024-11-04 18:00:00', 1),

(1, 2, 1, 'Love the new level', '2024-07-23 10:00:00', NULL),
(1, 2, 2, 'The game looks promising!', '2024-07-23 12:00:00', NULL),
(1, 2, 3, 'Need some improvements on the gameplay', '2024-07-23 14:00:00', NULL),
(1, 2, 4, 'The atmosphere is great, but the controls are a bit off', '2024-07-23 16:00:00', NULL),
(1, 2, 5, 'I have to disagree, the controls are just fine', '2024-07-23 18:00:00', 8);

-- GAME_JAMS
INSERT INTO game_jams (
    winner_id, winning_game_id, title, description, theme,
    registration_start, registration_end,
    creation_start, creation_end,
    voting_start, voting_end,
    is_open, cover, rewards, is_last
) VALUES 
(
    2, 2, 'Sci-Fi Jam 2025', 'Build futuristic adventures.', 'Space & Tech',
    '2025-03-01 00:00:00', '2025-03-07 23:59:59',
    '2025-03-08 00:00:00', '2025-03-21 23:59:59',
    '2025-03-22 00:00:00', '2025-03-28 23:59:59',
    FALSE, 'sci-fi-jam-cover.png', 300, FALSE
),
(
    5, 6, 'Fantasy Jam 2025', 'Unleash your imagination in magical realms.', 'Fantasy',
    '2025-04-01 00:00:00', '2025-04-07 23:59:59',
    '2025-04-08 00:00:00', '2025-04-21 23:59:59',
    '2025-04-22 00:00:00', '2025-04-28 23:59:59',
    FALSE, 'fantasy-jam-cover.png', 400, TRUE
),
(
    NULL, NULL, 'Time Travel Jam 2025', 'Create games that bend time and reality.', 'Time Travel',
    '2025-05-01 00:00:00', '2025-05-07 23:59:59',
    '2025-05-08 00:00:00', '2025-05-21 23:59:59',
    '2025-05-22 00:00:00', '2025-05-28 23:59:59',
    TRUE, 'timetravel-jam-cover.png', 500, FALSE
),
(
    NULL, NULL, 'Time Travel Jam 2025', 'Create games that bend time and reality.', 'Time Travel',
    '2025-06-01 00:00:00', '2025-06-07 23:59:59',
    '2025-06-08 00:00:00', '2025-06-21 23:59:59',
    '2025-06-22 00:00:00', '2025-06-28 23:59:59',
    FALSE, 'timetravel-jam-cover.png', 500, FALSE
);


-- GAMES_GAME_JAMS
INSERT INTO games_game_jams (game_id, game_jam_id) VALUES
(1, 2),
(2, 1),
(3, 3),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 3),
(10, 2),
(11, 2),
(12, 2),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(19, 2),
(20, 2),
(21, 3);


-- GAME_JAM_PARTICIPANTS
INSERT INTO game_jam_participants (game_jam_id, developer_id) VALUES
(1, 2),
(2, 2),
(3, 2);

-- GAME_JAM_VOTES
INSERT INTO game_jam_votes (game_jam_id, game_id, user_id, originality, art, music, fun, theme, comment, vote_date) VALUES
(3, 3, 1, 1, 2, 4, 3, 3, 'Amazing graphics!', '2025-05-06 11:40:08'),
(3, 3, 1, 5, 2, 1, 5, 2, 'The controls are a bit tricky', '2025-05-06 11:40:08'),
(3, 3, 1, 5, 1, 4, 1, 3, 'The controls are a bit tricky', '2025-05-06 11:40:08'),
(3, 1, 1, 4, 4, 2, 4, 1, 'Could be more fun', '2025-05-06 11:40:08'),
(3, 2, 2, 1, 2, 1, 3, 2, 'Excellent sound design', '2025-05-06 11:40:08'),
(3, 1, 2, 2, 5, 3, 3, 3, 'The controls are a bit tricky', '2025-05-06 11:40:08'),
(3, 3, 2, 4, 4, 4, 1, 5, 'The controls are a bit tricky', '2025-05-06 11:40:08'),
(3, 1, 2, 3, 2, 4, 4, 2, 'Great game!', '2025-05-06 11:40:08'),
(3, 3, 3, 5, 5, 4, 1, 3, 'Excellent sound design', '2025-05-06 11:40:08'),
(3, 3, 3, 1, 4, 5, 5, 4, 'Amazing graphics!', '2025-05-06 11:40:08'),
(3, 1, 3, 2, 4, 1, 4, 5, 'Amazing graphics!', '2025-05-06 11:40:08'),
(3, 2, 4, 4, 4, 4, 4, 5, 'Too hard for me', '2025-05-06 11:40:08'),
(3, 1, 4, 3, 5, 3, 3, 4, 'Could be more fun', '2025-05-06 11:40:08'),
(3, 2, 4, 4, 1, 3, 5, 1, 'Too hard for me', '2025-05-06 11:40:08'),
(3, 1, 4, 5, 5, 2, 2, 3, 'Not my style', '2025-05-06 11:40:08'),
(3, 2, 5, 3, 2, 5, 1, 4, 'Could be more fun', '2025-05-06 11:40:08'),
(3, 1, 5, 3, 3, 3, 1, 4, 'Could be more fun', '2025-05-06 11:40:08'),
(3, 1, 5, 4, 5, 2, 3, 4, 'The controls are a bit tricky', '2025-05-06 11:40:08'),
(3, 1, 6, 1, 3, 3, 4, 2, 'Too hard for me', '2025-05-06 11:40:08'),
(3, 1, 6, 4, 5, 1, 3, 1, 'Not my style', '2025-05-06 11:40:08'),
(3, 3, 6, 2, 2, 3, 5, 3, 'Amazing graphics!', '2025-05-06 11:40:08'),
(3, 3, 6, 3, 1, 4, 1, 5, 'Could be more fun', '2025-05-06 11:40:08'),
(3, 1, 7, 3, 4, 3, 3, 1, 'Could be more fun', '2025-05-06 11:40:08'),
(3, 2, 7, 3, 2, 1, 1, 1, 'Excellent sound design', '2025-05-06 11:40:08'),
(3, 1, 7, 3, 4, 1, 4, 1, 'Too hard for me', '2025-05-06 11:40:08'),
(3, 2, 7, 1, 2, 5, 5, 1, 'Great game!', '2025-05-06 11:40:08');



