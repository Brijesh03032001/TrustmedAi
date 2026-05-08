# Medical RAG Chatbot Frontend Development Prompt

## Project Overview
Create a modern, responsive React frontend for a Medical RAG (Retrieval-Augmented Generation) Chatbot that helps users get AI-powered medical information.

## Backend API Integration

### Base URL: `http://localhost:8001`

### Core Endpoints to Integrate:

1. **Main Chat Interface - POST /chat**
   - Input: `{"question": "medical query"}`
   - Output: `{"answer": "AI response", "sources": ["Disease1", "Disease2"], "confidence": 0.92}`
   - Use for: Primary conversational AI interface

2. **Quick Search - POST /search**  
   - Input: `{"question": "symptoms", "limit": 5}`
   - Output: `[{"disease": "Name", "source": "URL", "distance": 0.82}]`
   - Use for: Instant medical condition lookup

3. **Disease Database - GET /diseases**
   - Output: `[{"id": 1, "name": "Disease Name"}]`
   - Use for: Browse all 1159 medical conditions

4. **Disease Details - GET /disease/{id}**
   - Output: Complete disease info with symptoms, causes, complications
   - Use for: Detailed condition pages

5. **Health Check - GET /health**
   - Use for: System status monitoring

## Required Frontend Features:

### 1. Main Chat Interface
- Clean, WhatsApp/ChatGPT-style chat UI
- Message input with send button
- Chat history display
- AI response with source citations
- Confidence score indicator
- Medical disclaimer notice
- Loading states during API calls

### 2. Quick Search Panel
- Search bar for instant condition lookup
- Results display with similarity scores
- Click to get detailed info
- Recent searches history

### 3. Disease Browser
- Searchable/filterable list of all diseases
- Alphabetical organization
- Click to view detailed disease pages
- Pagination for large dataset

### 4. Disease Detail Pages
- Complete medical information display
- Symptoms, causes, risk factors, complications
- Source attribution (Mayo Clinic links)
- Related conditions suggestions

### 5. Navigation & Layout
- Responsive sidebar navigation
- Mobile-friendly responsive design
- Header with app title and status
- Footer with disclaimers

## Technical Requirements:

### Technology Stack:
- React 18+ with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- React Query/SWR for data fetching
- Lucide React for icons

### UI/UX Guidelines:
- Medical/healthcare color scheme (blues, greens, whites)
- Clean, professional medical app aesthetic
- Accessibility compliance (WCAG guidelines)
- Fast, responsive performance
- Error handling and loading states
- Mobile-first responsive design

### Key Components Needed:
1. `ChatInterface` - Main conversation UI
2. `SearchPanel` - Quick medical search
3. `DiseaseList` - Browse all conditions  
4. `DiseaseDetail` - Individual disease pages
5. `MessageBubble` - Chat message display
6. `SourceCitation` - Reference display
7. `LoadingSpinner` - Loading states
8. `ErrorBoundary` - Error handling
9. `MedicalDisclaimer` - Legal notice component

### Medical Disclaimers Required:
- "This is for informational purposes only"
- "Not a substitute for professional medical advice"
- "Consult healthcare providers for medical decisions"
- "Emergency: Call 911 immediately"

### API Integration Patterns:
```javascript
// Chat endpoint usage
const sendMessage = async (question) => {
  const response = await fetch('http://localhost:8001/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  return await response.json();
};

// Search endpoint usage  
const searchConditions = async (query, limit = 5) => {
  const response = await fetch('http://localhost:8001/search', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: query, limit })
  });
  return await response.json();
};
```

## Project Structure:
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── SourceCitation.tsx
│   ├── search/
│   │   ├── SearchPanel.tsx
│   │   └── SearchResults.tsx
│   ├── diseases/
│   │   ├── DiseaseList.tsx
│   │   ├── DiseaseCard.tsx
│   │   └── DiseaseDetail.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── MedicalDisclaimer.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useSearch.ts
│   └── useDiseases.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── App.tsx
```

## Success Criteria:
- Seamless integration with all 5 backend endpoints
- Professional medical app user experience
- Fast, responsive performance with 1159 diseases
- Mobile and desktop compatibility
- Proper error handling and loading states
- Medical disclaimers and safety notices
- Source attribution for all medical information

Create a complete, production-ready medical chatbot frontend that provides users with reliable, AI-powered medical information while maintaining appropriate medical disclaimers and professional healthcare standards.