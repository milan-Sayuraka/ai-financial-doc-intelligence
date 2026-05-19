import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import { store, RootState } from './store';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import RAGPage from './pages/RAGPage';
import AgentsPage from './pages/AgentsPage';
import MLPage from './pages/MLPage';

// Protected Route component
 const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
<Route path="/documents" element={
  <ProtectedRoute>
    <AppLayout>
      <DocumentsPage />
    </AppLayout>
  </ProtectedRoute>
} />
        
<Route path="/rag" element={
  <ProtectedRoute>
    <AppLayout>
      <RAGPage />
    </AppLayout>
  </ProtectedRoute>
} />
        
<Route path="/agents" element={
  <ProtectedRoute>
    <AppLayout>
      <AgentsPage />
    </AppLayout>
  </ProtectedRoute>
} />
        
<Route path="/ml-models" element={
  <ProtectedRoute>
    <AppLayout>
      <MLPage />
    </AppLayout>
  </ProtectedRoute>
} />
      </Routes>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;