// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import AuthProvider from './context/AuthContext'; // ✅ default import로 변경
import ScrollToTop from './components/ScrollToTop'; // 추가

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ AuthContext를 전역으로 감싸기 */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
