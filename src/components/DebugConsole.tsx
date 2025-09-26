 

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Terminal,
  Download,
  Trash2,
  Search,
  Filter,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: any;
  stepId?: string;
  agentId?: string;
}

interface ConsoleOutput {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'system';
  content: string;
  source?: string;
  formatted?: boolean;
}

interface DebugConsoleProps {
  logs: LogEntry[];
  outputs: ConsoleOutput[];
  isConnected: boolean;
  onClear?: () => void;
  onExport?: () => void;
  onRetry?: (stepId: string) => void;
  className?: string;
  maxHeight?: number;
}

const logLevelIcons = {
  debug: <Terminal className="w-4 h-4 text-gray-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />
};

const logLevelColors = {
  debug: 'text-gray-600 bg-gray-50 border-gray-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  success: 'text-green-600 bg-green-50 border-green-200'
};

const typeColors = {
  request: 'text-blue-600 bg-blue-50',
  response: 'text-green-600 bg-green-50',
  error: 'text-red-600 bg-red-50',
  system: 'text-gray-600 bg-gray-50'
};

export function DebugConsole({
  logs = [],
  outputs = [],
  isConnected = false,
  onClear,
  onExport,
  onRetry,
  className,
  maxHeight = 600
}: DebugConsoleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const outputsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(logsEndRef);
  }, [logs]);

  useEffect(() => {
    scrollToBottom(outputsEndRef);
  }, [outputs]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const exportLogs = () => {
    const data = {
      timestamp: new Date().toISOString(),
      logs: filteredLogs,
      outputs: outputs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onExport?.();
  };

  return (
    <Card className={cn("debug-console", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Console de Debug</CardTitle>
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className={cn(
                "text-xs",
                isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}
            >
              {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1">
            <Input
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-8 px-2 border rounded-md text-sm"
          >
            <option value="all">Tous les niveaux</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Logs ({filteredLogs.length})
            </TabsTrigger>
            <TabsTrigger value="output" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Sortie Console ({outputs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="m-0">
            <ScrollArea
              className="border-t"
              style={{ height: isExpanded ? maxHeight * 1.5 : maxHeight }}
            >
              <div className="p-4 space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun log disponible</p>
                    <p className="text-sm">Les messages apparaîtront ici pendant l'exécution</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "log-entry border rounded-lg p-3 transition-all duration-200",
                        logLevelColors[log.level]
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {logLevelIcons[log.level]}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-muted-foreground">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {log.source}
                              </Badge>
                              {log.stepId && (
                                <Badge variant="outline" className="text-xs">
                                  Step: {log.stepId}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {log.message}
                            </p>
                            {log.details && (
                              <details className="mt-2">
                                <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                                  Voir détails
                                </summary>
                                <pre className="mt-1 text-xs bg-white/50 p-2 rounded border overflow-x-auto">
                                  {formatJSON(log.details)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()} ${log.source}: ${log.message}`,
                              log.id
                            )}
                            className="h-6 w-6 p-0"
                          >
                            {copiedId === log.id ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>

                          {log.level === 'error' && log.stepId && onRetry && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRetry(log.stepId!)}
                              className="h-6 px-2 text-xs"
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="output" className="m-0">
            <ScrollArea
              className="border-t"
              style={{ height: isExpanded ? maxHeight * 1.5 : maxHeight }}
            >
              <div className="p-4 space-y-2">
                {outputs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune sortie console</p>
                    <p className="text-sm">Les réponses des agents apparaîtront ici</p>
                  </div>
                ) : (
                  outputs.map((output) => (
                    <div
                      key={output.id}
                      className={cn(
                        "output-entry border rounded-lg p-3",
                        typeColors[output.type]
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {output.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {output.type}
                          </Badge>
                          {output.source && (
                            <Badge variant="outline" className="text-xs">
                              {output.source}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(output.content, output.id)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedId === output.id ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap break-words font-mono bg-white/50 p-2 rounded border">
                        {output.content}
                      </pre>
                    </div>
                  ))
                )}
                <div ref={outputsEndRef} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default DebugConsole;