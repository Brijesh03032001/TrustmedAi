-- Medical Data Database Schema
-- This script creates tables to store symptoms and diagnosis data from JSON files

USE medical_data;

-- Main table for diseases
CREATE TABLE IF NOT EXISTS diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    summary TEXT,
    content_type ENUM('symptoms', 'diagnosis') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_disease_type (disease_name, content_type)
);

-- Table for symptoms
CREATE TABLE IF NOT EXISTS symptoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    symptom_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Table for causes
CREATE TABLE IF NOT EXISTS causes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    cause_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Table for prevention methods
CREATE TABLE IF NOT EXISTS prevention (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    prevention_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Table for diagnostic tests (for diagnosis data)
CREATE TABLE IF NOT EXISTS diagnostic_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    test_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Table for treatments (for diagnosis data)
CREATE TABLE IF NOT EXISTS treatments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    treatment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Table for medications (for diagnosis data)
CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    medication_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Table for procedures (for diagnosis data)
CREATE TABLE IF NOT EXISTS procedures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT,
    procedure_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
);

-- Show created tables
SHOW TABLES;