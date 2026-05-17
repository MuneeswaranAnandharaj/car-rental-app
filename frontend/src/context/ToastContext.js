import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState('');

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <div className="toast-message">{message}</div>}
    </ToastContext.Provider>
  );
};
