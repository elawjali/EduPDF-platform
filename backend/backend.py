# EduPDF Backend Source Code

# Import necessary libraries
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
import shutil
import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
import sqlite3
import uuid

# Database models and connection
class Database:
    def __init__(self, db_path="app.db"):
        self.db_path = db_path
        self.conn = None
        self.setup_db()
    
    def get_connection(self):
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def setup_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        ''')
        
        # Create documents table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            user_id TEXT NOT NULL,
            file_path TEXT NOT NULL,
            page_count INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Create quizzes table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
        ''')
        
        # Create quiz_questions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id TEXT PRIMARY KEY,
            quiz_id TEXT NOT NULL,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        )
        ''')
        
        # Create flashcards table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS flashcards (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            term TEXT NOT NULL,
            definition TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
        ''')
        
        # Create summaries table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS summaries (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
        ''')
        
        # Create study_progress table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS study_progress (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            document_id TEXT NOT NULL,
            quiz_score REAL,
            flashcards_completed INTEGER,
            last_accessed TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (document_id) REFERENCES documents (id)
        )
        ''')
        
        conn.commit()

# Pydantic models for request/response
class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class DocumentCreate(BaseModel):
    title: str

class DocumentResponse(BaseModel):
    id: str
    title: str
    page_count: int
    created_at: str

