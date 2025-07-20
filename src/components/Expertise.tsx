import React from "react";
import { motion } from "framer-motion";
import EditableText from "./EditableText";
import { useContent } from "../context/ContentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Database, BarChart3, GraduationCap, CheckCircle } from "lucide-react";

const expertiseAreas = [
  {
    id: "data-strategy",
    title: "Stratégie Data",
    description: "Définition de votre roadmap data et mise en place d'une gouvernance efficace",
    icon: Database,
    features: ["Audit data", "Roadmap stratégique", "Gouvernance", "KPIs métier"],
  },
  {
    id: "powerbi-dashboards",
    title: "Tableaux de Bord Power BI",
    description: "Création de dashboards interactifs et performants pour vos équipes",
    icon: BarChart3,
    features: ["Dashboards interactifs", "Modélisation", "Optimisation", "Formation utilisateurs"],
  },
  {
    id: "training",
    title: "Formation & Accompagnement",
    description: "Montée en compétences de vos équipes sur les outils de Business Intelligence",
    icon: GraduationCap,
    features: ["Formation Power BI", "Coaching équipes", "Best practices", "Support continu"],
  },
];

const skills = [
  "Power BI",
  "SQL Server",
  "Azure",
  "Python",
  "Excel",
  "Power Automate",
];

export default function Expertise() {
  const { content, setContent } = useContent();

  return (
    <section id="expertise" className="py-20 bg-white">
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
              value={content.expertiseTitle || "Mon Expertise"}
              onChange={(v) => setContent((c) => ({ ...c, expertiseTitle: v }))}
              as="span"
              className="inline"
            />
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            <EditableText
              value={content.expertiseSubtitle || "Des solutions sur mesure pour transformer vos données en avantage concurrentiel"}
              onChange={(v) => setContent((c) => ({ ...c, expertiseSubtitle: v }))}
              as="span"
              className="inline"
            />
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expertiseAreas.map((area, index) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <area.icon className="w-8 h-8 text-teal-600" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                    {area.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 mb-6 leading-relaxed">
                    {area.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {area.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {/* Skills Overview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-semibold text-slate-900 mb-8">Technologies & Outils</h3>
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors px-4 py-2">
                {skill}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 