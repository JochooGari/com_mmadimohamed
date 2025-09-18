import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Eye, 
  X, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { LocalStorage, FileManager } from '@/lib/storage';
import { ContentSource } from '@/lib/types';

interface FileUploaderProps {
  agentType: 'linkedin' | 'geo';
  onFilesChange?: (sources: ContentSource[]) => void;
}

export default function FileUploader({ agentType, onFilesChange }: FileUploaderProps) {
  const [sources, setSources] = useState<ContentSource[]>(() => 
    LocalStorage.getContentSources(agentType)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true);
    const newSources: ContentSource[] = [];

    for (const file of Array.from(files)) {
      try {
        // Simulation du traitement
        const processedSource = await FileManager.processFile(file);
        newSources.push(processedSource);
      } catch (error) {
        console.error('Erreur traitement fichier:', error);
        const errorSource: ContentSource = {
          id: Date.now().toString(),
          name: file.name,
          type: 'document',
          status: 'error',
          tags: ['error'],
          lastUpdated: new Date().toISOString()
        };
        newSources.push(errorSource);
      }
    }

    const updatedSources = [...sources, ...newSources];
    setSources(updatedSources);
    LocalStorage.saveContentSources(agentType, updatedSources);
    onFilesChange?.(updatedSources);
    setIsProcessing(false);
  };

  const removeSource = (sourceId: string) => {
    const updatedSources = sources.filter(s => s.id !== sourceId);
    setSources(updatedSources);
    LocalStorage.saveContentSources(agentType, updatedSources);
    onFilesChange?.(updatedSources);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const exportSources = () => {
    LocalStorage.exportData(agentType);
  };

  const getStatusIcon = (status: ContentSource['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: ContentSource['status']) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'error':
        return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Sources de contenu ({agentType.toUpperCase()})
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportSources}>
              <Download className="h-4 w-4" />
            </Button>
            <Badge variant="outline">
              {sources.length} fichier{sources.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Documents, transcripts et contenus pour alimenter l'agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone d'upload */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id={`file-upload-${agentType}`}
            disabled={isProcessing}
          />
          <label htmlFor={`file-upload-${agentType}`} className="cursor-pointer">
            <Upload className={`h-12 w-12 mx-auto mb-2 ${isProcessing ? 'animate-pulse' : ''} text-gray-400`} />
            <p className="text-sm text-gray-600">
              {isProcessing ? 'Traitement en cours...' : 'Glissez vos fichiers ici ou cliquez pour sélectionner'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, TXT, MD - Max 10MB par fichier
            </p>
          </label>
        </div>

        {/* Liste des fichiers */}
        {sources.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Fichiers uploadés</h3>
            {sources.map(source => (
              <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{source.name}</span>
                    {getStatusIcon(source.status)}
                    <Badge variant={getStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                  </div>
                  
                  {source.tags && source.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {source.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {source.extractedData && (
                    <div className="text-xs text-gray-500 mt-1">
                      {source.extractedData.wordCount} mots • 
                      {source.extractedData.language.toUpperCase()} • 
                      {new Date(source.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {source.status === 'ready' && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      // TODO: Afficher le contenu dans un modal
                      console.log('Contenu:', source.content);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeSource(source.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        {sources.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {sources.filter(s => s.status === 'ready').length}
              </div>
              <div className="text-xs text-gray-500">Prêts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {sources.filter(s => s.status === 'processing').length}
              </div>
              <div className="text-xs text-gray-500">Traitement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {sources.reduce((sum, s) => sum + (s.extractedData?.wordCount || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Mots total</div>
            </div>
          </div>
        )}

        {/* Instructions selon le type d'agent */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <strong>💡 Conseils pour {agentType === 'linkedin' ? 'LinkedIn' : 'GEO'} :</strong>
          {agentType === 'linkedin' ? (
            <ul className="mt-1 space-y-1">
              <li>• Ajoutez vos meilleurs posts performants</li>
              <li>• Incluez des transcripts de webinars/podcasts</li>
              <li>• Documents avec retours clients et témoignages</li>
            </ul>
          ) : (
            <ul className="mt-1 space-y-1">
              <li>• Uploadez vos études et rapports internes</li>
              <li>• Transcripts avec questions fréquentes clients</li>
              <li>• Documents avec données chiffrées vérifiables</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}