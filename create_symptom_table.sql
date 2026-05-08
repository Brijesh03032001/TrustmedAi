-- Create simplified symptom table for RAG model
USE medical_data;

CREATE TABLE symptom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL,
    source_url TEXT NOT NULL,
    overview TEXT,
    symptoms TEXT,
    causes TEXT,
    risk_factors TEXT,
    complications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_disease_url (disease_name, source_url(255))
);

-- Show the created table structure
DESCRIBE symptom;