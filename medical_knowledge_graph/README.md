# Medical Knowledge Graph System

A professional-grade medical knowledge graph system that transforms structured medical data into an intelligent, queryable graph database using Python and Neo4j for medical research and AI applications.

## 🎯 Project Overview

This system creates a comprehensive medical knowledge graph by extracting data from a SQLite database containing medical conditions, symptoms, causes, and treatments, then transforming it into a Neo4j graph database with advanced querying capabilities.

### Key Features

- **🏗️ Automated Graph Construction**: Extract and transform medical data from SQLite to Neo4j
- **🔍 Advanced Query Engine**: Support for complex medical queries and pattern matching
- **🧠 Semantic Similarity**: Calculate disease similarities using sentence transformers
- **📊 Analytics & Visualization**: Comprehensive graph analytics and statistics
- **⚡ High Performance**: Parallel processing and optimized graph structures
- **🔧 Extensible Architecture**: Modular design for easy customization and extension

## 📋 System Requirements

### Dependencies

- **Python**: 3.9 or higher
- **Neo4j**: Community or Enterprise Edition (7.x recommended)
- **SQLite**: For source medical database

### Required Python Packages

```bash
pip install -r requirements.txt
```

Key packages:
- `neo4j`: Neo4j Python driver
- `pandas`: Data manipulation and analysis
- `spacy`: NLP processing
- `sentence-transformers`: Semantic embeddings
- `networkx`: Graph analysis
- `scikit-learn`: Machine learning utilities

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Clone or download the project
cd medical_knowledge_graph

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 2. Configure Neo4j

Start Neo4j database:
```bash
# Using Docker (recommended)
docker run \
    --name neo4j \
    -p7474:7474 -p7687:7687 \
    -d \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    --env NEO4J_AUTH=neo4j/password \
    neo4j:latest

# Or install Neo4j Desktop/Server locally
```

### 3. Build Knowledge Graph

```bash
# Analyze source data
python main.py --analyze

# Build the complete knowledge graph
python main.py --build

# Build and run demonstration
python main.py --build --demo
```

### 4. Query the Graph

```bash
# Interactive query session
python main.py --query

# Run demonstration queries
python main.py --demo
```

## 🏗️ System Architecture

```
medical_knowledge_graph/
├── main.py                 # Main application entry point
├── config/
│   └── settings.py         # Configuration management
├── src/
│   ├── database.py         # Database connections and schema
│   ├── data_processor.py   # Data extraction and processing
│   ├── graph_builder.py    # Neo4j graph construction
│   └── query_engine.py     # Advanced query capabilities
├── data/
│   └── medical_symptoms.db # Source SQLite database
├── logs/                   # Application logs
├── notebooks/              # Jupyter notebooks for analysis
└── tests/                  # Unit tests
```

### Core Components

#### 1. **Database Module** (`src/database.py`)
- **DatabaseConnection**: Manages SQLite and Neo4j connections
- **SchemaSetup**: Creates constraints and indexes
- **SQLiteAnalyzer**: Analyzes source database structure
- **GraphAnalyzer**: Provides graph statistics and metrics

#### 2. **Data Processor** (`src/data_processor.py`)
- **TextProcessor**: NLP processing with spaCy and transformers
- **MedicalDataExtractor**: Extracts entities and relationships
- **Entity Recognition**: Identifies symptoms, diseases, causes
- **Semantic Embeddings**: Generates vector representations

#### 3. **Graph Builder** (`src/graph_builder.py`)
- **GraphBuilder**: Constructs Neo4j knowledge graph
- **GraphOptimizer**: Performance optimization and indexing
- **Parallel Processing**: Efficient batch operations
- **Relationship Creation**: Builds semantic connections

#### 4. **Query Engine** (`src/query_engine.py`)
- **KnowledgeGraphQuery**: Advanced query operations
- **QueryInterface**: Interactive query interface
- **Pattern Matching**: Complex graph patterns
- **Similarity Search**: Semantic similarity queries

## 🔍 Query Capabilities

### Available Query Types

1. **Disease by Symptoms**
   ```python
   # Find diseases matching specific symptoms
   symptoms = ["fever", "headache", "fatigue"]
   results = query_engine.find_diseases_by_symptoms(symptoms)
   ```

2. **Similar Diseases**
   ```python
   # Find diseases similar to a given condition
   results = query_engine.find_similar_diseases("disease_123", min_similarity=0.7)
   ```

3. **Symptom Patterns**
   ```python
   # Discover common symptom co-occurrences
   results = query_engine.find_symptom_patterns(limit=20)
   ```

