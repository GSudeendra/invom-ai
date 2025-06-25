import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    return addToast(message, type, duration);
  }, [addToast]);

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Group toasts by message+type
  const groupedToasts = Object.values(
    toasts.reduce((acc, toast) => {
      const key = toast.message + '|' + toast.type;
      if (!acc[key]) {
        acc[key] = { ...toast, count: 1, ids: [toast.id] };
      } else {
        acc[key].count += 1;
        acc[key].ids.push(toast.id);
      }
      return acc;
    }, {})
  );

  const value = {
    addToast,
    removeToast,
    removeAllToasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {groupedToasts.map(toast => (
          <Toast
            key={toast.ids[0]}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            count={toast.count}
            onClose={() => toast.ids.forEach(removeToast)}
          />
        ))}
        {groupedToasts.length > 1 && (
          <button className="toast-dismiss-all" onClick={removeAllToasts}>
            Dismiss All
          </button>
        )}
      </div>
    </ToastContext.Provider>
  );
}; 