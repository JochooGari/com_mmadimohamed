"use client";

import * as React from "react";
import { useState } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DashboardFilters,
  DashboardTopic,
  DashboardComplexity,
  TOPICS,
  VISUALIZATION_TYPES,
} from "@/types/powerbi-dashboard";

export interface FiltersSidebarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  resultCount: number;
  className?: string;
}

export function FiltersSidebar({
  filters,
  onFiltersChange,
  resultCount,
  className,
}: FiltersSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>([
    "topic",
    "persona",
    "complexity",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleTopicToggle = (topic: DashboardTopic) => {
    const currentTopics = filters.topics || [];
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter((t) => t !== topic)
      : [...currentTopics, topic];
    onFiltersChange({
      ...filters,
      topics: newTopics.length > 0 ? newTopics : undefined,
    });
  };

  const handlePersonaToggle = (persona: string) => {
    const currentPersonas = filters.personas || [];
    const newPersonas = currentPersonas.includes(persona)
      ? currentPersonas.filter((p) => p !== persona)
      : [...currentPersonas, persona];
    onFiltersChange({
      ...filters,
      personas: newPersonas.length > 0 ? newPersonas : undefined,
    });
  };

  const handleSubTopicToggle = (subTopic: string) => {
    const currentSubTopics = filters.sub_topics || [];
    const newSubTopics = currentSubTopics.includes(subTopic)
      ? currentSubTopics.filter((st) => st !== subTopic)
      : [...currentSubTopics, subTopic];
    onFiltersChange({
      ...filters,
      sub_topics: newSubTopics.length > 0 ? newSubTopics : undefined,
    });
  };

  const handleComplexityToggle = (complexity: DashboardComplexity) => {
    const currentComplexity = filters.complexity || [];
    const newComplexity = currentComplexity.includes(complexity)
      ? currentComplexity.filter((c) => c !== complexity)
      : [...currentComplexity, complexity];
    onFiltersChange({
      ...filters,
      complexity: newComplexity.length > 0 ? newComplexity : undefined,
    });
  };

  const handleVizTypeToggle = (vizType: string) => {
    const currentVizTypes = filters.visualization_types || [];
    const newVizTypes = currentVizTypes.includes(vizType)
      ? currentVizTypes.filter((vt) => vt !== vizType)
      : [...currentVizTypes, vizType];
    onFiltersChange({
      ...filters,
      visualization_types: newVizTypes.length > 0 ? newVizTypes : undefined,
    });
  };

  const handleDateAddedChange = (value: "week" | "month" | "quarter") => {
    onFiltersChange({
      ...filters,
      date_added: filters.date_added === value ? undefined : value,
    });
  };

  const handlePopularityChange = (value: "downloads" | "rating") => {
    onFiltersChange({
      ...filters,
      sort_by: filters.sort_by === value ? undefined : value,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.search ||
    (filters.topics && filters.topics.length > 0) ||
    (filters.personas && filters.personas.length > 0) ||
    (filters.sub_topics && filters.sub_topics.length > 0) ||
    (filters.complexity && filters.complexity.length > 0) ||
    (filters.visualization_types && filters.visualization_types.length > 0) ||
    filters.date_added ||
    filters.sort_by;

  // Get available sub-topics based on selected topics
  const availableSubTopics = filters.topics && filters.topics.length > 0
    ? TOPICS.filter((t) => filters.topics!.includes(t.id)).flatMap((t) => t.sub_topics)
    : [];

  // Get all unique personas from selected topics or all topics
  const availablePersonas = filters.topics && filters.topics.length > 0
    ? [...new Set(TOPICS.filter((t) => filters.topics!.includes(t.id)).flatMap((t) => t.personas))]
    : [...new Set(TOPICS.flatMap((t) => t.personas))];

  return (
    <div className={className}>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Filtres</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-teal-600 hover:text-teal-700"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Result count */}
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-teal-600">{resultCount}</span>{" "}
            {resultCount > 1 ? "ressources trouvées" : "ressource trouvée"}
          </div>

          <Separator />

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              🔍 Recherche
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Rechercher..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          {/* Topics */}
          <Collapsible open={openSections.includes("topic")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("topic")}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-sm font-medium cursor-pointer">
                📁 TOPIC
              </Label>
              {openSections.includes("topic") ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {TOPICS.map((topic) => {
                const isChecked = filters.topics?.includes(topic.id) || false;
                return (
                  <div key={topic.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`topic-${topic.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleTopicToggle(topic.id)}
                    />
                    <label
                      htmlFor={`topic-${topic.id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <span className="text-sm">{topic.icon}</span>
                      <span className="text-sm text-slate-700">
                        {topic.label}
                      </span>
                    </label>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Personas */}
          <Collapsible open={openSections.includes("persona")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("persona")}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-sm font-medium cursor-pointer">
                👤 PERSONA
              </Label>
              {openSections.includes("persona") ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {availablePersonas.map((persona) => {
                const isChecked = filters.personas?.includes(persona) || false;
                return (
                  <div key={persona} className="flex items-center space-x-2">
                    <Checkbox
                      id={`persona-${persona}`}
                      checked={isChecked}
                      onCheckedChange={() => handlePersonaToggle(persona)}
                    />
                    <label
                      htmlFor={`persona-${persona}`}
                      className="text-sm text-slate-700 cursor-pointer flex-1"
                    >
                      {persona}
                    </label>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Sub-topics (dynamique) */}
          {availableSubTopics.length > 0 && (
            <>
              <Collapsible open={openSections.includes("subtopic")}>
                <CollapsibleTrigger
                  onClick={() => toggleSection("subtopic")}
                  className="flex items-center justify-between w-full"
                >
                  <Label className="text-sm font-medium cursor-pointer">
                    🏷️ SOUS-TOPIC
                  </Label>
                  {openSections.includes("subtopic") ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {availableSubTopics.map((subTopic) => {
                    const isChecked =
                      filters.sub_topics?.includes(subTopic.id) || false;
                    return (
                      <div key={subTopic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subtopic-${subTopic.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleSubTopicToggle(subTopic.id)}
                        />
                        <label
                          htmlFor={`subtopic-${subTopic.id}`}
                          className="text-sm text-slate-700 cursor-pointer flex-1"
                        >
                          {subTopic.label}
                        </label>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
              <Separator />
            </>
          )}

          {/* Complexity */}
          <Collapsible open={openSections.includes("complexity")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("complexity")}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-sm font-medium cursor-pointer">
                ⚙️ COMPLEXITÉ
              </Label>
              {openSections.includes("complexity") ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {(["debutant", "intermediaire", "avance"] as DashboardComplexity[]).map(
                (complexity) => {
                  const isChecked =
                    filters.complexity?.includes(complexity) || false;
                  const labels = {
                    debutant: "Débutant",
                    intermediaire: "Intermédiaire",
                    avance: "Avancé",
                  };
                  return (
                    <div key={complexity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`complexity-${complexity}`}
                        checked={isChecked}
                        onCheckedChange={() => handleComplexityToggle(complexity)}
                      />
                      <label
                        htmlFor={`complexity-${complexity}`}
                        className="text-sm text-slate-700 cursor-pointer flex-1"
                      >
                        {labels[complexity]}
                      </label>
                    </div>
                  );
                }
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Visualization Types */}
          <Collapsible open={openSections.includes("viztype")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("viztype")}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-sm font-medium cursor-pointer">
                📊 TYPE DE VISUALISATION
              </Label>
              {openSections.includes("viztype") ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {VISUALIZATION_TYPES.map((vizType) => {
                const isChecked =
                  filters.visualization_types?.includes(vizType.id) || false;
                return (
                  <div key={vizType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`viztype-${vizType.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleVizTypeToggle(vizType.id)}
                    />
                    <label
                      htmlFor={`viztype-${vizType.id}`}
                      className="text-sm text-slate-700 cursor-pointer flex-1"
                    >
                      {vizType.label}
                    </label>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Date Added */}
          <Collapsible open={openSections.includes("date")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("date")}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-sm font-medium cursor-pointer">
                📅 DATE D'AJOUT
              </Label>
              {openSections.includes("date") ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {[
                { value: "week" as const, label: "Dernière semaine" },
                { value: "month" as const, label: "Dernier mois" },
                { value: "quarter" as const, label: "3 derniers mois" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`date-${option.value}`}
                    checked={filters.date_added === option.value}
                    onCheckedChange={() => handleDateAddedChange(option.value)}
                  />
                  <label
                    htmlFor={`date-${option.value}`}
                    className="text-sm text-slate-700 cursor-pointer flex-1"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Popularity */}
          <Collapsible open={openSections.includes("popularity")}>
            <CollapsibleTrigger
              onClick={() => toggleSection("popularity")}
              className="flex items-center justify-between w-full"
            >
              <Label className="text-sm font-medium cursor-pointer">
                ⭐ POPULARITÉ
              </Label>
              {openSections.includes("popularity") ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {[
                { value: "downloads" as const, label: "Plus téléchargés" },
                { value: "rating" as const, label: "Mieux notés" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`popularity-${option.value}`}
                    checked={filters.sort_by === option.value}
                    onCheckedChange={() => handlePopularityChange(option.value)}
                  />
                  <label
                    htmlFor={`popularity-${option.value}`}
                    className="text-sm text-slate-700 cursor-pointer flex-1"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