class QuizQuestionCreate(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

class QuizQuestionResponse(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int

class QuizResponse(BaseModel):
    id: str
    questions: List[QuizQuestionResponse]
    created_at: str

class FlashcardCreate(BaseModel):
    term: str
    definition: str

class FlashcardResponse(BaseModel):
    id: str
    term: str
    definition: str
    created_at: str

class SummaryCreate(BaseModel):
    content: str

class SummaryResponse(BaseModel):
    id: str
    content: str
    created_at: str

class StudyProgressResponse(BaseModel):
    id: str
    document_id: str
    quiz_score: Optional[float] = None
    flashcards_completed: Optional[int] = None
    last_accessed: str

# Security utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"  # In production, use a secure environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(db, email):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    return user

def authenticate_user(db, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def get_current_user(db, token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except jwt.PyJWTError:
        raise credentials_exception
    
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (token_data.user_id,))
    user = cursor.fetchone()
    
    if user is None:
        raise credentials_exception
    return user

# Content generation utilities
def extract_text_from_pdf(file_path):
    # In a real implementation, this would use PyMuPDF or PDFplumber
    # For this example, we'll return dummy text
    return """
    EduPDF is a platform that transforms static PDF documents into interactive learning materials.
    It provides features such as quiz generation, flashcard creation, and document summarization.
    The platform uses AI to analyze document content and generate relevant educational materials.
    """

def generate_quiz_questions(text, num_questions=5):
    # In a real implementation, this would use NLP techniques
    # For this example, we'll return dummy questions
    questions = [
        {
            "question": "What is the main purpose of EduPDF?",
            "options": [
                "To convert PDFs to Word documents",
                "To transform PDFs into interactive learning materials",
                "To edit PDF content",
                "To share PDFs online"
            ],
            "correct_answer": 1
        },
        {
            "question": "Which feature is NOT provided by EduPDF?",
            "options": [
                "Quiz generation",
                "Flashcard creation",
                "Document summarization",
                "Video creation"
            ],
            "correct_answer": 3
        }
    ]
    return questions[:min(num_questions, len(questions))]

def generate_flashcards(text, num_cards=5):
    # In a real implementation, this would use NLP techniques
    # For this example, we'll return dummy flashcards
    flashcards = [
        {
            "term": "EduPDF",
            "definition": "A platform that transforms static PDF documents into interactive learning materials."
        },
        {
            "term": "Interactive Learning Materials",
            "definition": "Educational resources that engage users through activities like quizzes and flashcards."
        }
    ]
    return flashcards[:min(num_cards, len(flashcards))]

def generate_summary(text, max_length=500):
    # In a real implementation, this would use NLP techniques
    # For this example, we'll return a dummy summary
    summary = "EduPDF is a comprehensive platform designed to transform static PDF documents into interactive learning materials. It provides features such as quiz generation, flashcard creation, and document summarization to enhance the learning experience. The platform uses AI to analyze document content and generate relevant educational materials."
    return summary[:min(max_length, len(summary))]

# FastAPI application
app = FastAPI(title="EduPDF API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database instance
db = Database()

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Authentication endpoints
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Check if user already exists
    existing_user = get_user_by_email(cursor, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    created_at = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO users (id, email, username, hashed_password, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_id, user.email, user.username, hashed_password, created_at)
    )
    conn.commit()
    
    return {
        "id": user_id,
        "email": user.email,
        "username": user.username,
        "created_at": created_at
    }

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = db.get_connection()
    user = authenticate_user(conn.cursor(), form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Document endpoints
@app.post("/documents", response_model=DocumentResponse)
async def create_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save uploaded file
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(upload_dir, f"{file_id}{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # In a real implementation, count pages using PyMuPDF
    page_count = 10  # Dummy value
    
    # Save document to database
    conn = db.get_connection()
    cursor = conn.cursor()
    
    document_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO documents (id, title, user_id, file_path, page_count, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (document_id, title, current_user["id"], file_path, page_count, created_at)
    )
    conn.commit()
    
    return {
        "id": document_id,
        "title": title,
        "page_count": page_count,
        "created_at": created_at
    }

@app.get("/documents", response_model=List[DocumentResponse])
def get_user_documents(current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC",
        (current_user["id"],)
    )
    documents = cursor.fetchall()
    
    return [
        {
            "id": doc["id"],
            "title": doc["title"],
            "page_count": doc["page_count"],
            "created_at": doc["created_at"]
        }
        for doc in documents
    ]

@app.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (document_id, current_user["id"])
    )
    document = cursor.fetchone()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return {
        "id": document["id"],
        "title": document["title"],
        "page_count": document["page_count"],
        "created_at": document["created_at"]
    }

@app.delete("/documents/{document_id}")
def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (document_id, current_user["id"])
    )
    document = cursor.fetchone()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file
    if os.path.exists(document["file_path"]):
        os.remove(document["file_path"])
    
    # Delete document and related data
    cursor.execute("DELETE FROM study_progress WHERE document_id = ?", (document_id,))
    cursor.execute("DELETE FROM summaries WHERE document_id = ?", (document_id,))
    cursor.execute("DELETE FROM flashcards WHERE document_id = ?", (document_id,))
    
    # Delete quizzes and questions
    cursor.execute("SELECT id FROM quizzes WHERE document_id = ?", (document_id,))
    quiz_ids = [row["id"] for row in cursor.fetchall()]
    
    for quiz_id in quiz_ids:
        cursor.execute("DELETE FROM quiz_questions WHERE quiz_id = ?", (quiz_id,))
    
    cursor.execute("DELETE FROM quizzes WHERE document_id = ?", (document_id,))
    cursor.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    
    conn.commit()
    
    return {"message": "Document deleted successfully"}

# Content generation endpoints
@app.post("/documents/{document_id}/quiz", response_model=QuizResponse)
def create_quiz(document_id: str, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (document_id, current_user["id"])
    )
    document = cursor.fetchone()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Extract text from PDF
    text = extract_text_from_pdf(document["file_path"])
    
    # Generate quiz questions
    questions = generate_quiz_questions(text)
    
    # Save quiz to database
    quiz_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO quizzes (id, document_id, created_at) VALUES (?, ?, ?)",
        (quiz_id, document_id, created_at)
    )
    
    question_responses = []
    for q in questions:
        question_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO quiz_questions (id, quiz_id, question, options, correct_answer) VALUES (?, ?, ?, ?, ?)",
            (question_id, quiz_id, q["question"], ",".join(q["options"]), q["correct_answer"])
        )
        
        question_responses.append({
            "id": question_id,
            "question": q["question"],
            "options": q["options"],
            "correct_answer": q["correct_answer"]
        })
    
    conn.commit()
    
    return {
        "id": quiz_id,
        "questions": question_responses,
        "created_at": created_at
    }

@app.post("/documents/{document_id}/flashcards", response_model=List[FlashcardResponse])
def create_flashcards(document_id: str, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (document_id, current_user["id"])
    )
    document = cursor.fetchone()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Extract text from PDF
    text = extract_text_from_pdf(document["file_path"])
    
    # Generate flashcards
    flashcards = generate_flashcards(text)
    
    # Save flashcards to database
    created_at = datetime.utcnow().isoformat()
    flashcard_responses = []
    
    for fc in flashcards:
        flashcard_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO flashcards (id, document_id, term, definition, created_at) VALUES (?, ?, ?, ?, ?)",
            (flashcard_id, document_id, fc["term"], fc["definition"], created_at)
        )
        
        flashcard_responses.append({
            "id": flashcard_id,
            "term": fc["term"],
            "definition": fc["definition"],
            "created_at": created_at
        })
    
    conn.commit()
    
    return flashcard_responses

@app.post("/documents/{document_id}/summary", response_model=SummaryResponse)
def create_summary(document_id: str, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (document_id, current_user["id"])
    )
    document = cursor.fetchone()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Extract text from PDF
    text = extract_text_from_pdf(document["file_path"])
    
    # Generate summary
    summary_content = generate_summary(text)
    
    # Save summary to database
    summary_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO summaries (id, document_id, content, created_at) VALUES (?, ?, ?, ?)",
        (summary_id, document_id, summary_content, created_at)
    )
    conn.commit()
    
    return {
        "id": summary_id,
        "content": summary_content,
        "created_at": created_at
    }

