-- RAG-Optimized Views for Medical Database
-- These views are designed for efficient retrieval in RAG systems

USE medical_data;

-- Comprehensive disease view with all related information
CREATE OR REPLACE VIEW rag_disease_complete AS
SELECT 
    d.id as disease_id,
    d.disease_name,
    d.content_type,
    d.source_url,
    d.summary,
    -- Symptoms (concatenated for text search)
    GROUP_CONCAT(DISTINCT s.symptom_text SEPARATOR '; ') as all_symptoms,
    -- Causes (concatenated for text search)
    GROUP_CONCAT(DISTINCT c.cause_text SEPARATOR '; ') as all_causes,
    -- Prevention (concatenated for text search)
    GROUP_CONCAT(DISTINCT p.prevention_text SEPARATOR '; ') as all_prevention,
    -- Diagnostic tests (concatenated)
    GROUP_CONCAT(DISTINCT dt.test_name SEPARATOR '; ') as all_diagnostic_tests,
    -- Treatments (concatenated)
    GROUP_CONCAT(DISTINCT t.treatment_text SEPARATOR '; ') as all_treatments,
    -- Medications (concatenated)
    GROUP_CONCAT(DISTINCT m.medication_name SEPARATOR '; ') as all_medications,
    -- Procedures (concatenated)
    GROUP_CONCAT(DISTINCT pr.procedure_name SEPARATOR '; ') as all_procedures,
    d.created_at,
    d.updated_at
FROM diseases d
LEFT JOIN symptoms s ON d.id = s.disease_id
LEFT JOIN causes c ON d.id = c.disease_id
LEFT JOIN prevention p ON d.id = p.disease_id
LEFT JOIN diagnostic_tests dt ON d.id = dt.disease_id
LEFT JOIN treatments t ON d.id = t.disease_id
LEFT JOIN medications m ON d.id = m.disease_id
LEFT JOIN procedures pr ON d.id = pr.disease_id
GROUP BY d.id, d.disease_name, d.content_type, d.source_url, d.summary, d.created_at, d.updated_at;

-- Symptoms-focused view for symptom-based queries
CREATE OR REPLACE VIEW rag_symptoms_search AS
SELECT 
    d.disease_name,
    d.summary,
    s.symptom_text,
    'symptom' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ': ', s.symptom_text) as search_text
FROM diseases d
INNER JOIN symptoms s ON d.id = s.disease_id
WHERE d.content_type = 'symptoms';

-- Causes-focused view for risk factor queries
CREATE OR REPLACE VIEW rag_causes_search AS
SELECT 
    d.disease_name,
    d.summary,
    c.cause_text,
    'cause' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ' cause: ', c.cause_text) as search_text
FROM diseases d
INNER JOIN causes c ON d.id = c.disease_id
WHERE d.content_type = 'symptoms';

-- Prevention-focused view for prevention queries
CREATE OR REPLACE VIEW rag_prevention_search AS
SELECT 
    d.disease_name,
    d.summary,
    p.prevention_text,
    'prevention' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ' prevention: ', p.prevention_text) as search_text
FROM diseases d
INNER JOIN prevention p ON d.id = p.disease_id
WHERE d.content_type = 'symptoms';

-- Treatment-focused view for treatment queries
CREATE OR REPLACE VIEW rag_treatment_search AS
SELECT 
    d.disease_name,
    d.summary,
    t.treatment_text,
    'treatment' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ' treatment: ', t.treatment_text) as search_text
FROM diseases d
INNER JOIN treatments t ON d.id = t.disease_id
WHERE d.content_type = 'diagnosis'
UNION ALL
SELECT 
    d.disease_name,
    d.summary,
    m.medication_name,
    'medication' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ' medication: ', m.medication_name) as search_text
FROM diseases d
INNER JOIN medications m ON d.id = m.disease_id
WHERE d.content_type = 'diagnosis';

-- Diagnostic-focused view for diagnostic queries
CREATE OR REPLACE VIEW rag_diagnostic_search AS
SELECT 
    d.disease_name,
    d.summary,
    dt.test_name,
    'diagnostic_test' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ' diagnostic test: ', dt.test_name) as search_text
FROM diseases d
INNER JOIN diagnostic_tests dt ON d.id = dt.disease_id
WHERE d.content_type = 'diagnosis'
UNION ALL
SELECT 
    d.disease_name,
    d.summary,
    pr.procedure_name,
    'procedure' as information_type,
    d.source_url,
    CONCAT(d.disease_name, ' procedure: ', pr.procedure_name) as search_text
FROM diseases d
INNER JOIN procedures pr ON d.id = pr.disease_id
WHERE d.content_type = 'diagnosis';

-- Universal search view for RAG text retrieval
CREATE OR REPLACE VIEW rag_universal_search AS
SELECT * FROM rag_symptoms_search
UNION ALL
SELECT * FROM rag_causes_search
UNION ALL
SELECT * FROM rag_prevention_search
UNION ALL
SELECT * FROM rag_treatment_search
UNION ALL
SELECT * FROM rag_diagnostic_search;

-- Show created views
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';