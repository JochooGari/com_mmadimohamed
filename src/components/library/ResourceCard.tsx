import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio } from '../ui/aspect-ratio';

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  downloads?: number;
  thumb_url?: string;
}

export default function ResourceCard({ item }: { item: ResourceItem }) {
  const imageUrl = item.thumb_url || `https://picsum.photos/seed/${encodeURIComponent(item.slug || item.id)}/800/450`;
  const isPharma = (item.title || '').toLowerCase().includes('pharma');
  const path = isPharma ? '/resource/templates-dashboard-phrama' : `/resource/${item.slug}`;
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <Link to={path}>
        <AspectRatio ratio={16/9} className="bg-slate-100">
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </AspectRatio>
      </Link>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {item.category && <Badge variant="secondary" className="bg-slate-100 text-slate-700">{item.category}</Badge>}
          <div className="flex gap-2">
            {item.tags?.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline">#{t}</Badge>
            ))}
          </div>
        </div>
        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
          <Link to={path}>{item.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {item.excerpt && (<CardDescription className="text-slate-600 mb-4">{item.excerpt}</CardDescription>)}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{item.downloads ?? 0} téléchargements</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0">
            <Link to={path}> Voir plus</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


