import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);
    // console.log("🔍 JWT payload:", payload);

    // localStorage에서 user_id 가져와서 병합
    const user_id = localStorage.getItem('user_id');

    return payload ? {
      // ✅ userId: 숫자 또는 문자열 판단 후 일관되게 숫자로 통일
      userId: isNaN(payload.sub) ? payload.sub : Number(payload.sub),
      user_id: user_id ? parseInt(user_id, 10) : null,
      role: payload.auth || ''
    } : null;
  } catch (err) {
    console.error('❌ JWT 파싱 실패:', err);
    return null;
  }
}

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => parseJwt(localStorage.getItem('authToken')));

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
      const parsedUser = parseJwt(token);
      // console.log('👤 파싱된 로그인 사용자:', parsedUser);
      setUser(parsedUser);
    } else {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;