# Study progress endpoints
@app.post("/documents/{document_id}/progress")
def update_study_progress(
    document_id: str,
    quiz_score: Optional[float] = None,
    flashcards_completed: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (document_id, current_user["id"])
    )
    document = cursor.fetchone()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if progress record exists
    cursor.execute(
        "SELECT * FROM study_progress WHERE user_id = ? AND document_id = ?",
        (current_user["id"], document_id)
    )
    progress = cursor.fetchone()
    
    last_accessed = datetime.utcnow().isoformat()
    
    if progress:
        # Update existing record
        update_fields = []
        params = []
        
        if quiz_score is not None:
            update_fields.append("quiz_score = ?")
            params.append(quiz_score)
        
        if flashcards_completed is not None:
            update_fields.append("flashcards_completed = ?")
            params.append(flashcards_completed)
        
        update_fields.append("last_accessed = ?")
        params.append(last_accessed)
        
        params.extend([current_user["id"], document_id])
        
        cursor.execute(
            f"UPDATE study_progress SET {', '.join(update_fields)} WHERE user_id = ? AND document_id = ?",
            params
        )
    else:
        # Create new record
        progress_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO study_progress (id, user_id, document_id, quiz_score, flashcards_completed, last_accessed) VALUES (?, ?, ?, ?, ?, ?)",
            (progress_id, current_user["id"], document_id, quiz_score, flashcards_completed, last_accessed)
        )
    
    conn.commit()
    
    return {"message": "Progress updated successfully"}

@app.get("/documents/{document_id}/progress", response_model=StudyProgressResponse)
def get_study_progress(document_id: str, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM study_progress WHERE user_id = ? AND document_id = ?",
        (current_user["id"], document_id)
    )
    progress = cursor.fetchone()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No progress found for this document"
        )
    
    return {
        "id": progress["id"],
        "document_id": progress["document_id"],
        "quiz_score": progress["quiz_score"],
        "flashcards_completed": progress["flashcards_completed"],
        "last_accessed": progress["last_accessed"]
    }

# Simplified API for demo purposes
@app.get("/pdf/")
def list_pdfs():
    return {
        "pdfs": [
            {
                "id": "1",
                "title": "Sample PDF",
                "page_count": 10,
                "created_at": datetime.utcnow().isoformat()
            }
        ]
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
