# Medical Chatbot with RAG (Retrieval-Augmented Generation)

A complete medical knowledge chatbot built with FastAPI backend and React frontend, powered by your comprehensive medical database with 1,159 conditions from Mayo Clinic.

## 🚀 Features

- **RAG-Powered**: Retrieval-Augmented Generation using ChromaDB + sentence-transformers
- **Medical Database**: 1,159 conditions with symptoms, causes, risk factors, complications
- **Modern UI**: Clean React + TypeScript chat interface with Tailwind CSS
- **Source Citations**: All answers include Mayo Clinic source links
- **Real-time Chat**: WebSocket-like experience with typing indicators
- **Disease Browser**: Sidebar with searchable disease list
- **Safety First**: Prominent medical disclaimer and professional consultation reminders

## 📁 Project Structure

```
medical_chatbot_rag/
├── README.md                    # This file
├── backend/                     # FastAPI server
│   ├── main.py                 # RAG endpoints + ChromaDB integration
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   └── medical_symptoms.db    # SQLite database (1,159 conditions)
└── frontend/                   # React TypeScript UI
    ├── App.tsx                # Complete chat interface
    └── README.md              # Frontend-specific setup
```

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8+ 
- Node.js 16+ and npm
- Either:
  - OpenAI API key (recommended for production)
  - OR Ollama running locally (free alternative)

### Backend Setup (FastAPI + ChromaDB)

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env

# 5. Edit .env file with your preferred LLM:
# Option A: OpenAI (recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Option B: Ollama (free, local)
OLLAMA_URL=http://localhost:11434/api/generate
MODEL_NAME=llama3.2:latest

# 6. Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**First Run**: The server will automatically index all 1,159 medical conditions into ChromaDB. This takes ~2-3 minutes initially but only happens once.

### Frontend Setup (React + TypeScript)

```bash
# 1. Create React app (in a new terminal)
cd frontend
npx create-react-app medical-chatbot --template typescript
cd medical-chatbot

# 2. Install additional dependencies
npm install axios react-markdown @tailwindcss/typography

# 3. Set up Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Replace src/App.tsx with the provided App.tsx
# Copy the App.tsx content from frontend/App.tsx to medical-chatbot/src/App.tsx

# 5. Update tailwind.config.js
echo 'module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [require("@tailwindcss/typography")]
}' > tailwind.config.js

# 6. Replace src/index.css with Tailwind
echo '@tailwind base;
@tailwind components;
@tailwind utilities;' > src/index.css

# 7. Start the React development server
npm start
```

## 🎯 Usage

1. **Backend**: Visit `http://localhost:8000/docs` for API documentation
2. **Frontend**: Visit `http://localhost:3000` for the chat interface
3. **Ask questions** like:
   - "What are the symptoms of diabetes?"
   - "What causes heart disease?"
   - "What are the risk factors for stroke?"
   - "Tell me about complications from high blood pressure"

## 🧠 How RAG Works

1. **Question Processing**: User asks medical question
2. **Vector Search**: Question converted to embedding, searches ChromaDB
3. **Context Retrieval**: Top 5 most relevant medical conditions retrieved
4. **LLM Generation**: Context + question sent to LLM (OpenAI or Ollama)
5. **Response**: Answer generated with Mayo Clinic source citations

## 📊 Database Schema

The SQLite database contains:

```sql
CREATE TABLE symptom (
    id INTEGER PRIMARY KEY,
    disease_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    overview TEXT,           -- AI-generated overview
    symptoms TEXT,           -- AI-generated symptoms
    causes TEXT,            -- AI-generated causes
    risk_factors TEXT,      -- AI-generated risk factors
    complications TEXT,     -- AI-generated complications
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration Options

### Using OpenAI (Recommended)

```bash
# In backend/.env
OPENAI_API_KEY=sk-your-key-here
```

### Using Ollama (Free Alternative)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull a model
ollama pull llama3.2

# 3. Start Ollama server
ollama serve

# 4. In backend/.env
OLLAMA_URL=http://localhost:11434/api/generate
MODEL_NAME=llama3.2:latest
```

## 🚨 Medical Disclaimer

This chatbot provides **educational information only** based on Mayo Clinic sources. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

## 🛠️ Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.8+)
- Verify virtual environment: `which python`
- Install dependencies: `pip install -r requirements.txt`

**Frontend won't start?**
- Check Node version: `node --version` (need 16+)
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

**ChromaDB indexing slow?**
- First run indexes 1,159 documents (~2-3 minutes)
- Subsequent runs use persistent storage
- Check disk space (needs ~50MB for vectors)

**LLM not responding?**
- **OpenAI**: Verify API key and billing
- **Ollama**: Ensure `ollama serve` is running and model is pulled

## 📈 Next Steps

1. **Deploy**: Use Docker for production deployment
2. **Enhance**: Add voice input, export chat history
3. **Scale**: Implement user authentication and chat history
4. **Improve**: Add semantic chunking for better retrieval
5. **Extend**: Support multiple languages

## 📝 API Endpoints

- `GET /diseases` - List all diseases
- `GET /disease/{id}` - Get disease details  
- `POST /search` - Vector search diseases
- `POST /chat` - RAG-powered chat endpoint

Visit `http://localhost:8000/docs` for interactive API documentation.

---

**Ready to use!** Start the backend, then frontend, and begin chatting with your medical AI assistant! 🩺✨
