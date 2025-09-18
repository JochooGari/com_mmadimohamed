import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Eye, Save, Share } from 'lucide-react';

export function ArticleGenerator() {
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    resume: '',
    content: ''
  });

  const [seoScore] = useState({
    overall: 40,
    title: 0,
    metaDesc: 0,
    metaKeywords: 0,
    wordCount: 0
  });

  const existingArticles = [
    {
      title: "Les 5 erreurs à éviter dans votre stratégie data",
      slug: "5-erreurs-a-eviter-dans-votre-strategie-data",
      status: "Publié"
    },
    {
      title: "Power BI vs Tableau : Quel outil choisir en 2024 ?",
      slug: "power-bi-vs-tableau-quel-outil-choisir-en-2024",
      status: "Brouillon"
    },
    {
      title: "Comment optimiser les performances de votre base de données",
      slug: "comment-optimiser-les-performances-base-donnees",
      status: "En révision"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setArticleForm(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Publié': return 'bg-green-100 text-green-800';
      case 'Brouillon': return 'bg-yellow-100 text-yellow-800';
      case 'En révision': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Générateur d'articles IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Input 
              placeholder="Sujet pour générer un brouillon (ex: Reporting Power BI Finance)"
              className="flex-1"
            />
            <Button className="bg-teal-500 hover:bg-teal-600">
              Générer brouillon IA
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Article Form */}
        <div className="space-y-6">
          {/* Existing Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Articles existants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {existingArticles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{article.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{article.slug}</p>
                    </div>
                    <Badge className={getStatusColor(article.status)}>
                      {article.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Article Form */}
          <Card>
            <CardHeader>
              <CardTitle>Nouveau Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre</label>
                <Input 
                  value={articleForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Slug</label>
                <Input 
                  value={articleForm.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-de-larticle"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Résumé</label>
                <Textarea 
                  value={articleForm.resume}
                  onChange={(e) => handleInputChange('resume', e.target.value)}
                  placeholder="Résumé de l'article"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Contenu (Markdown)</label>
                <Textarea 
                  value={articleForm.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Contenu de l'article en Markdown"
                  rows={8}
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
                <Button className="bg-teal-500 hover:bg-teal-600">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & SEO Score */}
        <div className="space-y-6">
          {/* Article Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">
                    {articleForm.title || "Titre de l'article"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {articleForm.resume || "Résumé de l'article"}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700">
                    {articleForm.content || "Le contenu de l'article apparaîtra ici..."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Score */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(seoScore.overall)}`}>
                    {seoScore.overall}/100
                  </div>
                  <Progress value={seoScore.overall} className="mt-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Titre: {seoScore.title} caractères</span>
                    <span className="text-sm text-gray-500">— À améliorer</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Meta desc: {seoScore.metaDesc} caractères</span>
                    <span className="text-sm text-gray-500">— À améliorer</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mots-clés trouvés: {seoScore.metaKeywords}</span>
                    <span className="text-sm text-gray-500">— Ajouter 2 mots-clés</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Longueur: {seoScore.wordCount} mots</span>
                    <span className="text-sm text-gray-500">— Court</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    💡 Pour améliorer le score: Ajoutez du contenu descriptif des mots-clés et 
                    la liste pour améliorer la pertinence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GEO Score */}
          <Card>
            <CardHeader>
              <CardTitle>GEO Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">75/100</div>
                  <Progress value={75} className="mt-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pertinence géographique</span>
                    <Badge className="bg-green-100 text-green-800">Bon</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mots-clés locaux</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Références géographiques</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    🌍 Suggestions: Ajoutez plus de références aux villes et régions françaises 
                    pour améliorer le référencement local
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}