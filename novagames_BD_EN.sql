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
    verification_token VARCHAR(255)
);

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    developer_id INT,
    title VARCHAR(100),
    upload_date DATETIME DEFAULT NOW(),
    download_url VARCHAR(255),
    rating_count INT,
    rating_sum DECIMAL(2,1),
    downloads INT,
    cover VARCHAR(255)
);

CREATE TABLE content_blocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id INT, 
  block_type ENUM('text', 'image', 'video'), 
  content TEXT,
  order_index INT,
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

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT,
    post_id INT,
    user_id INT,
    content TEXT,
    comment_date DATETIME DEFAULT NOW()
);

CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT,
    name VARCHAR(255)
);

CREATE TABLE game_jams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    winner_id INT DEFAULT NULL,
    title VARCHAR(100),
    description TEXT,
    theme VARCHAR(50),
    start_date DATETIME DEFAULT NOW(),
    end_date DATETIME DEFAULT NOW(),
    is_open BOOLEAN
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
    vote_score DECIMAL(2,1),
    originality INT,
    art INT,
    music INT,
    fun INT,
    theme INT,
    comment VARCHAR(255),
    vote_date DATETIME DEFAULT NOW()
);

-- Juegos creados por el usuario (desarrollador)
ALTER TABLE games
    ADD CONSTRAINT fk_game_developer FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE;
    
-- Juegos y sus categorias
ALTER TABLE game_categories
	ADD CONSTRAINT pk_game_categories PRIMARY KEY (game_id, category_id);

-- Valoraciones de los juegos por usuarios
ALTER TABLE game_ratings
    ADD CONSTRAINT pk_valoracion PRIMARY KEY (game_id, user_id),
    ADD CONSTRAINT fk_game_ratings FOREIGN KEY (game_id) REFERENCES games(id),
    ADD CONSTRAINT fk_valoracion_usuario FOREIGN KEY (user_id) REFERENCES users(id);

-- Publicaciones hechas por el usuario (desarrollador)
ALTER TABLE posts
    ADD CONSTRAINT fk_post_developer FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE;

-- Comentarios hechos por el usuario
ALTER TABLE comments
    ADD CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Votos emitidos por el usuario
ALTER TABLE game_jam_votes
    ADD CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Ganador de una game jam (si se elimina el ganador, puedes dejarlo en NULL si prefieres)
ALTER TABLE game_jams
    ADD CONSTRAINT fk_jam_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Participación en game jams
