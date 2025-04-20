# EduPDF Platform - Source Code Documentation

This document provides an overview of the source code files for the EduPDF platform, a web application that transforms PDFs into interactive learning materials.

## Source Code Files

The source code is organized into two main files:

1. **frontend.js** - Contains the complete React frontend application
2. **backend.py** - Contains the complete FastAPI backend application

### Frontend (frontend.js)

The frontend is built with React and includes:

- **App Component**: The main application component that handles routing and state management
- **AuthPage Component**: Handles user authentication (login and registration)
- **HomePage Component**: Displays the PDF library and document management
- **ViewerPage Component**: Provides PDF viewing and interactive learning features
- **Navbar Component**: Navigation bar for the application
- **CSS Styles**: Complete styling for the application

The frontend uses:
- React for UI components
- React Router (HashRouter) for navigation
- CSS for styling
- PDF.js for PDF rendering

### Backend (backend.py)

The backend is built with FastAPI and includes:

- **Database Models**: SQLite database schema for users, documents, quizzes, flashcards, etc.
- **Pydantic Models**: Request/response models for API endpoints
- **Authentication**: JWT-based authentication system
- **Document Management**: Upload, retrieval, and deletion of PDFs
- **Content Generation**: Quiz, flashcard, and summary generation
- **Study Progress Tracking**: User progress tracking for learning materials

The backend uses:
- FastAPI for API endpoints
- SQLite for database storage
- JWT for authentication
- Content generation utilities for learning materials

## How to Use

### Frontend

1. Create a React application:
   ```bash
   npx create-react-app edupdf-frontend
   cd edupdf-frontend
   ```

2. Replace the contents of `src/App.js` with the code from `frontend.js`

3. Install required dependencies:
   ```bash
   npm install react-router-dom @react-pdf-viewer/core @react-pdf-viewer/default-layout pdfjs-dist
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Backend

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Create a new file `app.py` and copy the contents from `backend.py`

3. Install required dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart sqlalchemy pyjwt passlib python-jose[cryptography]
   ```

4. Start the backend server:
   ```bash
   uvicorn app:app --reload
   ```

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**:
  - `POST /register` - Register a new user
  - `POST /token` - Login and get access token

- **Document Management**:
  - `POST /documents` - Upload a new PDF
  - `GET /documents` - List all user documents
  - `GET /documents/{document_id}` - Get document details
  - `DELETE /documents/{document_id}` - Delete a document

- **Content Generation**:
  - `POST /documents/{document_id}/quiz` - Generate a quiz
  - `POST /documents/{document_id}/flashcards` - Generate flashcards
  - `POST /documents/{document_id}/summary` - Generate a summary

- **Study Progress**:
  - `POST /documents/{document_id}/progress` - Update study progress
  - `GET /documents/{document_id}/progress` - Get study progress

## Deployment

For deployment instructions, please refer to the separate deployment manual.
