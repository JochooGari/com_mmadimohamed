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
export interface PortfolioSiteProps {
  className?: string;
  mpid?: string;
}

// Demo data
const navigationItems = [{
  id: "accueil",
  label: "Accueil",
  href: "#accueil",
  mpid: "7163ec98-9fdc-4b68-a248-7fe8713670d6"
}, {
  id: "expertise",
  label: "Expertise",
  href: "#expertise",
  mpid: "3de8fdf2-7690-4d99-b619-ff6538f5ca47"
}, {
  id: "blog",
  label: "Blog",
  href: "#blog",
  mpid: "4e20e0a0-6497-4b0e-beea-cb0628754268"
}, {
  id: "bibliotheque",
  label: "Bibliothèque",
  href: "#bibliotheque",
  mpid: "77ddb6d1-28fd-43d6-8c59-008af749f6cb"
}, {
  id: "contact",
  label: "Contact",
  href: "#contact",
  mpid: "ca14e7f4-4751-4531-ae62-4dbaeea71f30"
}] as any[];
const expertiseAreas = [{
  id: "data-strategy",
  title: "Stratégie Data",
  description: "Définition de votre roadmap data et mise en place d'une gouvernance efficace",
  icon: Database,
  features: ["Audit data", "Roadmap stratégique", "Gouvernance", "KPIs métier"],
  mpid: "8903d25d-7584-41e1-bb8d-21971e9a1005"
}, {
  id: "powerbi-dashboards",
  title: "Tableaux de Bord Power BI",
  description: "Création de dashboards interactifs et performants pour vos équipes",
  icon: BarChart3,
  features: ["Dashboards interactifs", "Modélisation", "Optimisation", "Formation utilisateurs"],
  mpid: "eae8287b-0c36-40cc-8fc8-d1f8b92f74d9"
}, {
  id: "training",
  title: "Formation & Accompagnement",
  description: "Montée en compétences de vos équipes sur les outils de Business Intelligence",
  icon: GraduationCap,
  features: ["Formation Power BI", "Coaching équipes", "Best practices", "Support continu"],
  mpid: "cbcce888-0f9e-498a-9c31-c14c9abc04f6"
}] as any[];
const blogPosts = [{
  id: "blog-1",
  title: "Les 5 erreurs à éviter dans votre stratégie data",
  excerpt: "Découvrez les pièges les plus courants et comment les éviter pour réussir votre transformation data.",
  date: "15 Mars 2024",
  readTime: "5 min",
  category: "Stratégie",
  mpid: "f5975199-905e-48bd-82d3-0b2d38f9c03f"
}, {
  id: "blog-2",
  title: "Power BI vs Tableau : Quel outil choisir en 2024 ?",
  excerpt: "Comparaison détaillée des deux leaders du marché de la Business Intelligence.",
  date: "8 Mars 2024",
  readTime: "8 min",
  category: "Outils",
  mpid: "992c0631-df7d-4d59-bf0e-b7a7b35f8c0b"
}, {
  id: "blog-3",
  title: "Comment optimiser les performances de vos rapports Power BI",
  excerpt: "Techniques avancées pour accélérer vos dashboards et améliorer l'expérience utilisateur.",
  date: "1 Mars 2024",
  readTime: "6 min",
  category: "Performance",
  mpid: "5a656019-56ca-474c-b0d9-0b6157d1259d"
}] as any[];
const resources = [{
  id: "resource-1",
  title: "Guide complet Power BI",
  description: "Manuel de 50 pages couvrant toutes les fonctionnalités essentielles",
  type: "PDF",
  category: "Guide",
  downloadCount: "2.3k",
  mpid: "afa2a405-c39d-447f-93ec-491835dbf88c"
}, {
  id: "resource-2",
  title: "Templates Dashboard Finance",
  description: "Collection de modèles prêts à l'emploi pour le reporting financier",
  type: "PBIX",
  category: "Template",
  downloadCount: "1.8k",
  mpid: "b71024cf-692c-4d63-b50f-3fd565cb6a76"
}, {
  id: "resource-3",
  title: "Checklist Audit Data",
  description: "Liste de contrôle pour évaluer la maturité data de votre organisation",
  type: "Excel",
  category: "Outil",
  downloadCount: "950",
  mpid: "1a0baee0-1438-41b1-85b9-a79e062758d7"
}, {
  id: "resource-4",
  title: "Formation DAX Avancée",
  description: "Vidéos de formation sur les fonctions DAX les plus complexes",
  type: "Vidéo",
  category: "Formation",
  downloadCount: "3.1k",
  mpid: "790cc200-27b0-4cda-a531-44aecc2eaee3"
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
  return <TooltipProvider data-magicpath-id="0" data-magicpath-path="PortfolioSite.tsx">
      <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-teal-50", className)} data-magicpath-id="1" data-magicpath-path="PortfolioSite.tsx">
        {/* Skip to content link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
          Aller au contenu principal
        </a>

        {/* Header */}
        <motion.header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/50" style={{
        opacity: headerOpacity
      }} data-magicpath-id="2" data-magicpath-path="PortfolioSite.tsx">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="3" data-magicpath-path="PortfolioSite.tsx">
            <div className="flex items-center justify-between h-16" data-magicpath-id="4" data-magicpath-path="PortfolioSite.tsx">
              {/* Logo */}
              <motion.div className="flex items-center space-x-2" whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} data-magicpath-id="5" data-magicpath-path="PortfolioSite.tsx">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center" data-magicpath-id="6" data-magicpath-path="PortfolioSite.tsx">
                  <span className="text-white font-bold text-lg" data-magicpath-id="7" data-magicpath-path="PortfolioSite.tsx">JD</span>
                </div>
                <span className="font-semibold text-slate-900 hidden sm:block" data-magicpath-id="8" data-magicpath-path="PortfolioSite.tsx">Jean Dupont</span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8" data-magicpath-id="9" data-magicpath-path="PortfolioSite.tsx">
                {navigationItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn("relative px-3 py-2 text-sm font-medium transition-colors hover:text-teal-600", activeSection === item.id ? "text-teal-600" : "text-slate-600")} data-magicpath-uuid={(item as any)["mpid"] ?? "unsafe"} data-magicpath-field="label:unknown" data-magicpath-id="10" data-magicpath-path="PortfolioSite.tsx">
                    {item.label}
                    {activeSection === item.id && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" layoutId="activeTab" transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6
                }} data-magicpath-id="11" data-magicpath-path="PortfolioSite.tsx" />}
                  </button>)}
              </div>

              {/* CTA Button */}
              <div className="hidden md:flex items-center space-x-4" data-magicpath-id="12" data-magicpath-path="PortfolioSite.tsx">
                <Button onClick={() => setIsContactModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white" data-magicpath-id="13" data-magicpath-path="PortfolioSite.tsx">
                  Me contacter
                </Button>
              </div>

              {/* Mobile menu button */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen} data-magicpath-id="14" data-magicpath-path="PortfolioSite.tsx">
                <SheetTrigger asChild data-magicpath-id="15" data-magicpath-path="PortfolioSite.tsx">
                  <Button variant="ghost" size="icon" className="md:hidden" data-magicpath-id="16" data-magicpath-path="PortfolioSite.tsx">
                    <Menu className="h-6 w-6" data-magicpath-id="17" data-magicpath-path="PortfolioSite.tsx" />
                    <span className="sr-only" data-magicpath-id="18" data-magicpath-path="PortfolioSite.tsx">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]" data-magicpath-id="19" data-magicpath-path="PortfolioSite.tsx">
                  <nav className="flex flex-col space-y-4 mt-8" data-magicpath-id="20" data-magicpath-path="PortfolioSite.tsx">
                    {navigationItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn("text-left px-4 py-3 rounded-lg text-lg font-medium transition-colors", activeSection === item.id ? "bg-teal-50 text-teal-600" : "text-slate-600 hover:bg-slate-50")} data-magicpath-uuid={(item as any)["mpid"] ?? "unsafe"} data-magicpath-field="label:unknown" data-magicpath-id="21" data-magicpath-path="PortfolioSite.tsx">
                        {item.label}
                      </button>)}
                    <Separator className="my-4" data-magicpath-id="22" data-magicpath-path="PortfolioSite.tsx" />
                    <Button onClick={() => {
                    setIsContactModalOpen(true);
                    setIsMenuOpen(false);
                  }} className="bg-teal-600 hover:bg-teal-700 text-white" data-magicpath-id="23" data-magicpath-path="PortfolioSite.tsx">
                      Me contacter
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </motion.header>

        <main id="main-content" data-magicpath-id="24" data-magicpath-path="PortfolioSite.tsx">
          {/* Accueil Section */}
          <section id="accueil" className="relative pt-16 pb-20 sm:pb-24 lg:pb-32 overflow-hidden" data-magicpath-id="25" data-magicpath-path="PortfolioSite.tsx">
            <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{
            y: heroY
          }} data-magicpath-id="26" data-magicpath-path="PortfolioSite.tsx">
              <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]" data-magicpath-id="27" data-magicpath-path="PortfolioSite.tsx">
                <motion.div initial={{
                opacity: 0,
                y: 50
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.8,
                delay: 0.2
              }} className="text-center lg:text-left" data-magicpath-id="28" data-magicpath-path="PortfolioSite.tsx">
                  <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6" initial={{
                  opacity: 0,
                  y: 30
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.8,
                  delay: 0.4
                }} data-magicpath-id="29" data-magicpath-path="PortfolioSite.tsx">
                    Chef de projet Data &{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600" data-magicpath-id="30" data-magicpath-path="PortfolioSite.tsx">
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
                }} data-magicpath-id="31" data-magicpath-path="PortfolioSite.tsx">
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
                }} data-magicpath-id="32" data-magicpath-path="PortfolioSite.tsx">
                    <Button size="lg" onClick={downloadCV} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg" data-magicpath-id="33" data-magicpath-path="PortfolioSite.tsx">
                      <Download className="mr-2 h-5 w-5" data-magicpath-id="34" data-magicpath-path="PortfolioSite.tsx" />
                      Télécharger mon CV
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setIsContactModalOpen(true)} className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3 text-lg" data-magicpath-id="35" data-magicpath-path="PortfolioSite.tsx">
                      <Mail className="mr-2 h-5 w-5" data-magicpath-id="36" data-magicpath-path="PortfolioSite.tsx" />
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
                }} data-magicpath-id="37" data-magicpath-path="PortfolioSite.tsx">
                    {skills.slice(0, 6).map((skill, index) => <Badge key={skill} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors" data-magicpath-id="38" data-magicpath-path="PortfolioSite.tsx">
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
              }} data-magicpath-id="39" data-magicpath-path="PortfolioSite.tsx">
                  <div className="relative w-full h-96" data-magicpath-id="40" data-magicpath-path="PortfolioSite.tsx">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-teal-600/30 rounded-3xl" animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }} transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }} data-magicpath-id="41" data-magicpath-path="PortfolioSite.tsx" />
                    <motion.div className="absolute top-8 right-8 w-24 h-24 bg-teal-500/30 rounded-full" animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }} transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }} data-magicpath-id="42" data-magicpath-path="PortfolioSite.tsx" />
                    <motion.div className="absolute bottom-12 left-12 w-16 h-16 bg-teal-600/40 rounded-lg" animate={{
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1]
                  }} transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }} data-magicpath-id="43" data-magicpath-path="PortfolioSite.tsx" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* Expertise Section */}
          <section id="expertise" className="py-20 bg-white" data-magicpath-id="44" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="45" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="46" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="47" data-magicpath-path="PortfolioSite.tsx">
                  Mon Expertise
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="48" data-magicpath-path="PortfolioSite.tsx">
                  Des solutions sur mesure pour transformer vos données en avantage concurrentiel
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-magicpath-id="49" data-magicpath-path="PortfolioSite.tsx">
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
              }} data-magicpath-id="50" data-magicpath-path="PortfolioSite.tsx">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md" data-magicpath-id="51" data-magicpath-path="PortfolioSite.tsx">
                      <CardHeader className="text-center pb-4" data-magicpath-id="52" data-magicpath-path="PortfolioSite.tsx">
                        <motion.div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors" whileHover={{
                      scale: 1.1
                    }} transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }} data-magicpath-id="53" data-magicpath-path="PortfolioSite.tsx">
                          <area.icon className="w-8 h-8 text-teal-600" data-magicpath-id="54" data-magicpath-path="PortfolioSite.tsx" />
                        </motion.div>
                        <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-teal-600 transition-colors" data-magicpath-uuid={(area as any)["mpid"] ?? "unsafe"} data-magicpath-field="title:unknown" data-magicpath-id="55" data-magicpath-path="PortfolioSite.tsx">
                          {area.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center" data-magicpath-id="56" data-magicpath-path="PortfolioSite.tsx">
                        <CardDescription className="text-slate-600 mb-6 leading-relaxed" data-magicpath-uuid={(area as any)["mpid"] ?? "unsafe"} data-magicpath-field="description:unknown" data-magicpath-id="57" data-magicpath-path="PortfolioSite.tsx">
                          {area.description}
                        </CardDescription>
                        <ul className="space-y-2" data-magicpath-id="58" data-magicpath-path="PortfolioSite.tsx">
                          {area.features.map(feature => <li key={feature} className="flex items-center text-sm text-slate-600" data-magicpath-id="59" data-magicpath-path="PortfolioSite.tsx">
                              <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" data-magicpath-id="60" data-magicpath-path="PortfolioSite.tsx" />
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
            }} className="mt-16 text-center" data-magicpath-id="61" data-magicpath-path="PortfolioSite.tsx">
                <h3 className="text-2xl font-semibold text-slate-900 mb-8" data-magicpath-id="62" data-magicpath-path="PortfolioSite.tsx">Technologies & Outils</h3>
                <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto" data-magicpath-id="63" data-magicpath-path="PortfolioSite.tsx">
                  {skills.map(skill => <Badge key={skill} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors px-4 py-2" data-magicpath-id="64" data-magicpath-path="PortfolioSite.tsx">
                      {skill}
                    </Badge>)}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Blog Section */}
          <section id="blog" className="py-20 bg-slate-50" data-magicpath-id="65" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="66" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="67" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="68" data-magicpath-path="PortfolioSite.tsx">
                  Blog & Actualités
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="69" data-magicpath-path="PortfolioSite.tsx">
                  Découvrez mes derniers articles sur la Business Intelligence et la transformation data
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-magicpath-id="70" data-magicpath-path="PortfolioSite.tsx">
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
              }} data-magicpath-id="71" data-magicpath-path="PortfolioSite.tsx">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md" data-magicpath-id="72" data-magicpath-path="PortfolioSite.tsx">
                      <CardHeader data-magicpath-id="73" data-magicpath-path="PortfolioSite.tsx">
                        <div className="flex items-center justify-between mb-2" data-magicpath-id="74" data-magicpath-path="PortfolioSite.tsx">
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700" data-magicpath-uuid={(post as any)["mpid"] ?? "unsafe"} data-magicpath-field="category:unknown" data-magicpath-id="75" data-magicpath-path="PortfolioSite.tsx">
                            {post.category}
                          </Badge>
                          <div className="flex items-center text-sm text-slate-500" data-magicpath-id="76" data-magicpath-path="PortfolioSite.tsx">
                            <Calendar className="w-4 h-4 mr-1" data-magicpath-id="77" data-magicpath-path="PortfolioSite.tsx" />
                            <span data-magicpath-uuid={(post as any)["mpid"] ?? "unsafe"} data-magicpath-field="date:unknown" data-magicpath-id="78" data-magicpath-path="PortfolioSite.tsx">{post.date}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2" data-magicpath-uuid={(post as any)["mpid"] ?? "unsafe"} data-magicpath-field="title:unknown" data-magicpath-id="79" data-magicpath-path="PortfolioSite.tsx">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent data-magicpath-id="80" data-magicpath-path="PortfolioSite.tsx">
                        <CardDescription className="text-slate-600 mb-4 line-clamp-3" data-magicpath-uuid={(post as any)["mpid"] ?? "unsafe"} data-magicpath-field="excerpt:unknown" data-magicpath-id="81" data-magicpath-path="PortfolioSite.tsx">
                          {post.excerpt}
                        </CardDescription>
                        <div className="flex items-center justify-between" data-magicpath-id="82" data-magicpath-path="PortfolioSite.tsx">
                          <span className="text-sm text-slate-500" data-magicpath-uuid={(post as any)["mpid"] ?? "unsafe"} data-magicpath-field="readTime:unknown" data-magicpath-id="83" data-magicpath-path="PortfolioSite.tsx">{post.readTime} de lecture</span>
                          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0" data-magicpath-id="84" data-magicpath-path="PortfolioSite.tsx">
                            Lire la suite
                            <ArrowRight className="w-4 h-4 ml-1" data-magicpath-id="85" data-magicpath-path="PortfolioSite.tsx" />
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
            }} className="text-center mt-12" data-magicpath-id="86" data-magicpath-path="PortfolioSite.tsx">
                <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50" data-magicpath-id="87" data-magicpath-path="PortfolioSite.tsx">
                  Voir tous les articles
                  <ExternalLink className="w-4 h-4 ml-2" data-magicpath-id="88" data-magicpath-path="PortfolioSite.tsx" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Bibliothèque Section */}
          <section id="bibliotheque" className="py-20 bg-white" data-magicpath-id="89" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="90" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="91" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="92" data-magicpath-path="PortfolioSite.tsx">
                  Bibliothèque de Ressources
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="93" data-magicpath-path="PortfolioSite.tsx">
                  Guides, templates et outils gratuits pour accélérer vos projets data
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8" data-magicpath-id="94" data-magicpath-path="PortfolioSite.tsx">
                {resources.map((resource, index) => <motion.div key={resource.id} initial={{
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
              }} data-magicpath-id="95" data-magicpath-path="PortfolioSite.tsx">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md" data-magicpath-id="96" data-magicpath-path="PortfolioSite.tsx">
                      <CardHeader data-magicpath-id="97" data-magicpath-path="PortfolioSite.tsx">
                        <div className="flex items-center justify-between mb-2" data-magicpath-id="98" data-magicpath-path="PortfolioSite.tsx">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700" data-magicpath-uuid={(resource as any)["mpid"] ?? "unsafe"} data-magicpath-field="type:unknown" data-magicpath-id="99" data-magicpath-path="PortfolioSite.tsx">
                            {resource.type}
                          </Badge>
                          <Badge variant="outline" className="border-teal-200 text-teal-700" data-magicpath-uuid={(resource as any)["mpid"] ?? "unsafe"} data-magicpath-field="category:unknown" data-magicpath-id="100" data-magicpath-path="PortfolioSite.tsx">
                            {resource.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors" data-magicpath-uuid={(resource as any)["mpid"] ?? "unsafe"} data-magicpath-field="title:unknown" data-magicpath-id="101" data-magicpath-path="PortfolioSite.tsx">
                          {resource.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent data-magicpath-id="102" data-magicpath-path="PortfolioSite.tsx">
                        <CardDescription className="text-slate-600 mb-4" data-magicpath-uuid={(resource as any)["mpid"] ?? "unsafe"} data-magicpath-field="description:unknown" data-magicpath-id="103" data-magicpath-path="PortfolioSite.tsx">
                          {resource.description}
                        </CardDescription>
                        <div className="flex items-center justify-between" data-magicpath-id="104" data-magicpath-path="PortfolioSite.tsx">
                          <div className="flex items-center text-sm text-slate-500" data-magicpath-id="105" data-magicpath-path="PortfolioSite.tsx">
                            <Users className="w-4 h-4 mr-1" data-magicpath-id="106" data-magicpath-path="PortfolioSite.tsx" />
                            <span data-magicpath-uuid={(resource as any)["mpid"] ?? "unsafe"} data-magicpath-field="downloadCount:unknown" data-magicpath-id="107" data-magicpath-path="PortfolioSite.tsx">{resource.downloadCount} téléchargements</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 p-0" data-magicpath-id="108" data-magicpath-path="PortfolioSite.tsx">
                            <Download className="w-4 h-4 mr-1" data-magicpath-id="109" data-magicpath-path="PortfolioSite.tsx" />
                            Télécharger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>)}
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
            }} className="text-center mt-12" data-magicpath-id="110" data-magicpath-path="PortfolioSite.tsx">
                <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50" data-magicpath-id="111" data-magicpath-path="PortfolioSite.tsx">
                  <BookOpen className="w-4 h-4 mr-2" data-magicpath-id="112" data-magicpath-path="PortfolioSite.tsx" />
                  Voir toute la bibliothèque
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-20 bg-slate-50" data-magicpath-id="113" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="114" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="115" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="116" data-magicpath-path="PortfolioSite.tsx">
                  Discutons de votre projet
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="117" data-magicpath-path="PortfolioSite.tsx">
                  Prêt à transformer vos données en avantage concurrentiel ? Contactez-moi pour échanger sur vos besoins.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto" data-magicpath-id="118" data-magicpath-path="PortfolioSite.tsx">
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
              }} className="space-y-8" data-magicpath-id="119" data-magicpath-path="PortfolioSite.tsx">
                  <div className="flex items-center space-x-4" data-magicpath-id="120" data-magicpath-path="PortfolioSite.tsx">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center" data-magicpath-id="121" data-magicpath-path="PortfolioSite.tsx">
                      <Mail className="w-6 h-6 text-teal-600" data-magicpath-id="122" data-magicpath-path="PortfolioSite.tsx" />
                    </div>
                    <div data-magicpath-id="123" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-slate-900" data-magicpath-id="124" data-magicpath-path="PortfolioSite.tsx">Email</h3>
                      <p className="text-slate-600" data-magicpath-id="125" data-magicpath-path="PortfolioSite.tsx">jean.dupont@example.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4" data-magicpath-id="126" data-magicpath-path="PortfolioSite.tsx">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center" data-magicpath-id="127" data-magicpath-path="PortfolioSite.tsx">
                      <Phone className="w-6 h-6 text-teal-600" data-magicpath-id="128" data-magicpath-path="PortfolioSite.tsx" />
                    </div>
                    <div data-magicpath-id="129" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-slate-900" data-magicpath-id="130" data-magicpath-path="PortfolioSite.tsx">Téléphone</h3>
                      <p className="text-slate-600" data-magicpath-id="131" data-magicpath-path="PortfolioSite.tsx">+33 6 12 34 56 78</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4" data-magicpath-id="132" data-magicpath-path="PortfolioSite.tsx">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center" data-magicpath-id="133" data-magicpath-path="PortfolioSite.tsx">
                      <MapPin className="w-6 h-6 text-teal-600" data-magicpath-id="134" data-magicpath-path="PortfolioSite.tsx" />
                    </div>
                    <div data-magicpath-id="135" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-slate-900" data-magicpath-id="136" data-magicpath-path="PortfolioSite.tsx">Localisation</h3>
                      <p className="text-slate-600" data-magicpath-id="137" data-magicpath-path="PortfolioSite.tsx">Paris, France</p>
                    </div>
                  </div>

                  <div className="pt-8" data-magicpath-id="138" data-magicpath-path="PortfolioSite.tsx">
                    <h3 className="font-semibold text-slate-900 mb-4" data-magicpath-id="139" data-magicpath-path="PortfolioSite.tsx">Suivez-moi</h3>
                    <div className="flex space-x-4" data-magicpath-id="140" data-magicpath-path="PortfolioSite.tsx">
                      <Tooltip data-magicpath-id="141" data-magicpath-path="PortfolioSite.tsx">
                        <TooltipTrigger asChild data-magicpath-id="142" data-magicpath-path="PortfolioSite.tsx">
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300" data-magicpath-id="143" data-magicpath-path="PortfolioSite.tsx">
                            <Linkedin className="w-5 h-5" data-magicpath-id="144" data-magicpath-path="PortfolioSite.tsx" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent data-magicpath-id="145" data-magicpath-path="PortfolioSite.tsx">LinkedIn</TooltipContent>
                      </Tooltip>
                      <Tooltip data-magicpath-id="146" data-magicpath-path="PortfolioSite.tsx">
                        <TooltipTrigger asChild data-magicpath-id="147" data-magicpath-path="PortfolioSite.tsx">
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300" data-magicpath-id="148" data-magicpath-path="PortfolioSite.tsx">
                            <Github className="w-5 h-5" data-magicpath-id="149" data-magicpath-path="PortfolioSite.tsx" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent data-magicpath-id="150" data-magicpath-path="PortfolioSite.tsx">GitHub</TooltipContent>
                      </Tooltip>
                      <Tooltip data-magicpath-id="151" data-magicpath-path="PortfolioSite.tsx">
                        <TooltipTrigger asChild data-magicpath-id="152" data-magicpath-path="PortfolioSite.tsx">
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300" data-magicpath-id="153" data-magicpath-path="PortfolioSite.tsx">
                            <Twitter className="w-5 h-5" data-magicpath-id="154" data-magicpath-path="PortfolioSite.tsx" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent data-magicpath-id="155" data-magicpath-path="PortfolioSite.tsx">Twitter</TooltipContent>
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
              }} data-magicpath-id="156" data-magicpath-path="PortfolioSite.tsx">
                  <Card className="border-0 shadow-lg" data-magicpath-id="157" data-magicpath-path="PortfolioSite.tsx">
                    <CardHeader data-magicpath-id="158" data-magicpath-path="PortfolioSite.tsx">
                      <CardTitle data-magicpath-id="159" data-magicpath-path="PortfolioSite.tsx">Envoyez-moi un message</CardTitle>
                      <CardDescription data-magicpath-id="160" data-magicpath-path="PortfolioSite.tsx">
                        Je vous réponds généralement sous 24h
                      </CardDescription>
                    </CardHeader>
                    <CardContent data-magicpath-id="161" data-magicpath-path="PortfolioSite.tsx">
                      <form onSubmit={handleContactSubmit} className="space-y-6" data-magicpath-id="162" data-magicpath-path="PortfolioSite.tsx">
                        <div className="space-y-2" data-magicpath-id="163" data-magicpath-path="PortfolioSite.tsx">
                          <Label htmlFor="contact-name" data-magicpath-id="164" data-magicpath-path="PortfolioSite.tsx">Nom complet</Label>
                          <Input id="contact-name" value={contactForm.name} onChange={e => setContactForm(prev => ({
                          ...prev,
                          name: e.target.value
                        }))} placeholder="Votre nom" required data-magicpath-id="165" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <div className="space-y-2" data-magicpath-id="166" data-magicpath-path="PortfolioSite.tsx">
                          <Label htmlFor="contact-email" data-magicpath-id="167" data-magicpath-path="PortfolioSite.tsx">Email</Label>
                          <Input id="contact-email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
                          ...prev,
                          email: e.target.value
                        }))} placeholder="votre@email.com" required data-magicpath-id="168" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <div className="space-y-2" data-magicpath-id="169" data-magicpath-path="PortfolioSite.tsx">
                          <Label htmlFor="contact-message" data-magicpath-id="170" data-magicpath-path="PortfolioSite.tsx">Message</Label>
                          <Textarea id="contact-message" value={contactForm.message} onChange={e => setContactForm(prev => ({
                          ...prev,
                          message: e.target.value
                        }))} placeholder="Décrivez votre projet..." rows={5} required data-magicpath-id="171" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting} data-magicpath-id="172" data-magicpath-path="PortfolioSite.tsx">
                          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                          <ArrowRight className="ml-2 h-4 w-4" data-magicpath-id="173" data-magicpath-path="PortfolioSite.tsx" />
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
        <footer className="bg-slate-900 text-white py-12" data-magicpath-id="174" data-magicpath-path="PortfolioSite.tsx">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="175" data-magicpath-path="PortfolioSite.tsx">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left" data-magicpath-id="176" data-magicpath-path="PortfolioSite.tsx">
              <div data-magicpath-id="177" data-magicpath-path="PortfolioSite.tsx">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4" data-magicpath-id="178" data-magicpath-path="PortfolioSite.tsx">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center" data-magicpath-id="179" data-magicpath-path="PortfolioSite.tsx">
                    <span className="text-white font-bold" data-magicpath-id="180" data-magicpath-path="PortfolioSite.tsx">JD</span>
                  </div>
                  <span className="font-semibold" data-magicpath-id="181" data-magicpath-path="PortfolioSite.tsx">Jean Dupont</span>
                </div>
                <p className="text-slate-400" data-magicpath-id="182" data-magicpath-path="PortfolioSite.tsx">
                  Chef de projet Data & Expert Power BI
                </p>
              </div>

              <div data-magicpath-id="183" data-magicpath-path="PortfolioSite.tsx">
                <h3 className="font-semibold mb-4" data-magicpath-id="184" data-magicpath-path="PortfolioSite.tsx">Contact</h3>
                <div className="space-y-2 text-slate-400" data-magicpath-id="185" data-magicpath-path="PortfolioSite.tsx">
                  <p data-magicpath-id="186" data-magicpath-path="PortfolioSite.tsx">jean.dupont@example.com</p>
                  <p data-magicpath-id="187" data-magicpath-path="PortfolioSite.tsx">+33 6 12 34 56 78</p>
                  <p data-magicpath-id="188" data-magicpath-path="PortfolioSite.tsx">Paris, France</p>
                </div>
              </div>

              <div data-magicpath-id="189" data-magicpath-path="PortfolioSite.tsx">
                <h3 className="font-semibold mb-4" data-magicpath-id="190" data-magicpath-path="PortfolioSite.tsx">Suivez-moi</h3>
                <div className="flex space-x-4 justify-center md:justify-start" data-magicpath-id="191" data-magicpath-path="PortfolioSite.tsx">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" data-magicpath-id="192" data-magicpath-path="PortfolioSite.tsx">
                    <Linkedin className="w-5 h-5" data-magicpath-id="193" data-magicpath-path="PortfolioSite.tsx" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" data-magicpath-id="194" data-magicpath-path="PortfolioSite.tsx">
                    <Github className="w-5 h-5" data-magicpath-id="195" data-magicpath-path="PortfolioSite.tsx" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" data-magicpath-id="196" data-magicpath-path="PortfolioSite.tsx">
                    <Twitter className="w-5 h-5" data-magicpath-id="197" data-magicpath-path="PortfolioSite.tsx" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-8 bg-slate-800" data-magicpath-id="198" data-magicpath-path="PortfolioSite.tsx" />
            
            <div className="text-center text-slate-400" data-magicpath-id="199" data-magicpath-path="PortfolioSite.tsx">
              <p data-magicpath-id="200" data-magicpath-path="PortfolioSite.tsx">&copy; 2024 Jean Dupont. Tous droits réservés.</p>
            </div>
          </div>
        </footer>

        {/* Contact Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen} data-magicpath-id="201" data-magicpath-path="PortfolioSite.tsx">
          <DialogContent className="max-w-md" data-magicpath-id="202" data-magicpath-path="PortfolioSite.tsx">
            <DialogHeader data-magicpath-id="203" data-magicpath-path="PortfolioSite.tsx">
              <DialogTitle data-magicpath-id="204" data-magicpath-path="PortfolioSite.tsx">Me contacter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContactSubmit} className="space-y-4" data-magicpath-id="205" data-magicpath-path="PortfolioSite.tsx">
              <div className="space-y-2" data-magicpath-id="206" data-magicpath-path="PortfolioSite.tsx">
                <Label htmlFor="modal-name" data-magicpath-id="207" data-magicpath-path="PortfolioSite.tsx">Nom complet</Label>
                <Input id="modal-name" value={contactForm.name} onChange={e => setContactForm(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Votre nom" required data-magicpath-id="208" data-magicpath-path="PortfolioSite.tsx" />
              </div>
              <div className="space-y-2" data-magicpath-id="209" data-magicpath-path="PortfolioSite.tsx">
                <Label htmlFor="modal-email" data-magicpath-id="210" data-magicpath-path="PortfolioSite.tsx">Email</Label>
                <Input id="modal-email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
                ...prev,
                email: e.target.value
              }))} placeholder="votre@email.com" required data-magicpath-id="211" data-magicpath-path="PortfolioSite.tsx" />
              </div>
              <div className="space-y-2" data-magicpath-id="212" data-magicpath-path="PortfolioSite.tsx">
                <Label htmlFor="modal-message" data-magicpath-id="213" data-magicpath-path="PortfolioSite.tsx">Message</Label>
                <Textarea id="modal-message" value={contactForm.message} onChange={e => setContactForm(prev => ({
                ...prev,
                message: e.target.value
              }))} placeholder="Décrivez votre projet..." rows={4} required data-magicpath-id="214" data-magicpath-path="PortfolioSite.tsx" />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting} data-magicpath-id="215" data-magicpath-path="PortfolioSite.tsx">
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>;
}