4. **Disease Profile**
   ```python
   # Get comprehensive disease information
   results = query_engine.get_disease_profile("disease_123")
   ```

5. **Text Search**
   ```python
   # Full-text search across entities
   results = query_engine.search_by_text("diabetes")
   ```

6. **Graph Analytics**
   ```python
   # Comprehensive graph statistics
   results = query_engine.get_graph_statistics()
   ```

### Example Cypher Queries

```cypher
-- Find diseases with multiple shared symptoms
MATCH (d1:Disease)-[:HAS_SYMPTOM]->(s:Symptom)<-[:HAS_SYMPTOM]-(d2:Disease)
WHERE d1.id < d2.id
WITH d1, d2, count(s) as shared_symptoms
WHERE shared_symptoms >= 3
RETURN d1.name, d2.name, shared_symptoms
ORDER BY shared_symptoms DESC

-- Most connected nodes in the graph
MATCH (n)
OPTIONAL MATCH (n)-[r]-()
RETURN n.name, labels(n)[0] as type, count(r) as connections
ORDER BY connections DESC
LIMIT 10

-- Symptom co-occurrence network
MATCH (s1:Symptom)<-[:HAS_SYMPTOM]-(d:Disease)-[:HAS_SYMPTOM]->(s2:Symptom)
WHERE s1.name < s2.name
RETURN s1.name, s2.name, count(d) as co_occurrence
ORDER BY co_occurrence DESC
```

## 📊 Data Model

### Node Types

- **Disease**: Medical conditions with descriptions, symptoms, causes
- **Symptom**: Clinical manifestations and signs
- **Cause**: Underlying factors and mechanisms
- **RiskFactor**: Predisposing factors
- **Treatment**: Therapeutic interventions
- **BodySystem**: Anatomical systems affected

### Relationship Types

- **HAS_SYMPTOM**: Disease → Symptom
- **CAUSED_BY**: Disease → Cause
- **HAS_RISK_FACTOR**: Disease → RiskFactor
- **TREATED_BY**: Disease → Treatment
- **AFFECTS_SYSTEM**: Disease → BodySystem
- **SIMILAR_TO**: Disease ↔ Disease
- **COMPLICATES**: Disease → Disease

### Properties and Embeddings

Each entity includes:
- **Semantic embeddings** for similarity calculations
- **Metadata** from source database
- **Relationships weights** for strength indicators
- **Timestamps** for tracking creation/updates

## 🎛️ Configuration

### Environment Variables

Create a `.env` file:
```bash
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j

# Processing Configuration
BATCH_SIZE=1000
MAX_WORKERS=4
SIMILARITY_THRESHOLD=0.75

# Logging
LOG_LEVEL=INFO
DEBUG=False
```

### Settings Customization

Modify `config/settings.py` for:
- Database connection parameters
- Processing batch sizes
- NLP model selection
- Graph schema configuration
- Query optimization settings

## 🚀 Advanced Usage

### Custom Entity Extraction

```python
from src.data_processor import TextProcessor

processor = TextProcessor()

# Extract medical entities from text
text = "Patient presents with severe headache and high fever"
entities = processor.extract_medical_entities(text)

# Generate semantic embedding
embedding = processor.get_embedding(text)
```

### Direct Graph Operations

```python
from src.graph_builder import GraphBuilder
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))
builder = GraphBuilder(driver)

# Custom node creation
entities = [...]  # Your medical entities
relationships = [...]  # Your relationships

success = builder.build_graph(entities, relationships)
```

### Custom Queries

```python
from src.query_engine import KnowledgeGraphQuery

query_engine = KnowledgeGraphQuery(driver)

# Custom Cypher query
with driver.session() as session:
    result = session.run("""
        MATCH (d:Disease)-[r:HAS_SYMPTOM]->(s:Symptom)
        WHERE d.name CONTAINS 'diabetes'
        RETURN d.name, collect(s.name) as symptoms
    """)
```

## 📈 Performance Optimization

### Indexing Strategy

The system automatically creates:
- **Unique constraints** on entity IDs
- **Text indexes** on names and descriptions
- **Embedding indexes** for similarity searches
- **Composite indexes** for complex queries

### Batch Processing

- Configurable batch sizes for large datasets
- Parallel processing with thread pools
- Memory-efficient streaming operations
- Progress tracking and error handling

### Query Optimization

- Parameterized queries to prevent injection
- Result pagination for large datasets
- Caching for frequently accessed data
- Connection pooling for high concurrency

## 🔬 Research Applications

### Medical AI & ML

