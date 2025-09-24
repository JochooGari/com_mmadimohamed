import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Server,
  Play,
  Settings,
  Tool,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { mcpService, MCPTool, MCPResource, MCPPrompt } from '@/services/mcpService';

export default function MCPDashboard() {
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [prompts, setPrompts] = useState<MCPPrompt[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [toolResult, setToolResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const connected = await mcpService.testConnection();
      if (connected) {
        setConnectionStatus('connected');
        await loadServerInfo();
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Connection check failed:', error);
    }
  };

  const loadServerInfo = async () => {
    try {
      const [serverData, toolsData, resourcesData, promptsData] = await Promise.all([
        mcpService.getServerInfo(),
        mcpService.getAvailableTools(),
        mcpService.getAvailableResources(),
        mcpService.getAvailablePrompts()
      ]);

      setServerInfo(serverData);
      setTools(toolsData);
      setResources(resourcesData);
      setPrompts(promptsData);
    } catch (error) {
      console.error('Failed to load server info:', error);
    }
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    try {
      setLoading(true);
      const args = JSON.parse(toolArgs);
      const result = await mcpService.executeTool(selectedTool, args);
      setToolResult(result);
    } catch (error) {
      setToolResult({
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const copyServerUrl = () => {
    const url = `${window.location.origin}/api/mcp`;
    navigator.clipboard.writeText(url);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'checking': return 'Checking...';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Server className="w-8 h-8" />
            MCP Server Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Model Context Protocol server for n8n workflows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {getStatusText()}
            </Badge>
          </div>
          <Button onClick={checkConnection} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Alert */}
      {connectionStatus === 'disconnected' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Server Disconnected</AlertTitle>
          <AlertDescription>
            The MCP server is not responding. Make sure the server is running and try refreshing.
          </AlertDescription>
        </Alert>
      )}

      {/* Server Info Card */}
      {serverInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
            <CardDescription>MCP server details and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{serverInfo.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <p className="text-sm text-muted-foreground">{serverInfo.version}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{serverInfo.description}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Server URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={`${window.location.origin}/api/mcp`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={copyServerUrl}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/api/mcp" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Tool className="w-4 h-4" />
            Tools ({tools.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Prompts ({prompts.length})
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Test Tools
          </TabsTrigger>
        </TabsList>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Tools</CardTitle>
              <CardDescription>MCP tools available for execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools.map((tool, index) => (
                  <div key={tool.name} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{tool.name}</h3>
                      <Badge variant="outline">{tool.inputSchema?.type || 'unknown'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                    <div className="text-xs bg-muted p-2 rounded font-mono">
                      Required: {tool.inputSchema?.required?.join(', ') || 'none'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Resources</CardTitle>
              <CardDescription>MCP resources and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div key={resource.uri} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{resource.name}</h3>
                      <Badge variant="outline">{resource.mimeType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <div className="text-xs text-muted-foreground font-mono">
                      URI: {resource.uri}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Prompts</CardTitle>
              <CardDescription>Predefined prompts for common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prompts.map((prompt, index) => (
                  <div key={prompt.name} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{prompt.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Arguments:</Label>
                      {prompt.arguments.map(arg => (
                        <div key={arg.name} className="text-xs bg-muted p-2 rounded">
                          <span className="font-medium">{arg.name}</span>
                          {arg.required && <span className="text-red-500 ml-1">*</span>}
                          <span className="text-muted-foreground ml-2">- {arg.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tools Tab */}
        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool Execution */}
            <Card>
              <CardHeader>
                <CardTitle>Execute Tool</CardTitle>
                <CardDescription>Test MCP tools with custom parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tool-select">Select Tool</Label>
                  <select
                    id="tool-select"
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a tool...</option>
                    {tools.map(tool => (
                      <option key={tool.name} value={tool.name}>
                        {tool.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="tool-args">Arguments (JSON)</Label>
                  <Textarea
                    id="tool-args"
                    value={toolArgs}
                    onChange={(e) => setToolArgs(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                    placeholder='{"siteUrl": "https://example.com"}'
                  />
                </div>

                <Button
                  onClick={executeTool}
                  disabled={!selectedTool || loading}
                  className="w-full"
                >
                  {loading ? 'Executing...' : 'Execute Tool'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Result</CardTitle>
                <CardDescription>Output from the executed tool</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {toolResult ? (
                    <div className="space-y-2">
                      {toolResult.content?.map((item: any, index: number) => (
                        <div key={index} className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-wrap">
                          {item.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      No results yet. Execute a tool to see output.
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}