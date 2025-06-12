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
    novapoints INT DEFAULT 0,
    is_banned BOOLEAN DEFAULT FALSE,
	unban_date DATETIME DEFAULT NULL,
    recover_code INT DEFAULT NULL
);

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    developer_id INT,
    title VARCHAR(100),
    description TEXT,
    upload_date DATETIME DEFAULT NOW(),
    download_url VARCHAR(255),
    downloads INT DEFAULT 0,
    cover VARCHAR(255),
    is_open BOOLEAN DEFAULT FALSE,
    rating_count INT DEFAULT 0,
    rating_sum DECIMAL(65,1) DEFAULT 0
);

CREATE TABLE content_blocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id INT, 
  image_name TEXT,
  content VARCHAR(255),
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- CREATE TABLE content_blocks (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   game_id INT, 
--   block_type ENUM('text', 'image'),
--   block_number INT,
--   content TEXT,
--   block_row int,
--   block_col int,
--   FOREIGN KEY (game_id) REFERENCES games(id)
-- );

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
  image_name TEXT,
  content VARCHAR(255),
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
('Luis Pérez', 'wailorrox@gmail.com', '$2a$10$Nzfkb8c3ReQM5uk7uXsQ4u5NstRK7xHGZtKgtivVa6BMm8FDK2foa', 'developer', '2022-04-23 00:00:00', true, null), -- Luis123456789?
('Mario Ruiz', 'mario@gmail.com', '$2a$10$ASuFC/nWF9uwqWdgD2puteOY2bjRJG4MDnEgn00FnHI90mCRD2sqi', 'developer', '2022-09-04 00:00:00', true, null), -- Mario123456789?
('Lucía Fernández', 'lucia@gmail.com', '$2a$10$PD6bvc3bf8rXyYfAbqwRgeGTyxTBRxwnFnB6LyvM0LzPKPI0YzzKe', 'developer', '2022-01-12 00:00:00', true, null), -- Lucía123456789?
('Carlos Sánchez', 'carlos@gmail.com', '$2a$10$wFSm2qj208oq8YLMWgLbEuhqtTp9yxjZj4RBW9JrkCaKDrERIDUra', 'developer', '2022-12-12 00:00:00', true, null), -- Carlos123456789?
('Clara Gómez', 'clara@gmail.com', '$2a$10$YhihmZMOcN6cZFOQGCIDTOLSRUKUvQYfR.A5fuYcD1Jof2775Ree.', 'admin', '2022-05-04 00:00:00', true, null); -- Clara123456789?

