import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((t) => t.map(x => x.id === id ? { ...x, leaving: true } : x));
        setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 200);
    }, []);

    const push = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => remove(id), duration);
    }, [remove]);

    const toast = {
        success: (m) => push(m, 'success'),
        error: (m) => push(m, 'error', 5000),
        info: (m) => push(m, 'info'),
    };

    const iconFor = (type) => {
        if (type === 'success') return <CheckCircle2 size={18} />;
        if (type === 'error') return <XCircle size={18} />;
        return <Info size={18} />;
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type} ${t.leaving ? 'leaving' : ''}`}>
                        <span className="toast-icon">{iconFor(t.type)}</span>
                        <span className="toast-message">{t.message}</span>
                        <button className="toast-close" onClick={() => remove(t.id)} aria-label="Close">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);