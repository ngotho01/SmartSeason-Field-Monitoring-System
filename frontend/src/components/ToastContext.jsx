import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    const push = useCallback((type, title, message) => {
        const id = ++idCounter;
        setToasts((t) => [...t, { id, type, title, message }]);
        setTimeout(() => remove(id), 4000);
    }, [remove]);

    const toast = {
        success: (title, message) => push('success', title, message),
        error: (title, message) => push('error', title, message),
        warning: (title, message) => push('warning', title, message),
        info: (title, message) => push('info', title, message),
    };

    const icons = {
        success: <CheckCircle2 size={18} />,
        error: <XCircle size={18} />,
        warning: <AlertTriangle size={18} />,
        info: <Info size={18} />,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        <div className={`toast-icon ${t.type}`}>{icons[t.type]}</div>
                        <div className="toast-content">
                            {t.title && <div className="toast-title">{t.title}</div>}
                            {t.message && <div>{t.message}</div>}
                        </div>
                        <button className="toast-close" onClick={() => remove(t.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);