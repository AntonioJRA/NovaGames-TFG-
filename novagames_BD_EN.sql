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
    description TEXT,
    upload_date DATETIME DEFAULT NOW(),
    download_url VARCHAR(255),
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
    name VARCHAR(255),
    type ENUM('cover', 'screenshot')
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
INSERT INTO games (developer_id, title, description, upload_date, download_url, rating) VALUES
(3, 'Galactic War', 'A space strategy game where you conquer galaxies.', '2024-11-03 16:49:10', 'url1', 3.3),
(2, 'Mystic Island', 'Explore a mystical island full of secrets and puzzles.', '2024-07-22 09:24:43', 'url2', 3.4),
(3, 'Shadow Hunter', 'A stealth-action game where you hunt supernatural beings.', '2023-07-17 08:56:42', 'url3', 2.5),
(3, 'Pixel Dash', 'Fast-paced pixel platformer with tricky levels.', '2024-11-01 18:55:30', 'url4', 0.6),
(3, 'Dragon Trials', 'Survive dragon-infested arenas and unlock powers.', '2025-02-13 07:07:23', 'url5', 1.5),
(5, 'Rogue Quest', 'A roguelike dungeon crawler with random levels.', '2024-07-20 17:34:28', 'url6', 0.9),
(5, 'Zombie School', 'Defend your school against a zombie outbreak!', '2023-11-27 00:19:39', 'url7', 4.4),
(3, 'Dark Moon', 'A dark action RPG set on a cursed moon colony.', '2024-01-21 13:55:00', 'url8', 3.8),
(2, 'Neon Drift', 'Drift through neon-lit cityscapes in retro cars.', '2025-03-24 03:56:53', 'url9', 1.6),
(4, 'Frozen Tundra', 'Survive freezing storms in an arctic adventure.', '2024-12-08 03:36:20', 'url10', 2.7),
(2, 'Lost in Space', 'Sci-fi platformer lost in deep space anomalies.', '2023-09-01 16:51:55', 'url11', 0.3),
(5, 'Quantum Breaker', 'Break time barriers in this physics-based shooter.', '2024-04-27 10:57:04', 'url12', 4.1),
(2, 'Jungle Trap', 'Jungle traps await in this endless runner game.', '2025-01-14 11:57:03', 'url13', 4.0),
(3, 'Tower Defense', 'Classic tower defense with new magic-based towers.', '2024-11-06 00:12:48', 'url14', 0.3),
(4, 'Mega Bot', 'Robot battles in futuristic arenas across the galaxy.', '2024-11-24 18:48:05', 'url15', 1.1),
(5, 'Alien Siege', 'Defend Earth from an alien invasion in VR!', '2023-06-06 20:17:30', 'url16', 2.8),
(5, 'Crystal Maze', 'Solve light-based puzzles in a crystal labyrinth.', '2024-02-25 13:50:01', 'url17', 3.1),
(5, 'Solar Battle', 'Engage in tactical solar-powered space battles.', '2023-11-23 14:26:18', 'url18', 2.6),
(2, 'Cursed Castle', 'Explore a haunted castle and uncover its secrets.', '2023-07-05 18:50:47', 'url19', 1.3),
(2, 'Iron Mecha', 'Control a giant mecha in futuristic wars.', '2025-04-04 10:42:40', 'url20', 4.6),
(3, 'Cyber Clash', 'Cybernetic battles in a post-apocalyptic world.', '2024-08-22 19:37:06', 'url21', 5.0),
(5, 'Lava Run', 'Dash through volcanic ruins dodging hazards.', '2024-06-25 06:04:46', 'url22', 4.9),
(3, 'Toxic Swamp', 'Survive in a toxic swamp full of monsters.', '2024-08-20 18:06:53', 'url23', 3.6),
(4, 'Dream Catcher', 'Trap and defeat nightmares in dream realms.', '2023-06-05 18:24:17', 'url24', 1.8),
(3, 'Haunted Circus', 'Escape a cursed circus with clever tricks.', '2025-02-14 13:04:29', 'url25', 3.1),
(2, 'Biohazard X', 'Survive a viral outbreak in a cyber lab.', '2024-10-08 22:06:07', 'url26', 3.0),
(4, 'Twilight Arena', 'Fight in a surreal arena under twilight skies.', '2024-03-07 17:38:24', 'url27', 4.2),
(4, 'Sky High', 'Skydiving battles across floating islands.', '2024-09-17 19:42:26', 'url28', 4.4),
(4, 'Retro Space', 'Classic 8-bit shooter set in retro space.', '2024-04-05 07:40:45', 'url29', 2.5),
(5, 'Phantom City', 'Investigate paranormal activity in a ghost town.', '2023-05-06 10:44:21', 'url30', 1.4),
(3, 'Starlight', 'Explore a magical starlit realm of illusions.', '2024-08-30 18:36:22', 'url31', 0.9),
(3, 'Ocean Escape', 'Escape from a sinking tropical resort.', '2025-01-30 02:13:13', 'url32', 1.7),
(3, 'Witchcraft', 'Cast spells and summon beasts to win battles.', '2023-06-29 22:44:06', 'url33', 4.3),
(2, 'Monster Dungeon', 'Dungeon crawling with epic monster fights.', '2023-10-07 01:33:06', 'url34', 3.0),
(4, 'Digital Storm', 'A data-driven storm in a digital world.', '2024-03-28 14:44:45', 'url35', 2.4),
(3, 'Magic Beats', 'Rhythm-based magic casting dance game.', '2024-01-26 00:35:19', 'url36', 4.1),
(3, 'Stealth Ops', 'Sneak past guards and hack terminals undetected.', '2024-11-10 20:28:07', 'url37', 2.6),
(2, 'Heroic Tactics', 'Turn-based tactics in heroic medieval battles.', '2023-08-31 15:03:32', 'url38', 3.3),
(4, 'Lost Relic', 'Uncover lost artifacts in ancient ruins.', '2025-02-28 16:01:41', 'url39', 2.3),
(5, 'Rocket League', 'Futuristic soccer with rocket-powered cars.', '2024-08-04 23:03:30', 'url40', 4.5),
(5, 'Battlezone VR', 'Battle in virtual reality war zones.', '2023-12-23 21:39:38', 'url41', 2.2),
(2, 'Mech Factory', 'Build powerful mechs to conquer factories.', '2024-02-10 11:55:20', 'url42', 2.6),
(2, 'Sniper Alley', 'Take down enemies from long distances.', '2024-09-14 02:38:09', 'url43', 3.6),
(4, 'Island Raiders', 'Raid and pillage tropical islands.', '2024-10-16 18:03:39', 'url44', 1.0),
(4, 'Death Highway', 'Racing on a deadly post-apocalyptic highway.', '2024-03-14 23:44:39', 'url45', 1.7),
(3, 'Asteroid Miner', 'Mine rare ores on dangerous asteroids.', '2025-04-17 12:03:58', 'url46', 4.7),
(3, 'Tropical Dash', 'High-speed races through tropical islands.', '2024-04-22 21:17:47', 'url47', 2.9),
(5, 'Underworld', 'Survive the underworlds deadly trials.', '2023-07-31 05:27:32', 'url48', 1.4),
(4, 'Firestorm', 'A fire-powered battle game with pyrotechnics.', '2024-06-01 20:35:26', 'url49', 3.9),
(5, 'Cyber Samurai', 'Become a futuristic cybernetic samurai.', '2024-01-01 03:45:19', 'url50', 2.8);

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
INSERT INTO images (game_id, name, type) VALUES
(1, 'space_runner_cover.jpg', 'cover'),
(2, 'mysterious_tower_ss1.png', 'screenshot'),
(3, 'ninja_cat_ss2.png', 'screenshot');

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