ALTER TABLE game_jam_participants
    ADD CONSTRAINT fk_participant_user FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE;


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
INSERT INTO games (developer_id, title, upload_date, download_url, downloads, cover) VALUES
(3, 'Galactic War', '2024-11-03 16:49:10', 'url1', 1234567, 'gamecover.png'),
(2, 'Mystic Island', '2024-07-22 09:24:43', 'url2', 2345678, 'gamecover.png'),
(3, 'Shadow Hunter', '2023-07-17 08:56:42', 'url3', 3456789, 'gamecover.png'),
(3, 'Pixel Dash', '2024-11-01 18:55:30', 'url4', 4567890, 'gamecover.png'),
(3, 'Dragon Trials', '2025-02-13 07:07:23', 'url5', 5678901, 'gamecover.png'),
(5, 'Rogue Quest', '2024-07-20 17:34:28', 'url6', 6789012, 'gamecover.png'),
(5, 'Zombie School', '2023-11-27 00:19:39', 'url7', 7890123, 'gamecover.png'),
(3, 'Dark Moon', '2024-01-21 13:55:00', 'url8', 8901234, 'gamecover.png'),
(2, 'Neon Drift', '2025-03-24 03:56:53', 'url9', 9012345, 'gamecover.png'),
(4, 'Frozen Tundra', '2024-12-08 03:36:20', 'url10', 123456, 'gamecover.png'),
(2, 'Lost in Space', '2023-09-01 16:51:55', 'url11', 234567, 'gamecover.png'),
(5, 'Quantum Breaker', '2024-04-27 10:57:04', 'url12', 345678, 'gamecover.png'),
(2, 'Jungle Trap', '2025-01-14 11:57:03', 'url13', 456789, 'gamecover.png'),
(3, 'Tower Defense', '2024-11-06 00:12:48', 'url14', 567890, 'gamecover.png'),
(4, 'Mega Bot', '2024-11-24 18:48:05', 'url15', 678901, 'gamecover.png'),
(5, 'Alien Siege', '2023-06-06 20:17:30', 'url16', 789012, 'gamecover.png'),
(5, 'Crystal Maze', '2024-02-25 13:50:01', 'url17', 890123, 'gamecover.png'),
(5, 'Solar Battle', '2023-11-23 14:26:18', 'url18', 901234, 'gamecover.png'),
(2, 'Cursed Castle', '2023-07-05 18:50:47', 'url19', 12345, 'gamecover.png'),
(2, 'Iron Mecha', '2025-04-04 10:42:40', 'url20', 23456, 'gamecover.png'),
(3, 'Cyber Clash', '2024-08-22 19:37:06', 'url21', 34567, 'gamecover.png'),
(5, 'Lava Run', '2024-06-25 06:04:46', 'url22', 45678, 'gamecover.png'),
(3, 'Toxic Swamp', '2024-08-20 18:06:53', 'url23', 56789, 'gamecover.png'),
(4, 'Dream Catcher', '2023-06-05 18:24:17', 'url24', 67890, 'gamecover.png'),
(3, 'Haunted Circus', '2025-02-14 13:04:29', 'url25', 78901, 'gamecover.png'),
(2, 'Biohazard X', '2024-10-08 22:06:07', 'url26', 89012, 'gamecover.png'),
(4, 'Twilight Arena', '2024-03-07 17:38:24', 'url27', 90123, 'gamecover.png'),
(4, 'Sky High', '2024-09-17 19:42:26', 'url28', 12345, 'gamecover.png'),
(4, 'Retro Space', '2024-04-05 07:40:45', 'url29', 23456, 'gamecover.png'),
(5, 'Phantom City', '2023-05-06 10:44:21', 'url30', 34567, 'gamecover.png'),
(3, 'Starlight', '2024-08-30 18:36:22', 'url31', 45678, 'gamecover.png'),
(3, 'Ocean Escape', '2025-01-30 02:13:13', 'url32', 56789, 'gamecover.png'),
(3, 'Witchcraft', '2023-06-29 22:44:06', 'url33', 67890, 'gamecover.png'),
(2, 'Monster Dungeon', '2023-10-07 01:33:06', 'url34', 78901, 'gamecover.png'),
(4, 'Digital Storm', '2024-03-28 14:44:45', 'url35', 89012, 'gamecover.png'),
(3, 'Magic Beats', '2024-01-26 00:35:19', 'url36', 90123, 'gamecover.png'),
(3, 'Stealth Ops', '2024-11-10 20:28:07', 'url37', 12345, 'gamecover.png'),
(2, 'Heroic Tactics', '2023-08-31 15:03:32', 'url38', 23456, 'gamecover.png'),
(4, 'Lost Relic', '2025-02-28 16:01:41', 'url39', 34567, 'gamecover.png'),
(5, 'Rocket League', '2024-08-04 23:03:30', 'url40', 45678, 'gamecover.png'),
(5, 'Battlezone VR', '2023-12-23 21:39:38', 'url41', 56789, 'gamecover.png'),
(2, 'Mech Factory', '2024-02-10 11:55:20', 'url42', 67890, 'gamecover.png'),
(2, 'Sniper Alley', '2024-09-14 02:38:09', 'url43', 78901, 'gamecover.png'),
(4, 'Island Raiders', '2024-10-16 18:03:39', 'url44', 89012, 'gamecover.png'),
(4, 'Death Highway', '2024-03-14 23:44:39', 'url45', 90123, 'gamecover.png'),
(3, 'Asteroid Miner', '2025-04-17 12:03:58', 'url46', 123456, 'gamecover.png'),
(3, 'Tropical Dash', '2024-04-22 21:17:47', 'url47', 234567, 'gamecover.png'),
(5, 'Underworld', '2023-07-31 05:27:32', 'url48', 345678, 'gamecover.png'),
(4, 'Firestorm', '2024-06-01 20:35:26', 'url49', 456789, 'gamecover.png'),
(5, 'Cyber Samurai', '2024-01-01 03:45:19', 'url50', 567890, 'gamecover.png');


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
('Action'),
('Adventure'),
('Platformer'),
('Shooter (First Person)'),
('Shooter (Third Person)'),
('Fighting'),
('Survival Horror'),
('Stealth'),
('Open World'),
('RPG'),
('JRPG'),
('Tactical RPG'),
('MMORPG'),
('Simulation'),
('Life Simulation'),
('Flight Simulation'),
('Driving Simulation'),
('Job Simulation'),
('Sports'),
('Football'),
('Basketball'),
('Racing'),
('Skateboarding'),
('Golf'),
('Wrestling'),
('Puzzle'),
('Strategy (Turn-Based)'),
('Strategy (Real-Time)'),
('City Builder'),
('Metroidvania'),
('Roguelike'),
('Roguelite'),
('Rhythm'),
('Battle Royale'),
('Party Game'),
('Visual Novel'),
('Dating Simulator'),
('Educational'),
('Idle / Incremental'),
('Card Game'),
('Arcade'),
('Hack and Slash'),
('Bullet Hell'),
('Psychological Horror'),
('Narrative'),
('MOBA'),
('Tower Defense'),
('Sandbox'),
('VR (Virtual Reality)'),
('AR (Augmented Reality)'),
('Tycoon'),
('Text Adventure'),
('Rhythm Platformer'),
('Fitness / Exergaming'),
('Social / Casual');


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
(1, 2, 'Update 1.1', 'Minor bugs fixed', NOW()),
(2, 2, 'New Level', 'Includes a secret new level', NOW()),
(3, 2, 'Improved Art', 'Graphics improvements in backgrounds', NOW());

