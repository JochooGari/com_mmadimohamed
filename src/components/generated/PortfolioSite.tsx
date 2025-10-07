"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, Download, Mail, Phone, MapPin, ArrowRight, CheckCircle, BookOpen, FileText, Users, Database, BarChart3, GraduationCap, Github, Linkedin, Twitter, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { PowerBILibrary } from "@/components/powerbi/PowerBILibrary";
import { mockDashboards } from "@/data/mock-powerbi-dashboards";
export interface PortfolioSiteProps {
  className?: string;
}

// Demo data
const navigationItems = [{
  id: "accueil",
  label: "Accueil",
  href: "#accueil"
}, {
  id: "expertise",
  label: "Expertise",
  href: "#expertise"
}, {
  id: "blog",
  label: "Blog",
  href: "#blog"
}, {
  id: "bibliotheque",
  label: "Bibliothèque",
  href: "#bibliotheque"
}, {
  id: "contact",
  label: "Contact",
  href: "#contact"
}] as any[];
const expertiseAreas = [{
  id: "data-strategy",
  title: "Stratégie Data",
  description: "Définition de votre roadmap data et mise en place d'une gouvernance efficace",
  icon: Database,
  features: ["Audit data", "Roadmap stratégique", "Gouvernance", "KPIs métier"]
}, {
  id: "powerbi-dashboards",
  title: "Tableaux de Bord Power BI",
  description: "Création de dashboards interactifs et performants pour vos équipes",
  icon: BarChart3,
  features: ["Dashboards interactifs", "Modélisation", "Optimisation", "Formation utilisateurs"]
}, {
  id: "training",
  title: "Formation & Accompagnement",
  description: "Montée en compétences de vos équipes sur les outils de Business Intelligence",
  icon: GraduationCap,
  features: ["Formation Power BI", "Coaching équipes", "Best practices", "Support continu"]
}] as any[];
const blogPosts = [{
  id: "blog-1",
  title: "Les 5 erreurs à éviter dans votre stratégie data",
  excerpt: "Découvrez les pièges les plus courants et comment les éviter pour réussir votre transformation data.",
  date: "15 Mars 2024",
  readTime: "5 min",
  category: "Stratégie"
}, {
  id: "blog-2",
  title: "Power BI vs Tableau : Quel outil choisir en 2024 ?",
  excerpt: "Comparaison détaillée des deux leaders du marché de la Business Intelligence.",
  date: "8 Mars 2024",
  readTime: "8 min",
  category: "Outils"
}, {
  id: "blog-3",
  title: "Comment optimiser les performances de vos rapports Power BI",
  excerpt: "Techniques avancées pour accélérer vos dashboards et améliorer l'expérience utilisateur.",
  date: "1 Mars 2024",
  readTime: "6 min",
  category: "Performance"
}] as any[];
const resources = [{
  id: "resource-1",
  title: "Guide complet Power BI",
  description: "Manuel de 50 pages couvrant toutes les fonctionnalités essentielles",
  type: "PDF",
  category: "Guide",
  downloadCount: "2.3k"
}, {
  id: "resource-2",
  title: "Templates Dashboard Finance",
  description: "Collection de modèles prêts à l'emploi pour le reporting financier",
  type: "PBIX",
  category: "Template",
  downloadCount: "1.8k"
}, {
  id: "resource-3",
  title: "Checklist Audit Data",
  description: "Liste de contrôle pour évaluer la maturité data de votre organisation",
  type: "Excel",
  category: "Outil",
  downloadCount: "950"
}, {
  id: "resource-4",
  title: "Formation DAX Avancée",
  description: "Vidéos de formation sur les fonctions DAX les plus complexes",
  type: "Vidéo",
  category: "Formation",
  downloadCount: "3.1k"
}] as any[];
const skills = ["Power BI", "SQL Server", "Azure", "Python", "Excel", "Power Automate", "Tableau", "Qlik Sense", "Google Analytics", "Data Modeling", "ETL", "DAX"];
export default function PortfolioSite({
  className
}: PortfolioSiteProps) {
  const [activeSection, setActiveSection] = useState("accueil");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    scrollY
  } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);

  // Intersection Observer for active section
  useEffect(() => {
    const observers = navigationItems.map(item => {
      const element = document.getElementById(item.id);
      if (!element) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection(item.id);
        }
      }, {
        threshold: 0.3,
        rootMargin: "-100px 0px -50% 0px"
      });
      observer.observe(element);
      return observer;
    });
    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
    setIsMenuOpen(false);
  };
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsContactModalOpen(false);
    setContactForm({
      name: "",
      email: "",
      message: ""
    });
  };
  const downloadCV = () => {
    // Simulate CV download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'CV_Chef_Projet_Data_PowerBI.pdf';
    link.click();
  };
  return <TooltipProvider>
      <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-teal-50", className)}>
        {/* Skip to content link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
          Aller au contenu principal
        </a>

        {/* Header */}
        <motion.header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/50" style={{
        opacity: headerOpacity
      }}>
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div className="flex items-center space-x-2" whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JD</span>
                </div>
                <span className="font-semibold text-slate-900 hidden sm:block">Jean Dupont</span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navigationItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn("relative px-3 py-2 text-sm font-medium transition-colors hover:text-teal-600", activeSection === item.id ? "text-teal-600" : "text-slate-600")}>
                    {item.label}
                    {activeSection === item.id && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" layoutId="activeTab" transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6
                }} />}
                  </button>)}
              </div>

              {/* CTA Button */}
              <div className="hidden md:flex items-center space-x-4">
                <Button onClick={() => setIsContactModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
                  Me contacter
                </Button>
              </div>

              {/* Mobile menu button */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navigationItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn("text-left px-4 py-3 rounded-lg text-lg font-medium transition-colors", activeSection === item.id ? "bg-teal-50 text-teal-600" : "text-slate-600 hover:bg-slate-50")}>
                        {item.label}
                      </button>)}
                    <Separator className="my-4" />
                    <Button onClick={() => {
                    setIsContactModalOpen(true);
                    setIsMenuOpen(false);
                  }} className="bg-teal-600 hover:bg-teal-700 text-white">
                      Me contacter
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </motion.header>

        <main id="main-content">
          {/* Accueil Section */}
          <section id="accueil" className="relative pt-16 pb-20 sm:pb-24 lg:pb-32 overflow-hidden">
            <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{
            y: heroY
          }}>
              <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                <motion.div initial={{
                opacity: 0,
                y: 50
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.8,
                delay: 0.2
              }} className="text-center lg:text-left">
                  <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6" initial={{
                  opacity: 0,
                  y: 30
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.8,
                  delay: 0.4
                }}>
                    Chef de projet Data &{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                      Expert Power BI
                    </span>
                  </motion.h1>
                  
                  <motion.p className="text-xl text-slate-600 mb-8 max-w-2xl" initial={{
                  opacity: 0,
                  y: 30
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.8,
                  delay: 0.6
                }}>
                    J'aide les entreprises à transformer leurs données en décisions éclairées grâce à des solutions Power BI sur mesure et une stratégie data performante.
                  </motion.p>

                  <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" initial={{
                  opacity: 0,
                  y: 30
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.8,
                  delay: 0.8
                }}>
                    <Button size="lg" onClick={downloadCV} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg">
                      <Download className="mr-2 h-5 w-5" />
                      Télécharger mon CV
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setIsContactModalOpen(true)} className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 text-lg">
                      <Mail className="mr-2 h-5 w-5" />
                      Me contacter
                    </Button>
                  </motion.div>

                  <motion.div className="mt-12 flex flex-wrap gap-2 justify-center lg:justify-start" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  duration: 0.8,
                  delay: 1
                }}>
                    {skills.slice(0, 6).map((skill, index) => <Badge key={skill} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors">
                        {skill}
                      </Badge>)}
                  </motion.div>
                </motion.div>

                {/* Abstract illustration */}
                <motion.div className="relative hidden lg:block" initial={{
                opacity: 0,
                scale: 0.8
              }} animate={{
                opacity: 1,
                scale: 1
              }} transition={{
                duration: 1,
                delay: 0.5
              }}>
                  <div className="relative w-full h-96">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-teal-600/30 rounded-3xl" animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }} transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }} />
                    <motion.div className="absolute top-8 right-8 w-24 h-24 bg-teal-500/30 rounded-full" animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }} transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }} />
                    <motion.div className="absolute bottom-12 left-12 w-16 h-16 bg-teal-600/40 rounded-lg" animate={{
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1]
                  }} transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Expertise Section */}
          <section id="expertise" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{
              opacity: 0,
              y: 50
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8
            }} viewport={{
              once: true
            }} className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Mon Expertise
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Des solutions sur mesure pour transformer vos données en avantage concurrentiel
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {expertiseAreas.map((area, index) => <motion.div key={area.id} initial={{
                opacity: 0,
                y: 50
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.8,
                delay: index * 0.2
              }} viewport={{
                once: true
              }}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
                      <CardHeader className="text-center pb-4">
                        <motion.div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors" whileHover={{
                      scale: 1.1
                    }} transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }}>
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
                          {area.features.map(feature => <li key={feature} className="flex items-center text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </div>

              {/* Skills Overview */}
              <motion.div initial={{
              opacity: 0,
              y: 50
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.4
            }} viewport={{
              once: true
            }} className="mt-16 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-8">Technologies & Outils</h3>
                <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                  {skills.map(skill => <Badge key={skill} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors px-4 py-2">
                      {skill}
                    </Badge>)}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Blog Section */}
          <section id="blog" className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{
              opacity: 0,
              y: 50
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8
            }} viewport={{
              once: true
            }} className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Blog & Actualités
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Découvrez mes derniers articles sur la Business Intelligence et la transformation data
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => <motion.article key={post.id} initial={{
                opacity: 0,
                y: 50
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.8,
                delay: index * 0.1
              }} viewport={{
                once: true
              }}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                            {post.category}
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
                          <span className="text-sm text-slate-500">{post.readTime} de lecture</span>
                          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0">
                            Lire la suite
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.article>)}
              </div>

              <motion.div initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8,
              delay: 0.4
            }} viewport={{
              once: true
            }} className="text-center mt-12">
                <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                  Voir tous les articles
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Bibliothèque Section - Power BI Dashboards */}
          <section id="bibliotheque" className="py-20 bg-white">
            <motion.div initial={{
              opacity: 0,
              y: 50
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8
            }} viewport={{
              once: true
            }} className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Bibliothèque Power BI
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Dashboards Power BI prêts à l'emploi par domaine d'expertise
              </p>
            </motion.div>

            <PowerBILibrary dashboards={mockDashboards} />
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial={{
              opacity: 0,
              y: 50
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8
            }} viewport={{
              once: true
            }} className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Discutons de votre projet
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Prêt à transformer vos données en avantage concurrentiel ? Contactez-moi pour échanger sur vos besoins.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <motion.div initial={{
                opacity: 0,
                x: -50
              }} whileInView={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.8
              }} viewport={{
                once: true
              }} className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <p className="text-slate-600">contact@mmadimohamed.fr</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Téléphone</h3>
                      <p className="text-slate-600">+33 6 12 34 56 78</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Localisation</h3>
                      <p className="text-slate-600">Paris, France</p>
                    </div>
                  </div>

                  <div className="pt-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Suivez-moi</h3>
                    <div className="flex space-x-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300">
                            <Linkedin className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>LinkedIn</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300">
                            <Github className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>GitHub</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300">
                            <Twitter className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Twitter</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{
                opacity: 0,
                x: 50
              }} whileInView={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.8,
                delay: 0.2
              }} viewport={{
                once: true
              }}>
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Envoyez-moi un message</CardTitle>
                      <CardDescription>
                        Je vous réponds généralement sous 24h
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleContactSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Nom complet</Label>
                          <Input id="contact-name" value={contactForm.name} onChange={e => setContactForm(prev => ({
                          ...prev,
                          name: e.target.value
                        }))} placeholder="Votre nom" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email</Label>
                          <Input id="contact-email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
                          ...prev,
                          email: e.target.value
                        }))} placeholder="votre@email.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-message">Message</Label>
                          <Textarea id="contact-message" value={contactForm.message} onChange={e => setContactForm(prev => ({
                          ...prev,
                          message: e.target.value
                        }))} placeholder="Décrivez votre projet..." rows={5} required />
                        </div>
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting}>
                          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">MM</span>
                  </div>
                  <span className="font-semibold">MMADI Mohamed</span>
                </div>
                <p className="text-slate-400">
                  MMADI Mohamed & Expert Power BI
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <div className="space-y-2 text-slate-400">
                  <p>contact@mmadimohamed.fr</p>
                  <p>+33 6 12 34 56 78</p>
                  <p>Paris, France</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Suivez-moi</h3>
                <div className="flex space-x-4 justify-center md:justify-start">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                    <Linkedin className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                    <Github className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-8 bg-slate-800" />
            
            <div className="text-center text-slate-400">
              <p>&copy; 2024 MMADI Mohamed. Tous droits réservés.</p>
            </div>
          </div>
        </footer>

        {/* Contact Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Me contacter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Nom complet</Label>
                <Input id="modal-name" value={contactForm.name} onChange={e => setContactForm(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Votre nom" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-email">Email</Label>
                <Input id="modal-email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
                ...prev,
                email: e.target.value
              }))} placeholder="votre@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-message">Message</Label>
                <Textarea id="modal-message" value={contactForm.message} onChange={e => setContactForm(prev => ({
                ...prev,
                message: e.target.value
              }))} placeholder="Décrivez votre projet..." rows={4} required />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>;
}