-- GAMES
INSERT INTO games (developer_id, title, upload_date, download_url, downloads, cover, is_open, rating_sum, rating_count, description) VALUES
(3, 'Galactic War', '2024-11-03 16:49:10', 'https://github.com/AntonioJRA/NovaGames', 1234567, 'gamecover.png', TRUE, 192, 94, 'Galactic War is a space strategy game where players must lead an interstellar fleet across vast galaxies filled with enemies, valuable resources, and uncertain alliances. Every decision you make will impact the outcome of the conflict and the fate of your civilization. Will you expand your empire through diplomacy or military might? Explore unknown planets, research new technologies, and face alien civilizations in a war that will shape the future of the galaxy.'),
(2, 'Mystic Island', '2024-07-22 09:24:43', 'url2', 2345678, 'gamecover.png', TRUE, 654, 159, 'In Mystic Island, you wake up alone on a mysterious island surrounded by dense jungles, ancient ruins, and secrets buried deep underground. As you explore the environment, you will discover that this is no ordinary place—it is a portal to another world filled with magical creatures, arcane challenges, and trials that will test your wits and courage. Every corner holds a riddle that could help you escape… or trap you forever.'),
(3, 'Shadow Hunter', '2023-07-17 08:56:42', 'url3', 3456789, 'gamecover.png', TRUE, 437, 145, 'Shadow Hunter is a stealth action game where you play as a lone hunter in a world ruled by darkness. Your enemies hide in the shadows, and you must move silently, stalking from rooftops, forests, and catacombs. Each mission is a chance to uncover clues about the conspiracy threatening the kingdom. Use your camouflage skills, silent weapons, and quick reflexes to eliminate threats without being seen.'),
(3, 'Pixel Dash', '2024-11-01 18:55:30', 'url4', 4567890, 'gamecover.png', TRUE, 543, 218, 'Pixel Dash is a retro-style platformer that combines classic nostalgia with the thrill of incredibly challenging levels. Run, jump, and dodge obstacles while collecting coins and unlocking special abilities. Each level is packed with hidden secrets, alternate paths, and enemies that will test your reflexes. With vibrant chiptune music and charming pixel visuals, Pixel Dash is a perfect experience for arcade game lovers.'),
(3, 'Dragon Trials', '2025-02-13 07:07:23', 'url5', 5678901, 'gamecover.png', TRUE, 88, 44, 'In Dragon Trials, you enter a medieval fantasy world where dragons not only exist, but rule both the skies and the earth. As a young warrior destined for greatness, you must pass a series of legendary trials faced only by the bravest. Travel through snowy mountains, ancient fortresses, and volcanic caverns while battling mythical beasts, solving magical puzzles, and discovering the legacy of the ancients. Every choice matters in this epic tale of honor, fire, and glory.'),
(5, 'Rogue Quest', '2024-07-20 17:34:28', 'url6', 6789012, 'gamecover.png', TRUE, 218, 85, 'Rogue Quest is a roguelike adventure where every run is unique. You control a lone adventurer exploring procedurally generated dungeons in search of treasure, relics, and power. Each level holds deadly traps, unpredictable enemies, and tough decisions. With tactical combat and skill-based progression, you must constantly adapt to survive. Death is permanent, but every defeat teaches you something new for your next journey.'),
(7, 'Cyber Drift', '2024-10-11 22:11:19', 'url7', 7890123, 'gamecover.png', TRUE, 132, 61, 'Cyber Drift is a futuristic racing game where players drift through neon-lit cityscapes at breakneck speeds. Choose your vehicle, customize its performance, and challenge the best racers in high-stakes tournaments. Master tight turns and boost zones in a world where technology and adrenaline collide.'),
(7, 'Kingdom Builder', '2023-05-28 12:20:00', 'url8', 8901234, 'gamecover.png', TRUE, 389, 176, 'Kingdom Builder puts you in control of a growing medieval realm. Construct buildings, manage resources, and make decisions that influence the prosperity and happiness of your people. Defend your lands from invaders, forge alliances, and lead your kingdom into a golden age through wisdom and strength.'),
(7, 'Neon Abyss', '2023-11-09 03:32:45', 'url9', 9012345, 'gamecover.png', TRUE, 276, 114, 'Neon Abyss is a fast-paced roguelite where you descend into the depths of a colorful but deadly underworld. Each run gives you new weapons, upgrades, and companions that dramatically change how you play. The further you go, the more chaotic and rewarding the experience becomes.'),
(7, 'Ancient Ruins', '2024-03-01 11:48:52', 'url10', 123456, 'gamecover.png', TRUE, 142, 53, 'Ancient Ruins is an exploration-based puzzle adventure set in long-forgotten temples and tombs. Solve intricate mechanisms, interpret cryptic symbols, and uncover lost lore as you unravel the secrets of a civilization lost to time. Watch your step—some ruins are better left untouched.'),
(7, 'Battle Mechs', '2023-09-14 14:17:26', 'url11', 234567, 'gamecover.png', TRUE, 167, 69, 'Battle Mechs places you in control of customizable war machines in an arena-style combat setting. Each mech can be equipped with a variety of weapons, defensive systems, and special abilities to suit your combat style. Engage in intense one-on-one battles or large-scale skirmishes where strategy and timing determine victory.'),
(5, 'Skybound', '2024-06-03 19:15:13', 'url12', 345678, 'gamecover.png', TRUE, 311, 102, 'Skybound is an aerial adventure game that lets you explore floating islands in a vast sky world. Take control of a customizable airship, recruit a diverse crew, and chart your own course through cloud-covered mysteries and airborne dangers. Each voyage reveals new wonders and perilous encounters.'),
(2, 'Cryptic Case', '2024-08-08 06:39:47', 'url13', 456789, 'gamecover.png', TRUE, 200, 77, 'Cryptic Case is a narrative-driven detective game where you must solve a cold case full of twisted clues and shadowy suspects. Analyze crime scenes, interrogate witnesses, and piece together evidence to unveil a mystery that has remained unsolved for years. Every clue brings you closer to the truth.'),
(1, 'Solar Farm Tycoon', '2023-12-21 15:03:22', 'url14', 567890, 'gamecover.png', TRUE, 149, 64, 'Solar Farm Tycoon challenges you to build a sustainable energy empire from the ground up. Start with a small plot of land and manage solar panel placement, maintenance, and upgrades while balancing budget constraints and environmental concerns. Expand across regions to become a clean energy mogul.'),
(3, 'Haunted Grove', '2024-02-02 10:22:14', 'url15', 678901, 'gamecover.png', TRUE, 255, 91, 'Haunted Grove is a psychological horror game set in an abandoned forest village shrouded in mystery. Navigate narrow paths and decaying houses as you search for answers about the people who vanished. With each step, supernatural forces test your sanity and reveal the darkness lurking behind the trees.'),
(2, 'Jetpack Joust', '2023-08-30 23:45:58', 'url16', 789012, 'gamecover.png', TRUE, 312, 109, 'Jetpack Joust is a fast-paced multiplayer game where players engage in aerial duels using jetpacks and medieval lances. Zoom through sky arenas, perform mid-air tricks, and knock your opponents out of the sky in thrilling battles where precision and speed reign supreme.'),
(1, 'Time Loop', '2024-05-15 07:14:38', 'url17', 890123, 'gamecover.png', TRUE, 408, 122, 'Time Loop is a narrative-driven puzzle game where you relive the same day over and over to prevent a tragedy. Discover new clues with each loop, change key decisions, and unlock different timelines. Only by understanding the full story and manipulating time can you alter the outcome.'),
(3, 'BioHack', '2023-06-19 21:55:30', 'url18', 901234, 'gamecover.png', TRUE, 231, 86, 'BioHack is a sci-fi action game where you play as a rogue scientist armed with bio-engineered implants. Navigate a dystopian city filled with cybernetic threats and corrupted corporations. Upgrade your body, hack enemy systems, and uncover a conspiracy that challenges the nature of humanity.'),
(5, 'Witch’s Path', '2023-10-12 18:03:56', 'url19', 1012345, 'gamecover.png', TRUE, 344, 97, 'Witch’s Path is a magical RPG where you take the role of an apprentice witch uncovering the secrets of an ancient forest. Learn spells, craft potions, and choose between light and dark paths as you navigate mystical politics, magical beasts, and lost prophecies that shape your destiny.'),
(2, 'Pixel Arena', '2024-01-04 09:57:41', 'url20', 1123456, 'gamecover.png', TRUE, 278, 89, 'Pixel Arena is a competitive 2D fighting game that mixes pixel art charm with fast-paced brawler mechanics. Choose from a roster of quirky fighters, each with unique abilities and flashy combos. Battle online or locally in chaotic arenas filled with environmental hazards and hidden power-ups.'),
(4, 'Neon Drift', '2024-03-18 13:24:37', 'url21', 1234567, 'gamecover.png', TRUE, 321, 110, 'Neon Drift is a futuristic racing game set in a cyberpunk city filled with neon lights, rain-slicked roads, and high-speed rivalries. Customize your hover car, drift through tight corners, and compete in underground leagues where only the boldest racers survive. Master the tracks and become a legend of the streets.'),
(3, 'Tower Siege', '2023-11-25 08:46:12', 'url22', 1345678, 'gamecover.png', TRUE, 276, 103, 'Tower Siege is a strategy tower defense game where you defend your kingdom against waves of invading monsters. Place and upgrade towers, unlock unique abilities, and develop tactical combinations to overcome increasingly difficult challenges. The fate of the realm rests in your strategic mind.'),
(1, 'Echoes of Time', '2023-07-09 17:29:55', 'url23', 1456789, 'gamecover.png', TRUE, 352, 116, 'Echoes of Time is a narrative exploration game where you relive the memories of a forgotten civilization. Travel through breathtaking ruins, solve environmental puzzles, and uncover a story told through time itself. With each discovery, you bring clarity to a world lost in silence.'),
(5, 'Monster Mashers', '2024-10-27 21:01:04', 'url24', 1567890, 'gamecover.png', TRUE, 399, 124, 'Monster Mashers is a chaotic party brawler where players control wacky monsters with outlandish powers. Fight in destructible arenas, use environmental traps to your advantage, and collect items to boost your power. It’s fast, unpredictable, and hilarious — perfect for couch co-op madness.'),
(2, 'Silent Depths', '2023-08-15 14:13:22', 'url25', 1678901, 'gamecover.png', TRUE, 205, 88, 'Silent Depths is a deep-sea exploration horror game that plunges you into the abyss of the ocean. Pilot a submersible through pitch-black waters, encounter strange lifeforms, and uncover the secrets of a sunken civilization. The further you descend, the more you question what’s real.'),
(4, 'Codebreaker', '2024-06-06 12:37:46', 'url26', 1789012, 'gamecover.png', TRUE, 289, 93, 'Codebreaker is a puzzle-solving thriller where you must hack into secure systems to stop a global cyber attack. Solve complex encryption challenges, outwit enemy firewalls, and uncover a digital conspiracy that spans continents. Every second counts as you race against time.'),
(3, 'Dungeon Harvest', '2023-09-27 16:52:08', 'url27', 1890123, 'gamecover.png', TRUE, 233, 90, 'Dungeon Harvest blends dungeon crawling with farming mechanics. Explore monster-infested caverns by day and grow magical crops by night. Balance combat, crafting, and resource management to upgrade your village and survive deeper dungeon layers. Every harvest powers your journey further.'),
(2, 'Quantum Fault', '2024-02-24 11:25:39', 'url28', 1901234, 'gamecover.png', TRUE, 377, 108, 'Quantum Fault is a mind-bending platformer where reality shifts with every step. Manipulate time, gravity, and dimensions to solve intricate puzzles and escape a collapsing space station. Precision and logic are key to surviving this cerebral sci-fi odyssey.'),
(4, 'Crimson Arena', '2023-12-11 20:34:05', 'url29', 2012345, 'gamecover.png', TRUE, 420, 132, 'Crimson Arena is a brutal gladiator combat game set in a post-apocalyptic future. Enter the blood-soaked pits, fight mutants and warlords, and rise through the ranks. Each victory earns gear, fame, and choices that shape your destiny in a world where only the strong survive.'),
(1, 'Gadgeteer', '2024-04-19 10:44:12', 'url30', 2123456, 'gamecover.png', TRUE, 298, 99, 'Gadgeteer is a creative sandbox game where you build complex contraptions using gears, pulleys, and physics-based machines. Solve increasingly tricky challenges by designing elegant — or ridiculous — solutions. Imagination is your only limit in this kinetic engineering playground.'),
(1, 'Neon Skies', '2024-05-15 12:34:56', 'url1', 23000, 'gamecover.png', TRUE, 85, 20, 'Neon Skies is a fast-paced sci-fi shooter that throws you into a world of neon-lit cities and cybernetic enemies. As an elite pilot, youll command a high-tech jet through intense battles in the sky, dodging laser fire and collecting rare energy cores. The game combines tight controls, vibrant graphics, and a synth-heavy soundtrack for an unforgettable arcade experience.'),
(2, 'Jungle Run', '2024-03-11 08:20:14', 'url2', 15700, 'gamecover.png', TRUE, 62, 14, 'Jungle Run is a thrilling endless runner set in the heart of a mysterious jungle. Players must leap over chasms, slide under obstacles, and fend off wild beasts while uncovering ancient secrets hidden deep within the forest. The dynamic weather system and shifting terrain make each run a new challenge full of adrenaline and discovery.'),
(1, 'Mech Arena', '2024-02-09 16:44:22', 'url3', 34200, 'gamecover.png', TRUE, 120, 40, 'Mech Arena is a tactical multiplayer shooter where you control customizable mechs in intense team battles. Each mech can be equipped with different weapons, armor, and special abilities to suit your playstyle. Strategy and coordination are key as you fight for dominance in arenas ranging from desolate deserts to high-tech cities.'),
(4, 'Castle Siege', '2024-01-19 13:37:05', 'url4', 28500, 'gamecover.png', TRUE, 97, 33, 'Castle Siege is a medieval strategy game that challenges players to defend their kingdom from invading armies. Build and upgrade your castle, train troops, and devise clever tactics to withstand endless waves of enemies. The game features a compelling campaign mode and multiplayer battles that test your leadership under pressure.'),
(2, 'Ocean Depths', '2024-04-25 10:03:30', 'url5', 19800, 'gamecover.png', TRUE, 70, 26, 'Ocean Depths takes you on an underwater journey where you explore vibrant coral reefs, shipwrecks, and mysterious trenches. Equipped with a submersible, you must navigate dangerous environments, catalog marine life, and uncover the lost secrets of an ancient underwater civilization.'),
(5, 'Zombie Town', '2024-03-01 11:15:44', 'url6', 45300, 'gamecover.png', TRUE, 180, 60, 'Zombie Town is a top-down survival shooter set in a city overrun by the undead. Armed with only a flashlight and whatever weapons you can scavenge, you must make your way through increasingly dangerous districts. Choose whether to help other survivors or prioritize your own survival in a world where every decision matters.'),
(3, 'Star Traders', '2024-06-12 09:41:22', 'url7', 37800, 'gamecover.png', TRUE, 210, 75, 'Star Traders is a space simulation game that puts you in control of your own starship. Trade goods, complete missions, and build your reputation across dozens of star systems. With deep economic systems and political intrigue, your path to power is only limited by your choices and your crew’s loyalty.'),
(2, 'Haunted Manor', '2023-12-18 07:25:53', 'url8', 16500, 'gamecover.png', TRUE, 58, 22, 'Haunted Manor is a first-person horror adventure set in a dilapidated Victorian mansion. Solve puzzles, uncover the mansion’s dark history, and survive encounters with terrifying apparitions. The game blends psychological horror and immersive storytelling to keep you on edge from start to finish.'),
(1, 'Sky Riders', '2024-05-28 14:50:33', 'url9', 32900, 'gamecover.png', TRUE, 134, 48, 'Sky Riders is an aerial racing game where you ride futuristic bikes over floating tracks above the clouds. Master high-speed turns, perform daring stunts, and outpace your opponents in a variety of breathtaking sky environments.'),
(4, 'Wasteland Kings', '2024-07-03 15:19:10', 'url10', 40000, 'gamecover.png', TRUE, 172, 65, 'Wasteland Kings is a post-apocalyptic RPG where you fight to become ruler of the ruined world. Choose your path through a sandbox wasteland filled with mutants, factions, and ancient technologies. Craft weapons, build alliances, and carve your legacy in a world where survival is never guaranteed.'),
(1, 'Moon Colony', '2024-01-03 19:23:12', 'url11', 14700, 'gamecover.png', TRUE, 90, 30, 'Moon Colony is a base-building simulator that lets you establish a self-sustaining colony on the Moon. Manage resources, research technologies, and deal with unpredictable cosmic events while ensuring your colonists stay alive in the harsh lunar environment.'),
(3, 'Dragon Arena', '2023-11-23 20:10:30', 'url12', 41200, 'gamecover.png', TRUE, 240, 90, 'Dragon Arena is a fantasy fighting game featuring powerful dragons and legendary warriors. Each character brings unique abilities and dynamic combos to the battlefield. Battle through epic arenas and climb the ranks to become the ultimate champion.'),
(5, 'Time Rift', '2023-10-15 18:05:44', 'url13', 29800, 'gamecover.png', TRUE, 156, 52, 'Time Rift is a puzzle-platformer that lets you manipulate time to overcome obstacles. Rewind, fast-forward, or pause the action to solve complex challenges and uncover the secrets behind a fractured timeline.'),
(2, 'Cyber Ninja', '2023-09-10 17:42:10', 'url14', 23400, 'gamecover.png', TRUE, 109, 41, 'Cyber Ninja is a side-scrolling action game that blends futuristic settings with traditional ninja combat. Slice through enemies using high-tech katanas and stealth gadgets as you unravel a conspiracy threatening the digital world.'),
(4, 'Deep Space Mining', '2024-05-06 08:30:29', 'url15', 26300, 'gamecover.png', TRUE, 78, 24, 'Deep Space Mining is a simulation game where you command a fleet of mining drones to extract resources from asteroid belts. Balance fuel, cargo, and repairs while navigating the perils of deep space economics and rogue competitors.'),
(1, 'Frost Realms', '2024-04-18 12:01:50', 'url16', 17400, 'gamecover.png', TRUE, 83, 27, 'Frost Realms is a strategy RPG set in a frozen kingdom on the brink of collapse. Lead a band of heroes through icy forests, ruined castles, and frozen wastelands as you fight to restore peace and uncover ancient secrets buried in the snow.'),
(3, 'Turbo Rally', '2024-06-20 16:55:42', 'url17', 30100, 'gamecover.png', TRUE, 143, 47, 'Turbo Rally is a high-octane racing game where players take on international tracks in a variety of tuned-up rally cars. Master dirt roads, mountain passes, and urban circuits while upgrading your vehicle and outpacing rivals.'),
(2, 'Dungeon Scrolls', '2024-03-14 10:13:08', 'url18', 19800, 'gamecover.png', TRUE, 110, 39, 'Dungeon Scrolls is a roguelike RPG where the only weapon you wield is language. Cast spells by forming words from magical scrolls, each with varying power based on complexity. Every dungeon presents new vocabulary challenges and tactical battles.'),
(5, 'Alien Harvest', '2024-07-27 11:32:14', 'url19', 27800, 'gamecover.png', TRUE, 190, 62, 'Alien Harvest is a farming sim with a twist—your crops are alien organisms. On a distant planet, cultivate strange flora, fend off space pests, and trade exotic produce with otherworldly markets.'),
(4, 'Inferno Trials', '2024-08-05 14:21:00', 'url20', 35300, 'gamecover.png', TRUE, 205, 70, 'Inferno Trials is a hack-and-slash dungeon crawler where you fight through the fiery depths of the underworld. Face off against demons, traps, and infernal guardians as you ascend toward redemption or damnation.'),
(2, 'Cyber Blitz', '2024-04-11 14:25:30', 'url21', 1223411, 'gamecover.png', TRUE, 328, 123, 'Cyber Blitz is a high-speed futuristic shooter set in a cyberpunk metropolis where corporations rule and rebels fight for freedom. Navigate through neon-lit skyscrapers, hack enemy systems, and take part in explosive missions that blur the line between reality and digital warfare. With a wide variety of weapons and upgradeable skills, you must outsmart security drones, mercenaries, and corrupt AIs to spark a revolution and reclaim the city.'),
(1, 'Jungle Echoes', '2023-12-01 06:32:55', 'url22', 978456, 'gamecover.png', TRUE, 185, 72, 'Jungle Echoes is a survival exploration game that transports you to the heart of an uncharted rainforest teeming with life and danger. As an ecologist stranded after a helicopter crash, you must survive using your knowledge of nature while uncovering ancient secrets buried deep beneath the canopy. Hunt for food, craft tools, and decipher mysterious symbols that may lead you to a hidden civilization. Every decision matters in this lush, untamed world.'),
(5, 'Neon Riders', '2023-10-20 15:11:22', 'url23', 234565, 'gamecover.png', TRUE, 401, 190, 'Neon Riders is a high-octane racing game set in a futuristic city drenched in glowing lights and pulsing synth music. Choose your ride, customize your engine and aesthetics, and compete in illegal races that twist through sky highways and subterranean tunnels. The competition is fierce, the tracks are perilous, and every second counts. Master your reflexes and learn every shortcut to rise to the top of the neon leaderboard.'),
(4, 'Frozen Realms', '2025-01-12 10:10:10', 'url24', 305876, 'gamecover.png', TRUE, 278, 97, 'Frozen Realms is a turn-based strategy game where players must build and defend their kingdoms amidst an eternal winter. Lead your people through frost-covered valleys, expand your territory, and harness ancient magic to withstand the cold and your enemies. Each choice—diplomacy, war, or trade—affects your path to dominance. Survive blizzards, conquer rival factions, and uncover the secrets buried beneath the ice.'),
(2, 'Steampunk Siege', '2024-06-09 19:41:00', 'url25', 412345, 'gamecover.png', TRUE, 194, 66, 'Steampunk Siege is a tactical tower defense game set in a gritty, steam-powered world of gears and gunpowder. Design your defenses, deploy clockwork soldiers, and unleash mechanical monstrosities to fend off waves of invaders. With deep upgrade systems and customizable defenses, no two battles are the same. Fight for your nation’s survival with a combination of strategy, engineering, and a little Victorian flair.'),
(3, 'Lost Signal', '2023-08-15 21:03:12', 'url26', 867912, 'gamecover.png', TRUE, 133, 54, 'Lost Signal is a psychological thriller adventure game where you investigate the disappearance of a space crew aboard an abandoned satellite. Alone with only logs, strange signals, and flickering lights, you must piece together what happened before the silence took over. With nonlinear storytelling and mind-bending puzzles, your decisions reveal different truths. What really happened in the void—and are you truly alone?'),
(5, 'Monarchs of Steel', '2024-02-27 11:17:44', 'url27', 562438, 'gamecover.png', TRUE, 365, 122, 'Monarchs of Steel is a grand strategy war game that places you in the iron throne of a powerful kingdom during an industrial revolution. Forge alliances, wage wars, and industrialize your empire with innovation and diplomacy. As tensions rise, balance your military expansion with the needs of your people and the demands of your court. Will you be a just ruler or a tyrant of steel?'),
(1, 'Crimson Tide', '2024-09-05 13:33:29', 'url28', 1012893, 'gamecover.png', TRUE, 421, 179, 'Crimson Tide is a naval combat game set in a dystopian future where oceanic factions battle for control of the last habitable zones on Earth. Command a fleet of advanced warships, deploy submarines, and launch devastating airstrikes. Manage resources and adapt to the volatile sea as storms, mutinies, and sea monsters test your leadership. Strategy and firepower will determine who rules the waves.'),
(2, 'Echoes of the Past', '2023-05-19 07:21:11', 'url29', 803412, 'gamecover.png', TRUE, 211, 88, 'Echoes of the Past is a narrative-driven puzzle game where history and memory intertwine. Step into the shoes of a historian exploring an ancient ruin where each artifact triggers vivid scenes from the lives of those who once lived there. Solve environmental puzzles, interpret inscriptions, and relive key events that change based on your choices. The past is never truly gone—it echoes in the present.'),
(4, 'Toxic City', '2025-04-03 12:58:26', 'url30', 903456, 'gamecover.png', TRUE, 289, 134, 'Toxic City is an open-world action RPG set in a post-apocalyptic urban jungle where pollution has mutated life and corrupted society. You play as a scavenger with a mysterious past, navigating gangs, toxic beasts, and a decaying infrastructure to uncover hidden truths and forge your destiny. Customize your gear, mutate your body for new abilities, and decide whether to save or dominate what remains of civilization.'),
(3, 'Chrono Rift', '2024-08-18 14:45:50', 'url31', 634921, 'gamecover.png', TRUE, 347, 109, 'Chrono Rift is a sci-fi time-travel adventure where timelines fracture and every decision alters reality. Armed with a prototype time suit, you must repair paradoxes, prevent temporal invasions, and fight entities from alternate futures. Encounter versions of yourself, rewrite history, and solve mind-bending puzzles that span millennia. The fate of time itself lies in your hands.'),
(5, 'Phantom Brigade', '2023-06-04 20:01:12', 'url32', 356721, 'gamecover.png', TRUE, 154, 65, 'Phantom Brigade is a tactical mech combat game where you lead a resistance force against a technologically superior regime. Plan every move with precision, use terrain to your advantage, and deploy powerful mechs with customizable weapons and armor. Between battles, manage your base, recruit pilots, and strategize for the next strike. In this war, stealth and brains beat brute force.'),
(1, 'Sandstorm Legacy', '2024-05-08 09:39:17', 'url33', 487192, 'gamecover.png', TRUE, 233, 84, 'Sandstorm Legacy is an epic action RPG set in a vast desert kingdom besieged by supernatural forces. Traverse sun-scorched dunes, forgotten temples, and bustling oasis cities as a warrior seeking redemption. With a dynamic combat system and branching narrative, your choices shape the fate of the sands. Confront powerful warlords, harness ancient magic, and unearth the legacy hidden beneath the storm.'),
(2, 'Quantum Veil', '2023-11-26 16:19:53', 'url34', 593814, 'gamecover.png', TRUE, 301, 117, 'Quantum Veil is a first-person exploration game where quantum uncertainty shapes the world around you. Discover parallel outcomes of your actions, shift perspectives, and uncover a mysterious experiment gone wrong. As reality collapses, navigate surreal environments that twist with your thoughts. Only by understanding the nature of observation can you escape the collapsing veil.'),
(4, 'Iron Vengeance', '2024-03-14 13:15:01', 'url35', 709823, 'gamecover.png', TRUE, 188, 79, 'Iron Vengeance is a hack-and-slash brawler with brutal combat and a rich storyline of betrayal and revenge. Play as a betrayed knight left for dead, wielding enchanted weapons to exact vengeance on the nobles who wronged you. Slice through armies, uncover forbidden magic, and reclaim your honor in a world where loyalty is as sharp as a blade.'),
(3, 'Viral Horizon', '2024-10-02 17:42:39', 'url36', 846192, 'gamecover.png', TRUE, 379, 143, 'Viral Horizon is a simulation strategy game where you must contain a global outbreak and develop a cure. Take charge of research labs, dispatch emergency teams, and balance political pressure against public safety. Every choice impacts how the world reacts and whether humanity survives. Can you stop the spread—or will you become part of the pandemic?'),
(5, 'Runes of Avalon', '2023-09-13 07:56:29', 'url37', 298471, 'gamecover.png', TRUE, 210, 91, 'Runes of Avalon is a magical puzzle-adventure game in a mythical world where ancient runes hold immense power. Solve enchanting challenges, harness spellcraft, and travel through ethereal realms guided by elemental spirits. Each puzzle reveals deeper lore and draws you closer to restoring balance to a world torn by arcane conflict.'),
(2, 'Sky Pirates', '2025-03-09 12:02:18', 'url38', 911473, 'gamecover.png', TRUE, 466, 195, 'Sky Pirates is a fast-paced aerial combat game where you command a crew of rogues aboard a customizable airship. Soar through the clouds, plunder enemy vessels, and navigate treacherous weather systems in a lawless sky. Form alliances, upgrade your fleet, and become the most feared pirate captain of the open air.'),
(1, 'Digital Labyrinth', '2023-07-07 08:08:08', 'url39', 402561, 'gamecover.png', TRUE, 175, 68, 'Digital Labyrinth is a sci-fi maze-runner set inside a sentient virtual environment that adapts to your every move. Solve logic-based puzzles, avoid digital traps, and unravel the mystery of who uploaded your consciousness and why. Each sector of the labyrinth reveals new mechanics, dangers, and layers of your past. Will you escape—or become part of the code?'),
(3, 'Bloodbound', '2024-12-21 10:10:10', 'url40', 587312, 'gamecover.png', TRUE, 398, 162, 'Bloodbound is a gothic action RPG where you play a cursed warrior bound to an ancient bloodline. Travel across a world of shadows, battle horrific beasts, and uncover the origin of your curse. Each choice deepens your bond with dark powers, unlocking new abilities at the cost of your humanity. Will you resist the darkness—or embrace it?'),
(4, 'Steel Horizon', '2024-02-05 11:23:45', 'url41', 712345, 'gamecover.png', TRUE, 324, 121, 'Steel Horizon is a post-apocalyptic tactical strategy game where factions vie for control over scarce resources in a devastated wasteland. Build your base, recruit warriors, and engage in strategic battles that require careful planning and quick decision-making. The world is harsh, and survival depends on alliances, technology, and your ability to adapt to ever-changing threats.'),
(5, 'Crystal Caverns', '2023-11-29 09:15:33', 'url42', 489672, 'gamecover.png', TRUE, 198, 77, 'Crystal Caverns invites you to explore a dazzling underground world filled with sparkling gems, hidden traps, and ancient secrets. Solve intricate puzzles and avoid deadly hazards while uncovering the history of the caverns and the mysterious forces that guard them. The deeper you go, the more challenging the adventure becomes, testing your wit and courage.'),
(2, 'Neon Knights', '2024-08-13 20:44:10', 'url43', 854321, 'gamecover.png', TRUE, 432, 182, 'Neon Knights combines fast-paced combat and cybernetic enhancements in a neon-lit metropolis where lawlessness reigns. Choose your augmentations wisely and master combat combos to dominate your foes. The city is a playground for mercenaries, hackers, and rebels, and your choices will determine whether you rise as a hero or fall into the shadows.'),
(3, 'Phantom Echo', '2023-10-01 16:00:00', 'url44', 273489, 'gamecover.png', TRUE, 159, 69, 'Phantom Echo is a stealth action game set in a dystopian future where sound is your greatest enemy and ally. Use shadows and silence to your advantage as you infiltrate heavily guarded complexes, gather intelligence, and avoid detection. The innovative sound-based gameplay challenges your senses and strategic thinking, making every mission a tense experience.'),
(1, 'Solar Frontier', '2024-07-22 12:12:12', 'url45', 905432, 'gamecover.png', TRUE, 380, 150, 'Solar Frontier is a space exploration and colonization game where you lead humanity’s efforts to establish a new home among the stars. Manage your crew, resources, and technology as you survey planets, build colonies, and face cosmic dangers. The vastness of space offers endless opportunities, but also grave risks that test your leadership and vision.'),
(5, 'Wasteland Warriors', '2023-12-18 07:58:42', 'url46', 667891, 'gamecover.png', TRUE, 245, 90, 'Wasteland Warriors is a gritty RPG set in a devastated world where survivors fight for dominance. Customize your characters, scavenge for gear, and navigate dangerous territories filled with hostile factions and mutated creatures. The choices you make affect alliances, story outcomes, and your path to becoming the ultimate warrior of the wasteland.'),
(2, 'Arcane Odyssey', '2024-05-30 14:30:30', 'url47', 493285, 'gamecover.png', TRUE, 312, 108, 'Arcane Odyssey takes you on a magical journey through enchanted lands where ancient spells and mythical creatures abound. As a young sorcerer, you’ll learn powerful incantations, uncover hidden lore, and face formidable foes. With a rich narrative and expansive world, your mastery of magic will determine the fate of the realm.'),
(4, 'Titanfall Legacy', '2023-09-15 18:22:47', 'url48', 378291, 'gamecover.png', TRUE, 176, 66, 'Titanfall Legacy is a mech-based shooter combining fast-paced combat and tactical depth. Command towering titans in brutal battles across diverse environments, upgrading your machines and coordinating with your squad. The legacy of the pilots and their machines unfolds through an intense campaign filled with twists and challenges.'),
(3, 'Darkwater Depths', '2024-01-09 10:05:12', 'url49', 511239, 'gamecover.png', TRUE, 294, 113, 'Darkwater Depths is an atmospheric underwater exploration game where you dive into the mysterious oceanic abyss. Encounter strange creatures, ancient ruins, and uncover the secrets of a lost civilization. Manage your oxygen and equipment carefully, as the depths hold dangers as well as wonders in equal measure.'),
(1, 'Ironclad Tactics', '2024-03-19 09:48:50', 'url50', 732184, 'gamecover.png', TRUE, 210, 85, 'Ironclad Tactics is a steampunk-themed card-based strategy game where you command units on a battlefield shaped by industrial warfare. Deploy mechanized soldiers, build fortifications, and outthink your opponents in intense tactical duels. The blend of cards and tactics offers endless strategic possibilities and replayability.'),
(5, 'Celestial Siege', '2023-08-27 15:34:28', 'url51', 612487, 'gamecover.png', TRUE, 299, 120, 'Celestial Siege is a fantasy RTS where you lead armies of mythical creatures to conquer celestial realms. Manage resources, build magical fortresses, and command your forces in epic battles against rival factions. The balance between magic and might is crucial as you strive to dominate the heavens.'),
(2, 'Shadow Circuit', '2024-06-04 17:59:16', 'url52', 489173, 'gamecover.png', TRUE, 185, 72, 'Shadow Circuit is a cyberpunk hacking game where you infiltrate corporate networks using a variety of digital tools and cunning strategies. Solve complex puzzles, evade security measures, and uncover conspiracies in a neon-lit dystopia. Every successful hack brings you closer to exposing the truth or being caught in the web.'),
(3, 'Frostbound', '2024-10-14 13:42:10', 'url53', 540987, 'gamecover.png', TRUE, 274, 101, 'Frostbound is a survival adventure game set in a frozen wilderness where you must battle the elements and hostile creatures to survive. Gather resources, craft tools, and build shelter as you explore an unforgiving landscape. The harsh cold and unpredictable weather add layers of challenge to your quest for survival.'),
(1, 'Crystal Kingdom', '2023-11-21 08:30:00', 'url54', 685432, 'gamecover.png', TRUE, 224, 89, 'Crystal Kingdom is a fantasy RPG where players explore a vibrant world filled with magical crystals, powerful artifacts, and ancient enemies. Develop your character’s skills, form alliances, and embark on quests to save the kingdom from a looming darkness. The rich lore and immersive gameplay provide hours of adventure.'),
(5, 'Neon Drift', '2024-07-10 16:47:22', 'url55', 812345, 'gamecover.png', TRUE, 410, 172, 'Neon Drift is a futuristic racing game featuring sleek vehicles and high-speed tracks illuminated by neon lights. Master sharp turns, boost your speed, and use power-ups to outpace opponents in a variety of challenging race modes. The adrenaline-pumping soundtrack and stunning visuals create a thrilling experience.'),
(2, 'Echo Mirage', '2023-12-14 11:20:55', 'url56', 493278, 'gamecover.png', TRUE, 189, 75, 'Echo Mirage is a mind-bending puzzle game set in surreal dreamscapes where reality constantly shifts. Manipulate objects, change perspectives, and solve puzzles that challenge your perception. Each level unfolds a new layer of a mysterious story, drawing you deeper into the mirage.'),
(4, 'Iron Wolves', '2024-04-27 19:10:34', 'url57', 533219, 'gamecover.png', TRUE, 305, 129, 'Iron Wolves is a tactical RPG featuring a squad of elite warriors fighting against overwhelming odds. Customize your team, develop strategies, and lead your units through challenging missions. The combination of tactical depth and compelling narrative makes every battle a test of skill and courage.'),
(3, 'Quantum Drift', '2024-08-30 14:55:48', 'url58', 487654, 'gamecover.png', TRUE, 215, 90, 'Quantum Drift is a sci-fi racing game where players navigate anti-gravity tracks that warp reality itself. Utilize quantum mechanics-inspired power-ups and physics-defying maneuvers to gain the upper hand. The dynamic courses and futuristic design offer a unique racing experience.'),
(1, 'Savage Lands', '2023-10-25 07:07:07', 'url59', 567891, 'gamecover.png', TRUE, 352, 140, 'Savage Lands is an open-world survival game where players must endure a brutal wilderness filled with dangerous wildlife, hostile tribes, and unpredictable weather. Build shelter, craft weapons, and hunt for food as you forge your path in this untamed land. Cooperation and conflict with other survivors add depth to your journey.'),
(5, 'Lunar Outpost', '2024-01-15 18:20:20', 'url60', 632498, 'gamecover.png', TRUE, 198, 77, 'Lunar Outpost places you in charge of a remote moon base struggling to maintain life-support systems and defend against alien threats. Manage resources, upgrade technology, and ensure the survival of your crew in a hostile extraterrestrial environment. Strategic planning and quick decision-making are key to thriving beyond Earth.'),
(2, 'Vortex Rebellion', '2024-03-03 15:45:33', 'url71', 523489, 'gamecover.png', TRUE, 286, 108, 'Vortex Rebellion is a fast-paced action game set in a futuristic city torn apart by corporate warfare. As a rebel leader, you must navigate the urban chaos, fight enemy forces, and rally allies to overthrow the oppressive regime. The game combines dynamic combat with deep storytelling and a richly detailed environment.'),
(3, 'Celestial Path', '2023-11-11 13:27:41', 'url72', 498273, 'gamecover.png', TRUE, 191, 77, 'Celestial Path is an epic RPG adventure where players journey through mystical realms guided by the stars. Discover ancient prophecies, powerful artifacts, and mythical creatures as you forge your destiny. The game features an immersive story, complex character development, and strategic combat that challenges your tactical skills.'),
(1, 'Inferno Blaze', '2024-06-29 10:02:50', 'url73', 612389, 'gamecover.png', TRUE, 345, 132, 'Inferno Blaze is a thrilling hack-and-slash game set in a fiery underworld. Battle hordes of demons, unlock devastating combos, and harness elemental powers to survive waves of enemies. The intense gameplay and vivid visuals create an unforgettable experience for action game enthusiasts.'),
(5, 'Echoes of Eternity', '2023-12-05 08:40:22', 'url74', 473920, 'gamecover.png', TRUE, 204, 85, 'Echoes of Eternity is a narrative-driven adventure that explores themes of time, memory, and loss. Travel through shifting timelines, solve intricate puzzles, and uncover the secrets of an ancient civilization. The evocative storytelling and atmospheric design make it a deeply emotional journey.'),
(4, 'Starbound Siege', '2024-04-12 17:15:08', 'url75', 598732, 'gamecover.png', TRUE, 322, 121, 'Starbound Siege is a space RTS where players command fleets to defend their star systems against relentless invasions. Manage resources, research advanced technologies, and coordinate attacks to outsmart enemy forces. The game’s strategic depth and engaging campaigns offer countless hours of challenge and excitement.'),
(3, 'Mystic Run', '2024-08-21 09:50:37', 'url76', 541239, 'gamecover.png', TRUE, 210, 89, 'Mystic Run is a fast-paced endless runner set in a magical forest filled with enchanted obstacles and mystical creatures. Use spells and power-ups to navigate the ever-changing terrain while collecting magical artifacts. The vibrant art style and catchy soundtrack enhance the thrilling experience.'),
(1, 'Titan Siege', '2023-09-18 14:33:25', 'url77', 567812, 'gamecover.png', TRUE, 318, 127, 'Titan Siege is a tactical warfare game where players command powerful titans in battles to control key territories. Build your army, develop strategies, and engage in epic confrontations across varied landscapes. The game blends deep tactical gameplay with spectacular combat animations.'),
(5, 'Neon Pulse', '2024-07-07 12:44:19', 'url78', 693210, 'gamecover.png', TRUE, 225, 91, 'Neon Pulse is a rhythm-based action game set in a vibrant cyberpunk world. Synchronize your movements and attacks to the pulsing electronic soundtrack while dodging hazards and defeating enemies. The unique fusion of music and gameplay creates an exhilarating challenge.'),
(4, 'Shadow Frontier', '2023-10-22 11:18:55', 'url79', 479832, 'gamecover.png', TRUE, 287, 110, 'Shadow Frontier is an intense stealth-action game where players infiltrate enemy bases under the cover of darkness. Use gadgets, disguises, and tactical thinking to complete missions without raising alarms. The dynamic AI and immersive environments heighten the tension and challenge.'),
(2, 'Crystal Saga', '2024-02-26 13:05:48', 'url80', 512378, 'gamecover.png', TRUE, 199, 80, 'Crystal Saga is a fantasy MMORPG that immerses players in a vibrant world filled with magic, quests, and epic battles. Form guilds, craft powerful gear, and explore vast landscapes teeming with monsters and secrets. The game’s rich social features and expansive content make it a favorite among online adventurers.'),
(3, 'Ironclad Assault', '2024-05-03 16:27:50', 'url81', 489105, 'gamecover.png', TRUE, 304, 120, 'Ironclad Assault is a steampunk-themed tactical shooter featuring customizable mechanized units. Engage in strategic firefights, upgrade your machines, and outmaneuver your opponents in diverse battlefields. The blend of tactical depth and fast-paced action delivers an exciting combat experience.'),
(1, 'Frostbite Fury', '2023-12-20 09:45:12', 'url82', 576489, 'gamecover.png', TRUE, 218, 85, 'Frostbite Fury is a survival game set in a harsh arctic environment. Players must gather resources, build shelters, and fend off wildlife while managing their body temperature and hunger. The unforgiving climate and realistic survival mechanics create a challenging and immersive experience.'),
(5, 'Lunar Legends', '2024-01-10 14:12:43', 'url83', 634210, 'gamecover.png', TRUE, 332, 130, 'Lunar Legends is a fantasy RPG set on a mysterious moon with ancient ruins and powerful magic. Explore diverse landscapes, complete quests, and battle legendary creatures as you uncover the moon’s secrets. The deep storyline and character customization provide a rich gaming experience.'),
(4, 'Quantum Quest', '2023-11-30 10:33:27', 'url84', 502371, 'gamecover.png', TRUE, 189, 74, 'Quantum Quest is a sci-fi puzzle adventure where players manipulate quantum mechanics to solve complex challenges. Navigate through futuristic environments using teleportation, time manipulation, and other advanced abilities. The game’s innovative mechanics and engaging puzzles offer a cerebral challenge.'),
(2, 'Savage Storm', '2024-06-15 18:50:12', 'url85', 517239, 'gamecover.png', TRUE, 276, 102, 'Savage Storm is an action-packed survival game set in a post-apocalyptic world ravaged by natural disasters and hostile factions. Scavenge for supplies, craft weapons, and defend your shelter against relentless threats. The game combines intense combat with strategic resource management for an immersive experience.'),
(3, 'Echo Nexus', '2024-08-05 13:22:44', 'url86', 481209, 'gamecover.png', TRUE, 203, 88, 'Echo Nexus is a cyberpunk RPG where players explore a sprawling metropolis filled with intrigue, danger, and advanced technology. Customize your character, hack systems, and navigate complex social networks to uncover hidden conspiracies. The rich narrative and dynamic world react to your choices.'),
(1, 'Titanfall Clash', '2023-09-29 16:14:35', 'url87', 563219, 'gamecover.png', TRUE, 345, 135, 'Titanfall Clash is an intense multiplayer shooter featuring customizable mech units battling for control of futuristic arenas. Team up with players worldwide, develop strategies, and unleash powerful abilities to dominate the battlefield. The fast-paced gameplay and competitive modes keep players engaged.'),
(5, 'Neon Veil', '2024-03-14 09:27:18', 'url88', 672389, 'gamecover.png', TRUE, 221, 90, 'Neon Veil is a stealth-action game set in a glowing cyberpunk city where you must infiltrate corporate headquarters to steal valuable data. Use high-tech gadgets, hacking skills, and stealth tactics to avoid detection and complete your objectives. The immersive atmosphere and intricate level design provide a thrilling challenge.'),
(4, 'Crystal Crusade', '2023-12-08 15:48:55', 'url89', 518239, 'gamecover.png', TRUE, 292, 112, 'Crystal Crusade is a fantasy adventure game where players embark on a quest to retrieve powerful crystals that can save the kingdom. Battle mythical beasts, solve puzzles, and explore vast landscapes filled with danger and mystery. The game’s captivating story and engaging gameplay offer hours of entertainment.'),
(2, 'Frostforge', '2024-04-21 11:20:11', 'url90', 549382, 'gamecover.png', TRUE, 214, 88, 'Frostforge is an action RPG set in a frozen world where players craft legendary weapons and armor to battle fierce ice creatures. Explore treacherous terrain, complete challenging quests, and master elemental magic to become a hero of the north. The game features deep customization and strategic combat.'),
(3, 'Shadow Run', '2024-07-28 14:08:50', 'url91', 476389, 'gamecover.png', TRUE, 278, 104, 'Shadow Run is a fast-paced stealth platformer where players navigate urban rooftops to complete high-stakes missions. Use agility, gadgets, and cunning to evade enemies and overcome obstacles. The game’s fluid controls and stylish visuals make for an exhilarating experience.'),
(1, 'Iron Horizon', '2023-10-10 17:55:44', 'url92', 593284, 'gamecover.png', FALSE, 231, 95, 'Iron Horizon is a mech combat game set in a war-torn future where players pilot advanced robots in large-scale battles. Customize your mech, coordinate with allies, and dominate the battlefield using a combination of firepower and strategy. The game’s detailed environments and intense action keep players engaged.'),
(5, 'Neon Nexus', '2024-05-05 12:30:30', 'url93', 654321, 'gamecover.png', TRUE, 305, 124, 'Neon Nexus is a cyberpunk open-world RPG where players explore a sprawling city filled with neon lights, dangerous gangs, and high-tech mysteries. Customize your character’s cybernetic enhancements, engage in dynamic combat, and unravel a gripping narrative in this futuristic playground.'),
(4, 'Crystal Shadows', '2023-11-23 10:18:22', 'url94', 522398, 'gamecover.png', FALSE, 197, 81, 'Crystal Shadows is a dark fantasy RPG set in a world where magic and shadow intertwine. Players must master arcane powers and uncover hidden secrets to combat an encroaching darkness threatening the realm. The game offers rich storytelling and strategic combat encounters.'),
(2, 'Frostfall', '2024-02-18 14:45:09', 'url95', 508329, 'gamecover.png', TRUE, 269, 103, 'Frostfall is a survival adventure set in a snowy wilderness where players must contend with harsh weather, wild animals, and scarce resources. Craft tools, build shelter, and explore the environment to survive. The immersive mechanics and atmospheric design create a compelling challenge.'),
(3, 'Shadow Veil', '2024-06-07 16:59:43', 'url96', 475621, 'gamecover.png', FALSE, 212, 87, 'Shadow Veil is a stealth RPG where players assume the role of a mysterious assassin navigating political intrigue and dark secrets. Utilize stealth, combat, and persuasion to achieve your goals in a richly detailed world. Choices matter, shaping the story and your character’s fate.'),
(1, 'Ironclad Rebellion', '2023-09-07 13:55:18', 'url97', 585432, 'gamecover.png', TRUE, 320, 130, 'Ironclad Rebellion is a strategy game set in an industrial revolution-era world where players lead a rebellion against oppressive regimes. Build your forces, manage resources, and engage in tactical battles to overthrow your enemies. The game combines historical themes with deep gameplay mechanics.'),
(5, 'Neon Blaze', '2024-01-22 18:07:40', 'url98', 671238, 'gamecover.png', FALSE, 223, 92, 'Neon Blaze is an action-packed platformer set in a futuristic city bathed in neon lights. Dash through levels filled with enemies, traps, and hidden secrets, using quick reflexes and powerful abilities. The vibrant visuals and energetic soundtrack amplify the adrenaline rush.'),
(4, 'Crystal Horizon', '2023-12-28 09:20:30', 'url99', 525789, 'gamecover.png', TRUE, 290, 115, 'Crystal Horizon is a fantasy exploration game where players traverse diverse landscapes to collect magical crystals that hold ancient powers. Solve puzzles, battle creatures, and uncover the history behind the crystals in an expansive world. The game offers immersive storytelling and captivating gameplay.');


