"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FiltersSidebar } from "./FiltersSidebar";
import { DashboardCard } from "./DashboardCard";
import { PowerBIDashboard, DashboardFilters } from "@/types/powerbi-dashboard";

export interface PowerBILibraryProps {
  dashboards: PowerBIDashboard[];
  className?: string;
}

export function PowerBILibrary({ dashboards, className }: PowerBILibraryProps) {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter and sort dashboards
  const filteredDashboards = useMemo(() => {
    let result = [...dashboards];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower) ||
          d.sub_topics.some((st) => st.toLowerCase().includes(searchLower))
      );
    }

    // Topics
    if (filters.topics && filters.topics.length > 0) {
      result = result.filter((d) => filters.topics!.includes(d.topic));
    }

    // Personas
    if (filters.personas && filters.personas.length > 0) {
      result = result.filter((d) =>
        d.personas.some((p) => filters.personas!.includes(p))
      );
    }

    // Sub-topics
    if (filters.sub_topics && filters.sub_topics.length > 0) {
      result = result.filter((d) =>
        d.sub_topics.some((st) => filters.sub_topics!.includes(st))
      );
    }

    // Complexity
    if (filters.complexity && filters.complexity.length > 0) {
      result = result.filter((d) => filters.complexity!.includes(d.complexity));
    }

    // Visualization Types
    if (filters.visualization_types && filters.visualization_types.length > 0) {
      result = result.filter((d) =>
        d.visualization_types.some((vt) =>
          filters.visualization_types!.includes(vt)
        )
      );
    }

    // Date Added
    if (filters.date_added) {
      const now = new Date();
      const cutoffDate = new Date();
      if (filters.date_added === "week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filters.date_added === "month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (filters.date_added === "quarter") {
        cutoffDate.setMonth(now.getMonth() - 3);
      }
      result = result.filter(
        (d) => new Date(d.created_at) >= cutoffDate
      );
    }

    // Sort
    const effectiveSortBy = filters.sort_by || sortBy;
    switch (effectiveSortBy) {
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "popular":
      case "downloads":
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [dashboards, filters, sortBy]);

  const handleViewDetails = (dashboard: PowerBIDashboard) => {
    // Navigate to detail page (to be implemented with router)
    console.log("View details:", dashboard.slug);
    // TODO: router.push(`/bibliotheque/${dashboard.slug}`);
  };

  const handleDownload = (dashboard: PowerBIDashboard) => {
    // Handle download logic
    console.log("Download:", dashboard.slug);
    // TODO: Track download and provide file
  };

  return (
    <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 py-12", className)}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FiltersSidebar
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredDashboards.length}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <FiltersSidebar
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      setFilters(newFilters);
                      setIsMobileFilterOpen(false);
                    }}
                    resultCount={filteredDashboards.length}
                    className="pt-6"
                  />
                </SheetContent>
              </Sheet>

              {/* Result Count */}
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-teal-600">
                  {filteredDashboards.length}
                </span>{" "}
                {filteredDashboards.length > 1
                  ? "ressources trouvées"
                  : "ressource trouvée"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "grid" && "bg-slate-100"
                  )}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "list" && "bg-slate-100"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Trier par..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="downloads">Plus téléchargés</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dashboards Grid/List */}
          <AnimatePresence mode="wait">
            {filteredDashboards.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Aucune ressource trouvée
                </h3>
                <p className="text-slate-600 mb-6">
                  Essayez d'ajuster vos filtres ou votre recherche
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {filteredDashboards.map((dashboard, index) => (
                  <DashboardCard
                    key={dashboard.id}
                    dashboard={dashboard}
                    onViewDetails={handleViewDetails}
                    onDownload={handleDownload}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More / Pagination (TODO) */}
          {filteredDashboards.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500">
                Affichage de {filteredDashboards.length} ressource
                {filteredDashboards.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
