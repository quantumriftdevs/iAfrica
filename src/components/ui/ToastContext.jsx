import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = Date.now() + Math.random();
    const t = { id, message, type };
    setToasts((s) => [t, ...s]);
    if (duration > 0) {
      setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), duration);
    }
    return id;
  }, []);

  const remove = useCallback((id) => setToasts((s) => s.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push, remove, toasts }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-xs w-full rounded-lg p-3 text-white shadow ${t.type === 'error' ? 'bg-red-600' : (t.type === 'success' ? 'bg-emerald-600' : 'bg-gray-700')}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
