-- Database: minomp
CREATE DATABASE IF NOT EXISTS minomp;
USE minomp;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(50), -- 'P' for Parent, 'C' for Child
    referral_code VARCHAR(100),
    country_code_id INT,
    mobileno VARCHAR(20),
    is_deleted TINYINT(1) DEFAULT 0,
    token TEXT,
    language_id INT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: proposals
CREATE TABLE IF NOT EXISTS proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    proposal_name VARCHAR(255),
    reward_id INT,
    minomp_time INT, -- in seconds
    break_time INT, -- in seconds
    status VARCHAR(50) DEFAULT 'pending', -- pending, ongoing, completed
    is_deleted TINYINT(1) DEFAULT 0,
    is_received_reward TINYINT(1) DEFAULT 0,
    start_datetime DATETIME,
    end_datetime DATETIME,
    reward_type VARCHAR(50), -- 'admin' or 'custom'
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: logs
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_path VARCHAR(255),
    request_method VARCHAR(10),
    request_data TEXT,
    log_message TEXT,
    log_messagetype VARCHAR(50),
    response_data LONGTEXT,
    request_datetime DATETIME,
    response_datetime DATETIME,
    user_id INT
);

-- Table: rewards
CREATE TABLE IF NOT EXISTS rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reward_name VARCHAR(255),
    reward_icon VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1
);

-- Table: custome_rewards
CREATE TABLE IF NOT EXISTS custome_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reward_name VARCHAR(255),
    reward_icon VARCHAR(255),
    userid INT,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: points
CREATE TABLE IF NOT EXISTS points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    points_earned INT DEFAULT 0,
    referral_code_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: country_codes
CREATE TABLE IF NOT EXISTS country_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100),
    country_code VARCHAR(10),
    is_active TINYINT(1) DEFAULT 1
);

-- Table: sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(255),
    device_id VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    login_datetime DATETIME,
    logout_datetime DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: connections (Parent-Child mapping)
CREATE TABLE IF NOT EXISTS connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT,
    kid_id INT,
    status VARCHAR(50),
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kid_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: referrals
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referred_by_id INT,
    referred_to_id INT,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    referral_code VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1
);

-- Table: time_tracking
CREATE TABLE IF NOT EXISTS time_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT,
    start_time DATETIME,
    end_time DATETIME,
    break_time_used INT DEFAULT 0,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

-- Table: otp
CREATE TABLE IF NOT EXISTS otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10),
    userid INT,
    expiredatetime DATETIME,
    create_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_used TINYINT(1) DEFAULT 0,
    count INT DEFAULT 0,
    is_expired TINYINT(1) DEFAULT 0
);

-- Table: proposal_mapping
CREATE TABLE IF NOT EXISTS proposal_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kid_id INT,
    parent_id INT,
    proposal_id INT,
    status VARCHAR(50),
    request_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_datetime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kid_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

-- Table: notificationtype
CREATE TABLE IF NOT EXISTS notificationtype (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100),
    CreatedBy INT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy INT,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Status TINYINT(1) DEFAULT 1
);

-- Table: notification
CREATE TABLE IF NOT EXISTS notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_typeid INT,
    senderid INT,
    receiverid INT,
    notification_data TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expired_date DATETIME,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_read TINYINT(1) DEFAULT 0,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (notification_typeid) REFERENCES notificationtype(ID)
);

-- Table: languages
CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1
);

-- Table: devices
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_model VARCHAR(100),
    user_id INT,
    device_type VARCHAR(50),
    AppVersion VARCHAR(50),
    OsVersion VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: todos
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: user_photos
CREATE TABLE IF NOT EXISTS user_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default Country Codes (Example)
INSERT INTO country_codes (country_name, country_code, is_active) VALUES 
('India', '+91', 1),
('USA', '+1', 1)
ON DUPLICATE KEY UPDATE country_code=country_code;

-- Insert default Languages (Example)
INSERT INTO languages (language, is_active) VALUES 
('English', 1),
('Spanish', 1)
ON DUPLICATE KEY UPDATE language=language;