-- CONTENT_BLOCKS
INSERT INTO content_blocks (game_id, image_name, content) VALUES
(1, "galacticwar1.jpg", "An intense battle scene showing spaceships exchanging laser fire across a vibrant galaxy filled with colorful nebulae and distant stars."),
(1, "galacticwar2.jpg", "A mysterious island landscape covered in dense jungle foliage with ancient ruins partially visible beneath creeping vines and mist. A mysterious island landscape covered in dense jungle foliage with ancient ruins partially visible beneath creeping vines and mist"),
(1, "galacticwar3.jpg", "A lone shadowy figure crouching on a rooftop, watching over a dark cityscape lit by neon signs and flickering street lamps."),
(2, "gameimg.jpg", "A fierce dragon soaring over snow-capped mountains with fiery breath illuminating the sky during a dramatic sunset."),
(2, "gameimg.jpg", "A rogue adventurer cautiously entering a dimly lit dungeon corridor, with ancient stone walls and flickering torches casting shadows.");


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

INSERT INTO posts_images (post_id, image_name, content, order_index) VALUES 
(10, 'postimg.jpg', 'Panoramic view of the valley at dawn, with mist among the trees.', 1),
(10, 'postimg.jpg', 'Architectural detail of the central tower of the ruined castle.', 2),
(10, 'postimg.jpg', 'Close-up of a wildflower growing between ancient stones.', 3);


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



