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
('Ana Torres', 'ana@gmail.com', 'ana', 'user', NOW(), true, null),
('Luis Pérez', 'luis@gmail.com', 'luis', 'developer', NOW(), false, null),
('Clara Gómez', 'clara@gmail.com', 'clara', 'admin', NOW(), true, null);

-- GAMES
INSERT INTO games (developer_id, title, description, upload_date, download_url, rating) VALUES
(2, 'Space Runner', 'Space racing game', NOW(), 'url1', 4.2),
(2,  'Mysterious Tower', 'Explore a puzzle-filled tower', NOW(), 'url2', 3.8),
(2,  'Ninja Cat', 'Platformer with a ninja cat', NOW(), 'url3', 4.9);

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
(1, 3), -- Space Runner -> Adventure
(1, 5), -- Space Runner -> Adventure
(1, 9), -- Space Runner -> Adventure
(2, 16), -- Mysterious Tower -> Puzzle
(3, 9); -- Ninja Cat -> Platformer

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
