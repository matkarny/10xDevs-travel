import { useState, useEffect, useCallback } from 'react';
import { toast as showToast } from '../ui/Toast';
import type { ToastProps } from '../ui/Toast';

export interface Toast extends ToastProps {
  id: string;
}

/**
 * Hook zarządzający powiadomieniami toast w aplikacji
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  /**
   * Dodaje nowe powiadomienie toast
   */
  const addToast = useCallback((
    type: ToastProps['type'], 
    title: string, 
    description?: string, 
    duration: number = 5000
  ) => {
    // Generuj unikalne ID dla powiadomienia
    const id = crypto.randomUUID();
    
    // Pokaż powiadomienie za pomocą react-toastify
    showToast({
      type,
      title,
      description,
      duration,
      id
    });
    
    // Zapisz powiadomienie w stanie
    const newToast: Toast = {
      id,
      type: type || 'info',
      title,
      description,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Usuń powiadomienie ze stanu po upływie czasu
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  }, []);
  
  /**
   * Usuwa powiadomienie toast
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  /**
   * Dodaje powiadomienie o sukcesie
   */
  const success = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('success', title, description, duration);
  }, [addToast]);
  
  /**
   * Dodaje powiadomienie o błędzie
   */
  const error = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('error', title, description, duration);
  }, [addToast]);
  
  /**
   * Dodaje powiadomienie informacyjne
   */
  const info = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('info', title, description, duration);
  }, [addToast]);
  
  /**
   * Dodaje powiadomienie ostrzegawcze
   */
  const warning = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('warning', title, description, duration);
  }, [addToast]);
  
  // Nasłuchuje zdarzeń powiadomień z innych komponentów
  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { type, message, description, duration } = event.detail;
      addToast(type, message, description, duration);
    };
    
    document.addEventListener('show-toast', handleShowToast as EventListener);
    
    return () => {
      document.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, [addToast]);
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
}
