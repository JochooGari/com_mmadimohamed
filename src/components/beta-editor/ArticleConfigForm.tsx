/**
 * Formulaire de configuration d'article (Section 3.2 du PRD)
 * 4 champs obligatoires + champs optionnels pour mode Pro
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import type { ArticleConfig } from '../../stores/scoring-store';

interface ArticleConfigFormProps {
  initialConfig?: ArticleConfig;
  onSubmit: (config: ArticleConfig) => void;
  onCancel: () => void;
}

export function ArticleConfigForm({
  initialConfig,
  onSubmit,
  onCancel
}: ArticleConfigFormProps) {
  const [config, setConfig] = useState<ArticleConfig>(
    initialConfig || {
      primaryKeyword: '',
      articleType: 'guide',
      searchIntent: 'informational',
      targetLength: 2500,
      secondaryKeywords: [],
      competitorUrls: [],
      internalLinksPool: []
    }
  );

  const [showAdvanced, setShowAdvanced] = useState(!!initialConfig);
  const [newSecondaryKeyword, setNewSecondaryKeyword] = useState('');
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [newInternalLink, setNewInternalLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!config.primaryKeyword.trim()) {
      alert('Le mot-clé principal est obligatoire');
      return;
    }

    onSubmit(config);
  };

  const addSecondaryKeyword = () => {
    if (newSecondaryKeyword.trim()) {
      setConfig({
        ...config,
        secondaryKeywords: [...(config.secondaryKeywords || []), newSecondaryKeyword.trim()]
      });
      setNewSecondaryKeyword('');
    }
  };

  const removeSecondaryKeyword = (index: number) => {
    setConfig({
      ...config,
      secondaryKeywords: config.secondaryKeywords?.filter((_, i) => i !== index)
    });
  };

  const addCompetitorUrl = () => {
    if (newCompetitorUrl.trim()) {
      setConfig({
        ...config,
        competitorUrls: [...(config.competitorUrls || []), newCompetitorUrl.trim()]
      });
      setNewCompetitorUrl('');
    }
  };

  const removeCompetitorUrl = (index: number) => {
    setConfig({
      ...config,
      competitorUrls: config.competitorUrls?.filter((_, i) => i !== index)
    });
  };

  const addInternalLink = () => {
    if (newInternalLink.trim()) {
      setConfig({
        ...config,
        internalLinksPool: [...(config.internalLinksPool || []), newInternalLink.trim()]
      });
      setNewInternalLink('');
    }
  };

  const removeInternalLink = (index: number) => {
    setConfig({
      ...config,
      internalLinksPool: config.internalLinksPool?.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Configuration de l'article</h2>
          <p className="text-sm text-gray-600">
            Définissez les paramètres SEO/GEO pour votre article
          </p>
        </div>

        {/* Champs obligatoires */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Champs obligatoires</h3>

          {/* Mot-clé principal */}
          <div>
            <Label htmlFor="primaryKeyword">
              Mot-clé principal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="primaryKeyword"
              value={config.primaryKeyword}
              onChange={(e) => setConfig({ ...config, primaryKeyword: e.target.value })}
              placeholder="ex: Power BI pour la finance"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Le mot-clé principal ciblé par votre article
            </p>
          </div>

          {/* Type d'article */}
          <div>
            <Label htmlFor="articleType">
              Type d'article <span className="text-red-500">*</span>
            </Label>
            <Select
              value={config.articleType}
              onValueChange={(value: any) => setConfig({ ...config, articleType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="comparatif">Comparatif</SelectItem>
                <SelectItem value="tutoriel">Tutoriel</SelectItem>
                <SelectItem value="actualite">Actualité</SelectItem>
                <SelectItem value="liste">Liste</SelectItem>
                <SelectItem value="etude-cas">Étude de cas</SelectItem>
                <SelectItem value="faq">FAQ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Intention de recherche */}
          <div>
            <Label htmlFor="searchIntent">
              Intention de recherche <span className="text-red-500">*</span>
            </Label>
            <Select
              value={config.searchIntent}
              onValueChange={(value: any) => setConfig({ ...config, searchIntent: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informational">Informationnel</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="transactional">Transactionnel</SelectItem>
                <SelectItem value="navigational">Navigationnel</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              L'intention derrière la recherche de votre mot-clé
            </p>
          </div>

          {/* Longueur cible */}
          <div>
            <Label htmlFor="targetLength">
              Longueur cible (mots) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="targetLength"
              type="number"
              value={config.targetLength}
              onChange={(e) =>
                setConfig({ ...config, targetLength: parseInt(e.target.value) || 2500 })
              }
              min={500}
              max={10000}
              step={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommandé : 2000-3000 mots pour un guide complet
            </p>
          </div>
        </div>

        {/* Champs optionnels */}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-4"
          >
            {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700">Options avancées</h3>

              {/* Mots-clés secondaires */}
              <div>
                <Label>Mots-clés secondaires</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSecondaryKeyword}
                    onChange={(e) => setNewSecondaryKeyword(e.target.value)}
                    placeholder="Ajouter un mot-clé"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSecondaryKeyword();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addSecondaryKeyword}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.secondaryKeywords?.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSecondaryKeyword(idx)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Persona cible */}
              <div>
                <Label htmlFor="targetPersona">Persona cible</Label>
                <Input
                  id="targetPersona"
                  value={config.targetPersona || ''}
                  onChange={(e) => setConfig({ ...config, targetPersona: e.target.value })}
                  placeholder="ex: Directeur financier PME"
                />
              </div>

              {/* URLs concurrents */}
              <div>
                <Label>URLs concurrents</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCompetitorUrl}
                    onChange={(e) => setNewCompetitorUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompetitorUrl();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addCompetitorUrl}>
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-1">
                  {config.competitorUrls?.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex-1 truncate"
                      >
                        {url}
                      </a>
                      <X
                        className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => removeCompetitorUrl(idx)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pool de liens internes */}
              <div>
                <Label>Pool de liens internes</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newInternalLink}
                    onChange={(e) => setNewInternalLink(e.target.value)}
                    placeholder="/blog/article-connexe"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInternalLink();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addInternalLink}>
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-1">
                  {config.internalLinksPool?.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{link}</span>
                      <X
                        className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => removeInternalLink(idx)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Objectif CTA */}
              <div>
                <Label htmlFor="ctaObjective">Objectif CTA</Label>
                <Select
                  value={config.ctaObjective}
                  onValueChange={(value: any) => setConfig({ ...config, ctaObjective: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="demo">Demande de démo</SelectItem>
                    <SelectItem value="download">Téléchargement</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tonalité */}
              <div>
                <Label htmlFor="brandTone">Tonalité de marque</Label>
                <Select
                  value={config.brandTone}
                  onValueChange={(value: any) => setConfig({ ...config, brandTone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une tonalité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formel</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="conversational">Conversationnel</SelectItem>
                    <SelectItem value="pedagogical">Pédagogique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" className="flex-1">
            {initialConfig ? 'Mettre à jour' : 'Créer l\'article'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
