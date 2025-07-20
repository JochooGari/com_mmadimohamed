import React from "react";
import { motion } from "framer-motion";
import EditableText from "./EditableText";
import { useContent } from "../context/ContentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";

export default function Blog() {
  const { content, setContent } = useContent();

  // CRUD helpers (à compléter selon vos besoins)
  // const addPost = ...
  // const editPost = ...
  // const deletePost = ...

  return (
    <section id="blog" className="py-20 bg-slate-50">
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
              value={content.blogTitle || "Blog & Actualités"}
              onChange={(v) => setContent((c) => ({ ...c, blogTitle: v }))}
              as="span"
              className="inline"
            />
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            <EditableText
              value={content.blogSubtitle || "Découvrez mes derniers articles sur la Business Intelligence et la transformation data"}
              onChange={(v) => setContent((c) => ({ ...c, blogSubtitle: v }))}
              as="span"
              className="inline"
            />
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.blog.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                      {post.tags[0] || "Catégorie"}
                    </Badge>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{post.readTime || "-"} de lecture</span>
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0">
                      Lire la suite
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.article>
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
            Voir tous les articles
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 