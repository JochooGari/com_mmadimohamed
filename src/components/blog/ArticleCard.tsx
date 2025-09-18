import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { AspectRatio } from '../ui/aspect-ratio';

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  tags?: string[];
  cover_url?: string;
}

export default function ArticleCard({ item }: { item: ArticleItem }) {
  const imageUrl = item.cover_url || `https://picsum.photos/seed/${encodeURIComponent(item.slug || item.id)}/800/450`;
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <Link to={`/blog/${item.slug}`}>
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
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {item.tags?.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline">#{t}</Badge>
          ))}
        </div>
        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
          <Link to={`/blog/${item.slug}`}>{item.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {item.excerpt && <CardDescription className="text-slate-600">{item.excerpt}</CardDescription>}
      </CardContent>
    </Card>
  );
}


