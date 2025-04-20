// EduPDF Frontend Source Code

// Import necessary libraries
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component: App.tsx - Main application component
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Document state
  const [documents, setDocuments] = useState([
    {
      id: '1',
      title: 'Sample Document',
      uploadDate: new Date().toISOString(),
      pageCount: 10,
      thumbnailUrl: ''
    }
  ]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(undefined);
  const [isUploading, setIsUploading] = useState(false);
  
  // Content generation state
  const [activeTab, setActiveTab] = useState('viewer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  
  // Auth handlers
  const handleLogin = (email, password) => {
    setIsLoading(true);
    console.log("Login attempt with:", email, password);
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(true);
      setUserName(email.split('@')[0]);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleRegister = (name, email, password) => {
    setIsLoading(true);
    console.log("Register attempt with:", name, email, password);
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(true);
      setUserName(name);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
  };
  
  // Document handlers
  const handleDocumentSelect = (id) => {
    setSelectedDocumentId(id);
  };
  
  const handleUpload = (files) => {
    setIsUploading(true);
    console.log("Uploading file:", files[0].name);
    // Simulate upload
    setTimeout(() => {
      const newDoc = {
        id: (documents.length + 1).toString(),
        title: files[0].name,
        uploadDate: new Date().toISOString(),
        pageCount: Math.floor(Math.random() * 20) + 5,
        thumbnailUrl: ''
      };
      setDocuments([...documents, newDoc]);
      setIsUploading(false);
    }, 2000);
  };
  
  // Content generation handlers
  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    console.log("Generating quiz for document:", selectedDocumentId);
    // Simulate API call
    setTimeout(() => {
      setQuizData({
        questions: [
          {
            id: '1',
            question: 'What is the main purpose of EduPDF?',
            options: [
              'To convert PDFs to Word documents',
              'To transform PDFs into interactive learning materials',
              'To edit PDF content',
              'To share PDFs online'
            ],
            correctAnswer: 1
          },
          {
            id: '2',
            question: 'Which technology is used for PDF rendering?',
            options: [
              'PDF.js',
              'Adobe Reader',
              'Google Docs',
              'Microsoft Word'
            ],
            correctAnswer: 0
          }
        ]
      });
      setIsGenerating(false);
      setActiveTab('quiz');
    }, 3000);
  };
  
  const handleGenerateFlashcards = () => {
    setIsGenerating(true);
    console.log("Generating flashcards for document:", selectedDocumentId);
    // Simulate API call
    setTimeout(() => {
      setFlashcardsData({
        flashcards: [
          {
            id: '1',
            term: 'EduPDF',
            definition: 'A platform that transforms static PDF documents into interactive learning materials.'
          },
          {
            id: '2',
            term: 'PDF.js',
            definition: 'A JavaScript library developed by Mozilla that allows viewing PDFs in web browsers.'
          }
        ]
      });
      setIsGenerating(false);
      setActiveTab('flashcards');
    }, 3000);
  };
  
  const handleGenerateSummary = () => {
    setIsGenerating(true);
    console.log("Generating summary for document:", selectedDocumentId);
    // Simulate API call
    setTimeout(() => {
      setSummaryData({
        content: 'EduPDF is a comprehensive platform designed to transform static PDF documents into interactive learning materials. It provides features such as quiz generation, flashcard creation, and document summarization to enhance the learning experience. The platform uses AI to analyze document content and generate relevant educational materials.'
      });
      setIsGenerating(false);
      setActiveTab('summary');
    }, 3000);
  };
  
  const handleQuizComplete = (results) => {
    console.log('Quiz completed:', results);
  };
  
  const handleFlashcardsComplete = () => {
    console.log('Flashcards completed');
  };
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/auth" element={
            isAuthenticated ? 
              <Navigate to="/" /> : 
              <AuthPage 
                mode="login" 
                onLogin={handleLogin} 
                onRegister={handleRegister} 
                onToggleMode={() => {}} 
                isLoading={isLoading} 
                error={authError} 
              />
          } />
          
          <Route path="/" element={
            isAuthenticated ? (
              <HomePage 
                isLoggedIn={isAuthenticated} 
                onLogin={() => {}} 
                onRegister={() => {}} 
                onLogout={handleLogout} 
                userName={userName} 
                documents={documents} 
                onDocumentSelect={handleDocumentSelect} 
                onUpload={handleUpload} 
                isUploading={isUploading} 
                selectedDocumentId={selectedDocumentId} 
              />
            ) : (
              <div className="landing-page">
                <header className="landing-header">
                  <div className="logo">EduPDF</div>
                  <div className="auth-buttons">
                    <button onClick={() => window.location.hash = "#/auth"} className="login-btn">Login</button>
                    <button onClick={() => window.location.hash = "#/auth"} className="register-btn">Register</button>
                  </div>
                </header>
                <main className="landing-main">
                  <h1>Transform PDFs into Interactive Learning Materials</h1>
                  <p>Upload your PDFs and generate quizzes, flashcards, and summaries with AI.</p>
                  <div className="cta-buttons">
                    <button onClick={() => window.location.hash = isAuthenticated ? "#/" : "#/auth"} className="get-started-btn">Get Started</button>
                    <button onClick={() => window.location.hash = "#/auth"} className="sign-in-btn">Sign In</button>
                  </div>
                </main>
                <footer className="landing-footer">
                  <p>© 2025 EduPDF. All rights reserved.</p>
                </footer>
              </div>
            )
          } />
          
          <Route path="/viewer/:id" element={
            isAuthenticated ? (
              <ViewerPage 
                isLoggedIn={isAuthenticated} 
                onLogin={() => {}} 
                onRegister={() => {}} 
                onLogout={handleLogout} 
                userName={userName} 
                documentId={selectedDocumentId || '1'} 
                documentTitle={documents.find(d => d.id === selectedDocumentId)?.title || 'Document'} 
                documentUrl="https://arxiv.org/pdf/2303.08774.pdf" // Example URL
                onBackToLibrary={() => {
                  setSelectedDocumentId(undefined);
                  window.location.hash = "#/";
                }} 
                onGenerateQuiz={handleGenerateQuiz} 
                onGenerateFlashcards={handleGenerateFlashcards} 
                onGenerateSummary={handleGenerateSummary} 
                isGenerating={isGenerating} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                quizData={quizData} 
                flashcardsData={flashcardsData} 
                summaryData={summaryData} 
                onQuizComplete={handleQuizComplete} 
                onFlashcardsComplete={handleFlashcardsComplete} 
              />
            ) : (
              <Navigate to="/auth" />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Component: AuthPage.tsx - Authentication page component
function AuthPage({ mode, onLogin, onRegister, onToggleMode, isLoading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email, password);
    } else {
      onRegister(name, email, password);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>EduPDF</h1>
          <p>Transform static PDFs into interactive learning materials</p>
        </div>
        
        <h2>{mode === 'login' ? 'Sign in to EduPDF' : 'Create an account'}</h2>
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {mode === 'login' && (
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot your password?</a>
            </div>
          )}
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>Or continue with</span>
        </div>
        
        <button className="google-button">
          <span className="google-icon">G</span>
          <span>Sign in with Google</span>
        </button>
        
        <div className="auth-footer">
          {mode === 'login' ? (
            <p>Don't have an account? <a href="#" onClick={() => onToggleMode('register')}>Sign up</a></p>
          ) : (
            <p>Already have an account? <a href="#" onClick={() => onToggleMode('login')}>Sign in</a></p>
          )}
        </div>
      </div>
    </div>
  );
}

// Component: HomePage.tsx - Home page with PDF library
function HomePage({ isLoggedIn, onLogin, onRegister, onLogout, userName, documents, onDocumentSelect, onUpload, isUploading, selectedDocumentId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      setIsUploadModalOpen(false);
    }
  };
  
  return (
    <div className="home-page">
      <Navbar 
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
        userName={userName}
      />
      
      <div className="library-container">
        <div className="library-header">
          <h1>Your PDF Library</h1>
          <div className="library-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="upload-button"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload PDF
            </button>
          </div>
        </div>
        
        <div className="documents-grid">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map(doc => (
              <div 
                key={doc.id} 
                className={`document-card ${selectedDocumentId === doc.id ? 'selected' : ''}`}
                onClick={() => onDocumentSelect(doc.id)}
              >
                <div className="document-thumbnail">
                  {doc.thumbnailUrl ? (
                    <img src={doc.thumbnailUrl} alt={doc.title} />
                  ) : (
                    <div className="placeholder-thumbnail">PDF</div>
                  )}
                </div>
                <div className="document-info">
                  <h3>{doc.title}</h3>
                  <p>Pages: {doc.pageCount}</p>
                  <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-library">
              <p>No documents found. Upload a PDF to get started.</p>
            </div>
          )}
        </div>
      </div>
      
      {isUploadModalOpen && (
        <div className="upload-modal">
          <div className="modal-content">
            <h2>Upload PDF</h2>
            <p>Select a PDF file from your computer to upload.</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <div className="modal-actions">
              <button onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
              <button disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: ViewerPage.tsx - PDF viewer with interactive features
function ViewerPage({ 
  isLoggedIn, onLogin, onRegister, onLogout, userName,
  documentId, documentTitle, documentUrl,
  onBackToLibrary, onGenerateQuiz, onGenerateFlashcards, onGenerateSummary,
  isGenerating, activeTab, onTabChange,
  quizData, flashcardsData, summaryData,
  onQuizComplete, onFlashcardsComplete
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  // Simulated PDF loading
  useEffect(() => {
    console.log(`Loading PDF: ${documentUrl}`);
    // In a real implementation, this would use PDF.js to load the document
    setTotalPages(10); // Simulated total pages
  }, [documentUrl]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  return (
    <div className="viewer-page">
      <Navbar 
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
        userName={userName}
      />
      
      <div className="viewer-header">
        <button className="back-button" onClick={onBackToLibrary}>
          Back to Library
        </button>
        <h1>{documentTitle}</h1>
        <div className="viewer-actions">
          <button 
            className="generate-button"
            onClick={onGenerateQuiz}
            disabled={isGenerating}
          >
            {isGenerating && activeTab === 'quiz' ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
          <button 
            className="generate-button"
            onClick={onGenerateFlashcards}
            disabled={isGenerating}
          >
            {isGenerating && activeTab === 'flashcards' ? 'Generating Flashcards...' : 'Generate Flashcards'}
          </button>
          <button 
            className="generate-button"
            onClick={onGenerateSummary}
            disabled={isGenerating}
          >
            {isGenerating && activeTab === 'summary' ? 'Generating Summary...' : 'Generate Summary'}
          </button>
        </div>
      </div>
      
      <div className="viewer-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'viewer' ? 'active' : ''}`}
            onClick={() => onTabChange('viewer')}
          >
            PDF Viewer
          </button>
          <button 
            className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => onTabChange('quiz')}
            disabled={!quizData}
          >
            Quiz
          </button>
          <button 
            className={`tab ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => onTabChange('flashcards')}
            disabled={!flashcardsData}
          >
            Flashcards
          </button>
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => onTabChange('summary')}
            disabled={!summaryData}
          >
            Summary
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'viewer' && (
            <div className="pdf-viewer">
              <div className="pdf-controls">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </button>
                <button onClick={handleZoomOut}>-</button>
                <span>{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn}>+</button>
              </div>
              <div className="pdf-container" style={{ transform: `scale(${scale})` }}>
                {/* In a real implementation, this would render the PDF using PDF.js */}
                <div className="pdf-page">
                  <div className="pdf-placeholder">
                    <h3>PDF Page {currentPage}</h3>
                    <p>This is a simulated PDF viewer. In a real implementation, this would display the actual PDF content using PDF.js.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'quiz' && quizData && (
            <div className="quiz-container">
              <h2>Quiz</h2>
              <div className="quiz-questions">
                {quizData.questions.map((question, index) => (
                  <div key={question.id} className="quiz-question">
                    <h3>Question {index + 1}: {question.question}</h3>
                    <div className="quiz-options">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="quiz-option">
                          <input
                            type="radio"
                            id={`q${question.id}-opt${optIndex}`}
                            name={`question-${question.id}`}
                          />
                          <label htmlFor={`q${question.id}-opt${optIndex}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="submit-quiz" onClick={() => onQuizComplete([])}>
                Submit Quiz
              </button>
            </div>
          )}
          
          {activeTab === 'flashcards' && flashcardsData && (
            <div className="flashcards-container">
              <h2>Flashcards</h2>
              <div className="flashcards">
                {flashcardsData.flashcards.map(card => (
                  <div key={card.id} className="flashcard">
                    <div className="flashcard-front">
                      <h3>{card.term}</h3>
                    </div>
                    <div className="flashcard-back">
                      <p>{card.definition}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="complete-flashcards" onClick={onFlashcardsComplete}>
                Mark as Completed
              </button>
            </div>
          )}
          
          {activeTab === 'summary' && summaryData && (
            <div className="summary-container">
              <h2>Document Summary</h2>
              <div className="summary-content">
                <p>{summaryData.content}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component: Navbar.tsx - Navigation bar component
function Navbar({ isLoggedIn, onLogin, onRegister, onLogout, userName }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="#/">EduPDF</a>
      </div>
      <div className="navbar-links">
        <a href="#/">Home</a>
        <a href="#/">Library</a>
        <a href="#/">About</a>
      </div>
      <div className="navbar-auth">
        {isLoggedIn ? (
          <>
            <span className="user-name">Welcome, {userName}</span>
            <button className="logout-button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={onLogin}>Login</button>
            <button className="register-button" onClick={onRegister}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}

// CSS Styles for the application
const styles = `
/* Global styles */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  color: #333;
  background-color: #f9fafb;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Landing page styles */
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.login-btn, .register-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.login-btn {
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.register-btn {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.landing-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background-color: #f9fafb;
}

.landing-main h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
  max-width: 800px;
}

.landing-main p {
  font-size: 1.25rem;
  color: #4b5563;
  margin-bottom: 2rem;
  max-width: 600px;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}

.get-started-btn, .sign-in-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.get-started-btn {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.sign-in-btn {
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.landing-footer {
  padding: 1rem;
  text-align: center;
  background-color: white;
  border-top: 1px solid #e5e7eb;
}

/* Auth page styles */
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.auth-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.submit-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.auth-divider span {
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.google-button {
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #333;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.google-icon {
  font-weight: bold;
  color: #ea4335;
}

.auth-footer {
  text-align: center;
}

.auth-footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

/* Navbar styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.navbar-links a {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
}

.navbar-links a:hover {
  color: #3b82f6;
}

.navbar-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

.login-button, .register-button, .logout-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.login-button {
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.register-button, .logout-button {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

/* Home page styles */
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.library-container {
  flex: 1;
  padding: 2rem;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.library-actions {
  display: flex;
  gap: 1rem;
}

.search-bar input {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 250px;
}

.upload-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.document-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.document-card.selected {
  border: 2px solid #3b82f6;
}

.document-thumbnail {
  height: 150px;
  background-color: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-thumbnail {
  font-size: 2rem;
  font-weight: bold;
  color: #9ca3af;
}

.document-info {
  padding: 1rem;
}

.document-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.document-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.empty-library {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
}

.modal-content h2 {
  margin-top: 0;
}

.modal-content input[type="file"] {
  margin: 1.5rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.modal-actions button:last-child {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

/* Viewer page styles */
.viewer-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-right: 1.5rem;
}

.viewer-header h1 {
  margin: 0;
  flex: 1;
  font-size: 1.25rem;
}

.viewer-actions {
  display: flex;
  gap: 0.5rem;
}

.generate-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.generate-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.viewer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.tab-content {
  flex: 1;
}

.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pdf-controls button {
  padding: 0.25rem 0.5rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
}

.pdf-container {
  flex: 1;
  overflow: auto;
  background-color: #f3f4f6;
  display: flex;
  justify-content: center;
  padding: 2rem;
  transform-origin: top center;
}

.pdf-page {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 612px; /* Standard US Letter width in pixels at 96 DPI */
  height: 792px; /* Standard US Letter height in pixels at 96 DPI */
  display: flex;
  justify-content: center;
  align-items: center;
}

.pdf-placeholder {
  text-align: center;
  padding: 2rem;
}

.quiz-container, .flashcards-container, .summary-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.quiz-container h2, .flashcards-container h2, .summary-container h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.quiz-question {
  margin-bottom: 2rem;
}

.quiz-question h3 {
  margin-bottom: 1rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-quiz, .complete-flashcards {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1.5rem;
}

.flashcards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.flashcard {
  width: 300px;
  height: 200px;
  perspective: 1000px;
  cursor: pointer;
}

.flashcard-front, .flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.flashcard-front {
  background-color: #3b82f6;
  color: white;
}

.flashcard-back {
  background-color: white;
  transform: rotateY(180deg);
}

.flashcard:hover .flashcard-front {
  transform: rotateY(180deg);
}

.flashcard:hover .flashcard-back {
  transform: rotateY(0);
}

.summary-content {
  line-height: 1.6;
}

/* Responsive styles */
@media (max-width: 768px) {
  .landing-main h1 {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
  }
  
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }
  
  .navbar-logo, .navbar-links, .navbar-auth {
    margin-bottom: 0.5rem;
  }
  
  .library-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .library-actions {
    width: 100%;
    margin-top: 1rem;
  }
  
  .search-bar input {
    width: 100%;
  }
  
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .viewer-actions {
    width: 100%;
    margin-top: 1rem;
  }
  
  .tabs {
    overflow-x: auto;
  }
}
`;

export default App;
