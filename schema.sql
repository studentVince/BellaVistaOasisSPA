CREATE DATABASE IF NOT EXISTS bellavista CHARACTER SET utf8mb4;
USE bellavista;

-- Limited account for the website (change the password, then match it in lib.php)
CREATE USER IF NOT EXISTS 'bellavista_app'@'localhost' IDENTIFIED BY 'change-this-password';
GRANT SELECT, INSERT, UPDATE ON bellavista.* TO 'bellavista_app'@'localhost';

CREATE TABLE users (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100),
    email    VARCHAR(120) UNIQUE,
    pass     VARCHAR(255),
    phone    VARCHAR(30),
    medical  TEXT,
    points   INT DEFAULT 0,
    role     ENUM('customer', 'admin') DEFAULT 'customer',
    created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    code      VARCHAR(8),
    category  ENUM('single', 'couple', 'family')
);

CREATE TABLE therapists (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(80)
);

CREATE TABLE bookings (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT,
    room_id       INT,
    category      ENUM('single', 'couple', 'family'),
    start_dt      DATETIME,
    end_dt        DATETIME,
    guests        INT,
    total         INT,
    health        TEXT,
    therapist_id  INT NULL,
    status        ENUM('booked', 'done', 'cancelled') DEFAULT 'booked',
    INDEX (room_id, start_dt),
    INDEX (start_dt),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE claims (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id  INT,
    label    VARCHAR(120),
    created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, label)
);

INSERT INTO rooms (code, category) VALUES
    ('SR-1', 'single'), ('SR-2', 'single'), ('SR-3', 'single'),
    ('CS-1', 'couple'), ('CS-2', 'couple'),
    ('FL-1', 'family'), ('FL-2', 'family');

INSERT INTO therapists (name) VALUES ('Ana'), ('Marco'), ('Liza'), ('Joy');

-- Demo history (last 90 days) so the forecast and best seller have data.
-- Delete user 1 and its bookings before going live.
INSERT INTO users (name, email, pass, medical)
VALUES ('Demo history', 'history@demo.local', 'x', 'none');

INSERT INTO bookings (user_id, room_id, category, start_dt, end_dt, guests, total, health, status)
WITH RECURSIVE n (i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 500
)
SELECT
    1,
    CASE c WHEN 'single' THEN 1 WHEN 'couple' THEN 4 ELSE 6 END,
    c,
    TIMESTAMP(d, t),
    TIMESTAMP(d, t) + INTERVAL IF(c = 'family', 90, 60) MINUTE,
    g,
    IF(c = 'family', 4000 + 750 * GREATEST(0, g - 4), IF(c = 'couple', 1800, 800)),
    'none',
    'done'
FROM (
    SELECT
        ELT(1 + FLOOR(RAND() * 6), 'single', 'single', 'single', 'couple', 'couple', 'family') AS c,
        CURDATE() - INTERVAL (1 + FLOOR(RAND() * 90)) DAY AS d,
        IF(RAND() < .5, '17:30', '19:00') AS t,
        1 + FLOOR(RAND() * 6) AS g
    FROM n
    LIMIT 1000
) x
WHERE DAYOFWEEK(d) IN (1, 6, 7) OR RAND() < .6;
