import React from "react";
import { motion } from "framer-motion";
import EditableText from "./EditableText";
import { useContent } from "../context/ContentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Download, Users, BookOpen } from "lucide-react";

export default function Resources() {
  const { content, setContent } = useContent();

  return (
    <section id="bibliotheque" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            <EditableText
              value={content.resourcesTitle || "Bibliothèque de Ressources"}
              onChange={(v) => setContent((c) => ({ ...c, resourcesTitle: v }))}
              as="span"
              className="inline"
            />
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            <EditableText
              value={content.resourcesSubtitle || "Guides, templates et outils gratuits pour accélérer vos projets data"}
              onChange={(v) => setContent((c) => ({ ...c, resourcesSubtitle: v }))}
              as="span"
              className="inline"
            />
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {content.resources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {resource.category}
                    </Badge>
                    <Badge variant="outline" className="border-teal-200 text-teal-700">
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 mb-4">
                    {resource.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{resource.downloadCount} téléchargements</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0">
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <BookOpen className="w-4 h-4 mr-2" />
            Voir toute la bibliothèque
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 