 

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  metadata?: {
    stepId?: string;
    agentId?: string;
    timestamp: Date;
    retryable?: boolean;
    details?: any;
  };
}

interface ToastAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'destructive';
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  toasts: ToastMessage[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toastData: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = {
      id,
      duration: 5000,
      persistent: false,
      ...toastData,
      metadata: {
        timestamp: new Date(),
        ...toastData.metadata
      }
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev];
      return newToasts.slice(0, maxToasts);
    });

    // Auto-remove non-persistent toasts
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAll, toasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
}

const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const toastColors = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50'
};

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  const copyDetails = async () => {
    if (toast.metadata?.details) {
      try {
        const details = JSON.stringify(toast.metadata.details, null, 2);
        await navigator.clipboard.writeText(details);
      } catch (err) {
        console.error('Failed to copy details:', err);
      }
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card
      className={cn(
        "toast-item relative overflow-hidden transition-all duration-300 ease-in-out shadow-lg",
        toastColors[toast.type],
        isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isExiting && "translate-x-full opacity-0"
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {toastIcons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{toast.title}</h4>
              {toast.metadata && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(toast.metadata.timestamp)}
                  </span>
                  {toast.metadata.stepId && (
                    <Badge variant="outline" className="text-xs">
                      Step: {toast.metadata.stepId}
                    </Badge>
                  )}
                  {toast.metadata.agentId && (
                    <Badge variant="outline" className="text-xs">
                      {toast.metadata.agentId}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-black/5"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Message */}
        <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
          {toast.message}
        </p>

        {/* Details Section */}
        {toast.metadata?.details && (
          <details className="mb-3">
            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
              Voir détails techniques
            </summary>
            <div className="mt-2 p-2 bg-white/50 rounded border text-xs font-mono overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                {typeof toast.metadata.details === 'string'
                  ? toast.metadata.details
                  : JSON.stringify(toast.metadata.details, null, 2)}
              </pre>
            </div>
          </details>
        )}

        {/* Actions */}
        {(toast.actions?.length || toast.metadata?.retryable || toast.metadata?.details) && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Custom Actions */}
            {toast.actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.action}
                className="h-7 px-2 text-xs"
              >
                {action.label}
              </Button>
            ))}

            {/* Retry Action */}
            {toast.metadata?.retryable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // This would trigger retry logic
                  console.log('Retry action triggered for:', toast.metadata?.stepId);
                }}
                className="h-7 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Réessayer
              </Button>
            )}

            {/* Copy Details */}
            {toast.metadata?.details && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyDetails}
                className="h-7 px-2 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copier
              </Button>
            )}
          </div>
        )}

        {/* Progress bar for timed toasts */}
        {!toast.persistent && toast.duration && toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-1 bg-black/10">
              <div
                className={cn(
                  "h-full transition-all ease-linear",
                  toast.type === 'success' && "bg-green-500",
                  toast.type === 'error' && "bg-red-500",
                  toast.type === 'warning' && "bg-yellow-500",
                  toast.type === 'info' && "bg-blue-500"
                )}
                style={{
                  width: '100%',
                  animation: `shrink ${toast.duration}ms linear`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </Card>
  );
}

// Utility hook for common toast patterns
export function useWorkflowToasts() {
  const { addToast } = useToast();

  const showSuccess = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: 3000,
      ...options
    });
  };

  const showError = (title: string, message: string, options?: {
    stepId?: string;
    agentId?: string;
    retryable?: boolean;
    details?: any;
    onRetry?: () => void;
  }) => {
    const actions: ToastAction[] = [];

    if (options?.onRetry) {
      actions.push({
        label: 'Réessayer',
        action: options.onRetry,
        variant: 'outline'
      });
    }

    return addToast({
      type: 'error',
      title,
      message,
      persistent: true,
      actions,
      metadata: {
        stepId: options?.stepId,
        agentId: options?.agentId,
        retryable: options?.retryable ?? true,
        details: options?.details,
        timestamp: new Date()
      }
    });
  };

  const showWarning = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 4000,
      ...options
    });
  };

  const showInfo = (title: string, message: string, options?: Partial<ToastMessage>) => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    });
  };

  const showStepComplete = (stepName: string, stepId: string, duration: number) => {
    return showSuccess(
      'Étape terminée',
      `${stepName} complétée en ${duration}ms`,
      { metadata: { stepId, timestamp: new Date() } }
    );
  };

  const showStepError = (stepName: string, stepId: string, error: string, onRetry?: () => void) => {
    return showError(
      `Erreur - ${stepName}`,
      error,
      { stepId, retryable: true, onRetry }
    );
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showStepComplete,
    showStepError
  };
}

export default ToastItem;