- **Training Data**: Generate labeled datasets for ML models
- **Feature Engineering**: Extract graph-based features
- **Similarity Models**: Train disease similarity predictors
- **Knowledge Discovery**: Find novel medical associations

### Clinical Decision Support

- **Differential Diagnosis**: Suggest possible conditions
- **Symptom Analysis**: Analyze symptom patterns
- **Risk Assessment**: Identify risk factors
- **Treatment Options**: Explore treatment pathways

### Medical Research

- **Epidemiology**: Study disease patterns and connections
- **Drug Discovery**: Identify potential therapeutic targets
- **Biomedical NLP**: Enhance medical text processing
- **Knowledge Graphs**: Build domain-specific ontologies

## 🧪 Testing and Validation

### Unit Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test modules
python -m pytest tests/test_data_processor.py
python -m pytest tests/test_graph_builder.py

# Run with coverage
python -m pytest tests/ --cov=src --cov-report=html
```

### Data Validation

- **Schema validation**: Ensure data integrity
- **Embedding verification**: Check vector quality
- **Relationship validation**: Verify graph structure
- **Performance benchmarks**: Monitor query performance

## 🚧 Development and Extension

### Adding New Entity Types

1. Update `config/settings.py`:
```python
node_types = {
    "NewEntityType": {
        "primary_key": "entity_id",
        "required_fields": ["name", "description"],
        "optional_fields": ["custom_field"]
    }
}
```

2. Extend `data_processor.py`:
```python
def extract_new_entities(self) -> List[MedicalEntity]:
    # Implementation for new entity type
    pass
```

3. Update `graph_builder.py`:
```python
# Add creation logic for new node type
```

### Custom NLP Models

```python
# Replace default embedding model
from sentence_transformers import SentenceTransformer

class CustomTextProcessor(TextProcessor):
    def __init__(self):
        super().__init__()
        self.embedding_model = SentenceTransformer('your-custom-model')
```

### Additional Relationships

```python
# Define new relationship types in settings.py
relationship_types = {
    "NEW_RELATIONSHIP": {
        "weight_field": "strength", 
        "direction": "outgoing"
    }
}
```

## 📊 Monitoring and Analytics

### Graph Metrics

- **Node/relationship counts** by type
- **Graph density** and connectivity
- **Most connected entities**
- **Clustering coefficients**
- **Path analysis** between entities

### Performance Metrics

- **Query execution times**
- **Memory usage patterns**
- **Index effectiveness**
- **Batch processing throughput**

### Health Monitoring

```bash
# Check graph health
python main.py --analyze

# View comprehensive statistics
python -c "
from src.database import initialize_system
from src.graph_builder import GraphOptimizer

db_conn, _ = initialize_system()
optimizer = GraphOptimizer(db_conn.neo4j_driver)
stats = optimizer.calculate_graph_statistics()
print(stats)
"
```

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd medical_knowledge_graph

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install development dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install
```

### Code Style

- **Black**: Code formatting
- **flake8**: Linting
- **mypy**: Type checking
- **isort**: Import sorting

```bash
# Format code
black src/ tests/

# Run linting
flake8 src/ tests/

# Type checking
mypy src/
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support and Documentation

### Getting Help

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions
- **Documentation**: Comprehensive docs in `/docs` directory
- **Examples**: Sample notebooks in `/notebooks` directory

### Common Issues

1. **Neo4j Connection Failed**
   - Verify Neo4j is running
   - Check connection credentials
   - Ensure ports 7474 and 7687 are accessible

2. **Memory Issues**
   - Reduce batch sizes in configuration
   - Increase JVM heap size for Neo4j
   - Process data in smaller chunks

3. **Slow Queries**
   - Check index creation
   - Optimize Cypher queries
   - Monitor query profiling

### Performance Tuning

```bash
# Neo4j configuration recommendations
echo "
dbms.memory.heap.initial_size=2g
dbms.memory.heap.max_size=4g
dbms.memory.pagecache.size=2g
" >> neo4j.conf
```

---

## 📈 Roadmap

### Upcoming Features

- [ ] **Web Interface**: Interactive graph visualization
- [ ] **API Server**: REST/GraphQL API endpoints
- [ ] **Real-time Updates**: Streaming data integration
- [ ] **Machine Learning**: Integrated ML pipelines
- [ ] **Ontology Integration**: SNOMED CT, ICD-10 mapping
- [ ] **Multi-language Support**: International medical terminologies

### Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Performance optimizations and query improvements
- **v1.2.0**: Advanced analytics and visualization
- **v2.0.0**: Web interface and API server (planned)

---

**🏥 Medical Knowledge Graph System - Transforming Medical Data into Actionable Intelligence**