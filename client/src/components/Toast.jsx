import { useState, useEffect, useCallback } from 'react';

let toastQueue = [];
let listeners = [];

const notify = (toast) => {
    toastQueue = [...toastQueue, toast];
    listeners.forEach(fn => fn([...toastQueue]));
};

export const toast = {
    success: (msg) => notify({ id: Date.now(), type: 'success', msg, icon: '✅' }),
    error:   (msg) => notify({ id: Date.now(), type: 'error',   msg, icon: '❌' }),
    info:    (msg) => notify({ id: Date.now(), type: 'info',    msg, icon: 'ℹ️' }),
    warning: (msg) => notify({ id: Date.now(), type: 'warning', msg, icon: '⚠️' }),
};

export default function Toast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (list) => setToasts(list);
        listeners.push(handler);
        return () => { listeners = listeners.filter(l => l !== handler); };
    }, []);

    const remove = useCallback((id) => {
        toastQueue = toastQueue.filter(t => t.id !== id);
        listeners.forEach(fn => fn([...toastQueue]));
    }, []);

    useEffect(() => {
        if (toasts.length === 0) return;
        const timer = setTimeout(() => remove(toasts[0].id), 4000);
        return () => clearTimeout(timer);
    }, [toasts, remove]);

    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span className="toast-icon">{t.icon}</span>
                    <span style={{ flex: 1 }}>{t.msg}</span>
                    <button
                        onClick={() => remove(t.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6, fontFamily: 'inherit' }}
                    >✕</button>
                </div>
            ))}
        </div>
    );
}