-- COMMENTS
INSERT INTO comments (game_id, post_id, user_id, content, comment_date) VALUES
(1, 1, 1, 'Great improvement!', NOW()),
(2, 2, 1, 'Love the new level', NOW()),
(3, 3, 3, 'Graphics are awesome', NOW());

-- IMAGES
INSERT INTO images (game_id, name) VALUES
(1, 'space_runner_cover.jpg'),
(2, 'mysterious_tower_ss1.png'),
(3, 'ninja_cat_ss2.png');

-- GAME_JAMS
INSERT INTO game_jams (winner_id, title, description, theme, start_date, end_date, is_open) VALUES
(2, 'Retro Jam 2024', 'Create a retro-style game', 'Retro', '2024-01-10 10:00:00', '2024-01-20 18:00:00', false),
(2, 'Space Jam', 'Games about space', 'Space', '2024-03-01 09:00:00', '2024-03-10 20:00:00', false),
(null, 'Cat Jam', 'Games about cats', 'Cats', '2024-05-01 08:00:00', '2024-05-15 23:59:59', true);


-- GAMES_GAME_JAMS
INSERT INTO games_game_jams (game_id, game_jam_id, average_score) VALUES
(1, 2, 4.3),
(2, 1, 3.9),
(3, 3, 4.7);

-- GAME_JAM_PARTICIPANTS
INSERT INTO game_jam_participants (game_jam_id, developer_id) VALUES
(1, 2),
(2, 2),
(3, 2);

-- GAME_JAM_VOTES
INSERT INTO game_jam_votes (game_jam_id, game_id, user_id, vote_score, originality, art, music, fun, theme, comment, vote_date) VALUES
(1, 2, 1, 4.0, 4, 4, 3, 4, 5, 'Very fun', NOW()),
(2, 1, 3, 4.5, 5, 4, 4, 5, 5, 'Great use of space theme', NOW()),
(3, 3, 1, 4.8, 5, 5, 5, 5, 5, 'Amazing cat game!', NOW());
