import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import EditableText from "./EditableText";
import { useContent } from "../context/ContentContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Download, Mail } from "lucide-react";

const skills = [
  "Power BI",
  "SQL Server",
  "Azure",
  "Python",
  "Excel",
  "Power Automate",
];

export default function Hero() {
  const { content, setContent } = useContent();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);

  const downloadCV = () => {
    // Simulate CV download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'CV_Chef_Projet_Data_PowerBI.pdf';
    link.click();
  };

  return (
    <section id="accueil" className="relative pt-16 pb-20 sm:pb-24 lg:pb-32 overflow-hidden">
      <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ y: heroY }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <EditableText
                value={content.hero.title}
                onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, title: v } }))}
                as="span"
                className="inline"
              />
              {" "}&
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                <EditableText
                  value={content.hero.highlight}
                  onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, highlight: v } }))}
                  as="span"
                  className="inline"
                />
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-slate-600 mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <EditableText
                value={content.hero.subtitle}
                onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, subtitle: v } }))}
                as="span"
                className="inline"
              />
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button size="lg" onClick={downloadCV} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Télécharger mon CV
              </Button>
              <Button size="lg" variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 text-lg">
                <Mail className="mr-2 h-5 w-5" />
                Me contacter
              </Button>
            </motion.div>
            <motion.div
              className="mt-12 flex flex-wrap gap-2 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors">
                  {skill}
                </Badge>
              ))}
            </motion.div>
          </motion.div>
          {/* Illustration abstraite */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="relative w-full h-96">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-teal-600/30 rounded-3xl"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-8 right-8 w-24 h-24 bg-teal-500/30 rounded-full"
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-12 left-12 w-16 h-16 bg-teal-600/40 rounded-lg"
                animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
} 