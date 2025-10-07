"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, Download, Star, ExternalLink, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PowerBIDashboard,
  getTopicColor,
  getTopicLabel,
  getTopicIcon,
  getComplexityLabel,
  getComplexityColor,
} from "@/types/powerbi-dashboard";

export interface DashboardCardProps {
  dashboard: PowerBIDashboard;
  onViewDetails?: (dashboard: PowerBIDashboard) => void;
  onDownload?: (dashboard: PowerBIDashboard) => void;
  className?: string;
}

export function DashboardCard({
  dashboard,
  onViewDetails,
  onDownload,
  className,
}: DashboardCardProps) {
  const topicColor = getTopicColor(dashboard.topic);
  const topicLabel = getTopicLabel(dashboard.topic);
  const topicIcon = getTopicIcon(dashboard.topic);
  const complexityLabel = getComplexityLabel(dashboard.complexity);
  const complexityColor = getComplexityColor(dashboard.complexity);

  const handleCardClick = () => {
    onViewDetails?.(dashboard);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(dashboard);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card
        className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 shadow-md overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {dashboard.thumbnail_url ? (
            <img
              src={dashboard.thumbnail_url}
              alt={dashboard.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {topicIcon}
            </div>
          )}
          {/* Topic Badge Overlay */}
          <div className="absolute top-3 left-3">
            <Badge
              style={{ backgroundColor: topicColor }}
              className="text-white border-0 shadow-md"
            >
              {topicLabel}
            </Badge>
          </div>
          {/* Featured Badge */}
          {dashboard.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 text-white border-0 shadow-md">
                ⭐ Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 flex-1">
              {dashboard.title}
            </CardTitle>
          </div>

          {/* Complexity & Persona */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              style={{ borderColor: complexityColor, color: complexityColor }}
              className="text-xs"
            >
              {complexityLabel}
            </Badge>
            {dashboard.personas.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                👤 {dashboard.personas[0]}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2">
            {dashboard.description}
          </p>

          {/* Sub-topics Tags */}
          {dashboard.sub_topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dashboard.sub_topics.slice(0, 3).map((subTopic) => (
                <Badge
                  key={subTopic}
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {subTopic}
                </Badge>
              ))}
              {dashboard.sub_topics.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-600"
                >
                  +{dashboard.sub_topics.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{dashboard.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{dashboard.downloads.toLocaleString()}</span>
              </div>
              {dashboard.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {dashboard.rating.toFixed(1)} ({dashboard.rating_count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleCardClick}
            >
              Voir plus
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            {(dashboard.pbix_file_url || dashboard.pbit_file_url) && (
              <Button
                variant="outline"
                size="sm"
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
                onClick={handleDownloadClick}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
