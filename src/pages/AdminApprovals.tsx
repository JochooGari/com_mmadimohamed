import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';

type ApprovalItem = {
  id: string;
  type: 'article' | 'resource' | 'agent' | 'workflow';
  title: string;
  author: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  content?: string;
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

const SAMPLE_APPROVALS: ApprovalItem[] = [
  {
    id: '1',
    type: 'article',
    title: 'Guide complet Power BI pour la finance',
    author: 'AI Ghostwriter',
    submittedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    content: 'Article généré automatiquement sur les meilleures pratiques Power BI...'
  },
  {
    id: '2',
    type: 'resource',
    title: 'Template Dashboard E-commerce',
    author: 'Content Strategist',
    submittedAt: '2024-01-14T16:45:00Z',
    status: 'approved',
    reviewedBy: 'Admin',
    reviewedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '3',
    type: 'agent',
    title: 'Marketing Automation Agent',
    author: 'Data Analyst',
    submittedAt: '2024-01-13T14:20:00Z',
    status: 'rejected',
    reason: 'Configuration insuffisante des paramètres de sécurité',
    reviewedBy: 'Admin',
    reviewedAt: '2024-01-14T11:30:00Z'
  },
  {
    id: '4',
    type: 'workflow',
    title: 'Workflow SEO + Social Media',
    author: 'SEO Optimizer',
    submittedAt: '2024-01-12T11:15:00Z',
    status: 'pending',
    content: 'Workflow automatisé pour optimisation SEO et publication social media...'
  }
];

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => {
    try {
      const saved = localStorage.getItem('admin:approvals');
      return saved ? JSON.parse(saved) : SAMPLE_APPROVALS;
    } catch {
      return SAMPLE_APPROVALS;
    }
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('admin:approvals', JSON.stringify(approvals));
    } catch {}
  }, [approvals]);

  const filteredApprovals = approvals.filter(item => 
    filter === 'all' || item.status === filter
  );

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: 'approved' as const,
            reviewedBy: 'Admin',
            reviewedAt: new Date().toISOString()
          }
        : item
    ));
  };

  const handleReject = (id: string, reason: string = 'Non conforme aux standards') => {
    setApprovals(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            status: 'rejected' as const,
            reason,
            reviewedBy: 'Admin',
            reviewedAt: new Date().toISOString()
          }
        : item
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'resource':
        return <FileText className="w-4 h-4" />;
      case 'agent':
        return <User className="w-4 h-4" />;
      case 'workflow':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = approvals.filter(item => item.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approbations</h1>
          <p className="text-gray-600 mt-1">
            Gérez les demandes d'approbation pour le contenu généré par IA
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              {pendingCount} en attente
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {approvals.filter(item => item.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvals.filter(item => item.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejetées</p>
                <p className="text-2xl font-bold text-red-600">
                  {approvals.filter(item => item.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status as any)}
            className={filter === status ? 'bg-teal-500 hover:bg-teal-600' : ''}
          >
            {status === 'all' ? 'Tous' : 
             status === 'pending' ? 'En attente' :
             status === 'approved' ? 'Approuvées' : 'Rejetées'}
          </Button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredApprovals.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(item.type)}
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {item.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      par {item.author}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <Badge className={getStatusColor(item.status)}>
                    {item.status === 'pending' ? 'En attente' :
                     item.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(item.submittedAt)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              </div>

              {item.content && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.content}
                </p>
              )}

              {item.reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Raison du rejet :</strong> {item.reason}
                  </p>
                  {item.reviewedBy && item.reviewedAt && (
                    <p className="text-xs text-red-600 mt-1">
                      Rejeté par {item.reviewedBy} le {formatDate(item.reviewedAt)}
                    </p>
                  )}
                </div>
              )}

              {item.status === 'approved' && item.reviewedBy && item.reviewedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Approuvé par {item.reviewedBy} le {formatDate(item.reviewedAt)}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="flex-1"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Voir
                </Button>

                {item.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejeter
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredApprovals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune demande d'approbation
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Aucune demande d\'approbation pour le moment.'
                : `Aucune demande avec le statut "${filter}".`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                  <p className="text-gray-600">par {selectedItem.author}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Fermer
                </Button>
              </div>

              {selectedItem.content && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Contenu :</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedItem.content}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type :</strong> {selectedItem.type}
                </div>
                <div>
                  <strong>Soumis le :</strong> {formatDate(selectedItem.submittedAt)}
                </div>
                <div>
                  <strong>Statut :</strong>
                  <Badge className={`ml-2 ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status === 'pending' ? 'En attente' :
                     selectedItem.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                  </Badge>
                </div>
                {selectedItem.reviewedBy && (
                  <div>
                    <strong>Révisé par :</strong> {selectedItem.reviewedBy}
                  </div>
                )}
              </div>

              {selectedItem.status === 'pending' && (
                <div className="flex space-x-2 mt-6">
                  <Button
                    onClick={() => {
                      handleApprove(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedItem.id);
                      setSelectedItem(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}