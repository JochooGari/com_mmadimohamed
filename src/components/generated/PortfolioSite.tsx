"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, Download, Mail, Phone, MapPin, ExternalLink, ChevronLeft, ChevronRight, Star, Quote, BarChart3, Database, GraduationCap, Users, Github, Linkedin, Twitter, ArrowRight, CheckCircle, Eye, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
export interface PortfolioSiteProps {
  className?: string;
  mpid?: string;
}

// Demo data
const navigationItems = [{
  id: "about",
  label: "À propos",
  href: "#about",
  mpid: "f73d75d0-72a0-4358-908e-8e3ddd3cc8d3"
}, {
  id: "services",
  label: "Services",
  href: "#services",
  mpid: "cdd4b6f2-4e5e-4c01-ae99-2eaf10f601ea"
}, {
  id: "projects",
  label: "Projets",
  href: "#projects",
  mpid: "9bce7a31-4ff8-4984-b9c0-b0b6f43f8774"
}, {
  id: "testimonials",
  label: "Témoignages",
  href: "#testimonials",
  mpid: "3378bb00-b23f-4f98-a36f-6dd3557b9eba"
}, {
  id: "contact",
  label: "Contact",
  href: "#contact",
  mpid: "09a3bb2d-c7b9-49e9-93e4-7756ca09139f"
}] as any[];
const services = [{
  id: "data-strategy",
  title: "Stratégie Data",
  description: "Définition de votre roadmap data et mise en place d'une gouvernance efficace",
  icon: Database,
  features: ["Audit data", "Roadmap stratégique", "Gouvernance", "KPIs métier"],
  mpid: "cd47a319-c6ce-4a59-8944-e2e92e4e7dcc"
}, {
  id: "powerbi-dashboards",
  title: "Tableaux de Bord Power BI",
  description: "Création de dashboards interactifs et performants pour vos équipes",
  icon: BarChart3,
  features: ["Dashboards interactifs", "Modélisation", "Optimisation", "Formation utilisateurs"],
  mpid: "da16df97-81d1-4d77-933f-92438e2d15ee"
}, {
  id: "training",
  title: "Formation & Accompagnement",
  description: "Montée en compétences de vos équipes sur les outils de Business Intelligence",
  icon: GraduationCap,
  features: ["Formation Power BI", "Coaching équipes", "Best practices", "Support continu"],
  mpid: "cebaba5a-b029-4926-a1c3-29679b290091"
}] as any[];
const projects = [{
  id: "retail-dashboard",
  title: "Dashboard Retail Analytics",
  description: "Tableau de bord complet pour une chaîne de magasins avec analyse des ventes, stocks et performance par point de vente.",
  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
  category: "Power BI",
  duration: "3 mois",
  technologies: ["Power BI", "SQL Server", "Azure"],
  results: "+25% efficacité reporting",
  mpid: "569bcf35-8fec-43d4-91ec-452821bedaa1"
}, {
  id: "finance-reporting",
  title: "Reporting Financier Automatisé",
  description: "Automatisation complète du reporting financier mensuel avec consolidation multi-entités et alertes automatiques.",
  image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
  category: "Automatisation",
  duration: "4 mois",
  technologies: ["Power Automate", "Excel", "SharePoint"],
  results: "-80% temps de reporting",
  mpid: "504657b4-79f4-434f-a7c0-530e1958349f"
}, {
  id: "hr-analytics",
  title: "Analytics RH & Talent Management",
  description: "Plateforme d'analyse RH complète avec suivi des performances, turnover et prédiction des besoins en recrutement.",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
  category: "Analytics",
  duration: "6 mois",
  technologies: ["Power BI", "Python", "Azure ML"],
  results: "+30% rétention talents",
  mpid: "7931ee48-c6c9-4b5c-8da6-2584e5f12a6b"
}, {
  id: "supply-chain",
  title: "Optimisation Supply Chain",
  description: "Dashboard temps réel pour le suivi de la chaîne d'approvisionnement avec prédiction des ruptures de stock.",
  image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop",
  category: "Supply Chain",
  duration: "5 mois",
  technologies: ["Power BI", "SAP", "Azure"],
  results: "-15% coûts logistiques",
  mpid: "38dc7373-6882-4c1a-9721-e72567c9f1ac"
}, {
  id: "marketing-roi",
  title: "ROI Marketing Digital",
  description: "Mesure de performance des campagnes marketing avec attribution multi-touch et optimisation budgétaire.",
  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  category: "Marketing",
  duration: "2 mois",
  technologies: ["Google Analytics", "Power BI", "Facebook API"],
  results: "+40% ROI campagnes",
  mpid: "bc6c77f5-c8ce-47e0-83da-5365cd35f9b4"
}, {
  id: "quality-control",
  title: "Contrôle Qualité Industriel",
  description: "Système de monitoring qualité en temps réel avec alertes automatiques et analyse des tendances de défauts.",
  image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
  category: "Industrie",
  duration: "4 mois",
  technologies: ["Power BI", "IoT", "Azure"],
  results: "-50% défauts qualité",
  mpid: "1687bfd4-e85d-4699-846f-c810dfd9318e"
}] as any[];
const testimonials = [{
  id: "client-1",
  name: "Marie Dubois",
  role: "Directrice Générale",
  company: "TechCorp Solutions",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  quote: "Un accompagnement exceptionnel qui a transformé notre approche de la data. Les dashboards créés nous font gagner un temps précieux et nous donnent une visibilité inégalée sur notre activité.",
  rating: 5,
  project: "Dashboard Retail Analytics",
  mpid: "d796edd9-7f6a-4a52-a699-ddc8de9f46e0"
}, {
  id: "client-2",
  name: "Pierre Martin",
  role: "CFO",
  company: "InnovateFin",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  quote: "L'automatisation de notre reporting financier a été un game-changer. Nous avons divisé par 4 le temps consacré aux rapports mensuels tout en améliorant leur qualité et leur fiabilité.",
  rating: 5,
  project: "Reporting Financier Automatisé",
  mpid: "b7809229-c0e4-44d6-850b-b753cc83d82f"
}, {
  id: "client-3",
  name: "Sophie Leroy",
  role: "DRH",
  company: "HumanFirst",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  quote: "Les insights RH que nous obtenons maintenant nous permettent de prendre des décisions éclairées sur nos talents. La prédiction des besoins en recrutement est particulièrement précieuse.",
  rating: 5,
  project: "Analytics RH & Talent Management",
  mpid: "1ce42076-e347-437f-8002-4acb55b3ab44"
}] as any[];
const skills = ["Power BI", "SQL Server", "Azure", "Python", "Excel", "Power Automate", "Tableau", "Qlik Sense", "Google Analytics", "Data Modeling", "ETL", "DAX"];
export default function PortfolioSite({
  className
}: PortfolioSiteProps) {
  const [activeSection, setActiveSection] = useState("hero");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
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
                {navigationItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn("relative px-3 py-2 text-sm font-medium transition-colors hover:text-teal-600", activeSection === item.id ? "text-teal-600" : "text-slate-600")} data-magicpath-uuid={(item as any)["mpid"] ?? "unsafe"} data-magicpath-field="label:string" data-magicpath-id="10" data-magicpath-path="PortfolioSite.tsx">
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
                    {navigationItems.map(item => <button key={item.id} onClick={() => scrollToSection(item.id)} className={cn("text-left px-4 py-3 rounded-lg text-lg font-medium transition-colors", activeSection === item.id ? "bg-teal-50 text-teal-600" : "text-slate-600 hover:bg-slate-50")} data-magicpath-uuid={(item as any)["mpid"] ?? "unsafe"} data-magicpath-field="label:string" data-magicpath-id="21" data-magicpath-path="PortfolioSite.tsx">
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
          {/* Hero Section */}
          <section id="hero" className="relative pt-16 pb-20 sm:pb-24 lg:pb-32 overflow-hidden" data-magicpath-id="25" data-magicpath-path="PortfolioSite.tsx">
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

          {/* About Section */}
          <section id="about" className="py-20 bg-white" data-magicpath-id="44" data-magicpath-path="PortfolioSite.tsx">
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
                  À propos de moi
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="48" data-magicpath-path="PortfolioSite.tsx">
                  Passionné par la data et fort de plus de 8 ans d'expérience, j'accompagne les entreprises dans leur transformation digitale.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 items-center" data-magicpath-id="49" data-magicpath-path="PortfolioSite.tsx">
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
              }} className="text-center lg:text-left" data-magicpath-id="50" data-magicpath-path="PortfolioSite.tsx">
                  <Avatar className="w-48 h-48 mx-auto lg:mx-0 mb-8" data-magicpath-id="51" data-magicpath-path="PortfolioSite.tsx">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" alt="Jean Dupont - Chef de projet Data" data-magicpath-id="52" data-magicpath-path="PortfolioSite.tsx" />
                    <AvatarFallback className="text-4xl" data-magicpath-id="53" data-magicpath-path="PortfolioSite.tsx">JD</AvatarFallback>
                  </Avatar>
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
              }} className="space-y-6" data-magicpath-id="54" data-magicpath-path="PortfolioSite.tsx">
                  <p className="text-lg text-slate-700 leading-relaxed" data-magicpath-id="55" data-magicpath-path="PortfolioSite.tsx">
                    Diplômé d'une école d'ingénieur et certifié Microsoft Power BI, je me spécialise dans la conception et la mise en œuvre de solutions de Business Intelligence qui transforment les données brutes en insights actionnables.
                  </p>
                  
                  <p className="text-lg text-slate-700 leading-relaxed" data-magicpath-id="56" data-magicpath-path="PortfolioSite.tsx">
                    Mon approche combine expertise technique et vision métier pour créer des tableaux de bord qui répondent vraiment aux besoins des utilisateurs finaux. J'ai eu le privilège d'accompagner plus de 50 entreprises dans leur démarche data-driven.
                  </p>

                  <div className="grid grid-cols-2 gap-6 mt-8" data-magicpath-id="57" data-magicpath-path="PortfolioSite.tsx">
                    <div className="text-center p-4 bg-teal-50 rounded-lg" data-magicpath-id="58" data-magicpath-path="PortfolioSite.tsx">
                      <div className="text-3xl font-bold text-teal-600 mb-2" data-magicpath-id="59" data-magicpath-path="PortfolioSite.tsx">50+</div>
                      <div className="text-sm text-slate-600" data-magicpath-id="60" data-magicpath-path="PortfolioSite.tsx">Projets réalisés</div>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-lg" data-magicpath-id="61" data-magicpath-path="PortfolioSite.tsx">
                      <div className="text-3xl font-bold text-teal-600 mb-2" data-magicpath-id="62" data-magicpath-path="PortfolioSite.tsx">8+</div>
                      <div className="text-sm text-slate-600" data-magicpath-id="63" data-magicpath-path="PortfolioSite.tsx">Années d'expérience</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6" data-magicpath-id="64" data-magicpath-path="PortfolioSite.tsx">
                    {skills.map(skill => <Badge key={skill} variant="outline" className="border-teal-200 text-teal-700" data-magicpath-id="65" data-magicpath-path="PortfolioSite.tsx">
                        {skill}
                      </Badge>)}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-20 bg-slate-50" data-magicpath-id="66" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="67" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="68" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="69" data-magicpath-path="PortfolioSite.tsx">
                  Mes Services
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="70" data-magicpath-path="PortfolioSite.tsx">
                  Des solutions sur mesure pour transformer vos données en avantage concurrentiel
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-magicpath-id="71" data-magicpath-path="PortfolioSite.tsx">
                {services.map((service, index) => <motion.div key={service.id} initial={{
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
              }} data-magicpath-id="72" data-magicpath-path="PortfolioSite.tsx">
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-md" data-magicpath-id="73" data-magicpath-path="PortfolioSite.tsx">
                      <CardHeader className="text-center pb-4" data-magicpath-id="74" data-magicpath-path="PortfolioSite.tsx">
                        <motion.div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors" whileHover={{
                      scale: 1.1
                    }} transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }} data-magicpath-id="75" data-magicpath-path="PortfolioSite.tsx">
                          <service.icon className="w-8 h-8 text-teal-600" data-magicpath-id="76" data-magicpath-path="PortfolioSite.tsx" />
                        </motion.div>
                        <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-teal-600 transition-colors" data-magicpath-uuid={(service as any)["mpid"] ?? "unsafe"} data-magicpath-field="title:string" data-magicpath-id="77" data-magicpath-path="PortfolioSite.tsx">
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center" data-magicpath-id="78" data-magicpath-path="PortfolioSite.tsx">
                        <CardDescription className="text-slate-600 mb-6 leading-relaxed" data-magicpath-uuid={(service as any)["mpid"] ?? "unsafe"} data-magicpath-field="description:string" data-magicpath-id="79" data-magicpath-path="PortfolioSite.tsx">
                          {service.description}
                        </CardDescription>
                        <ul className="space-y-2" data-magicpath-id="80" data-magicpath-path="PortfolioSite.tsx">
                          {service.features.map(feature => <li key={feature} className="flex items-center text-sm text-slate-600" data-magicpath-id="81" data-magicpath-path="PortfolioSite.tsx">
                              <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" data-magicpath-id="82" data-magicpath-path="PortfolioSite.tsx" />
                              {feature}
                            </li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="py-20 bg-white" data-magicpath-id="83" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="84" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="85" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="86" data-magicpath-path="PortfolioSite.tsx">
                  Projets Réalisés
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="87" data-magicpath-path="PortfolioSite.tsx">
                  Découvrez quelques-unes de mes réalisations qui ont transformé la prise de décision de mes clients
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-magicpath-id="88" data-magicpath-path="PortfolioSite.tsx">
                {projects.map((project, index) => <motion.div key={project.id} initial={{
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
              }} data-magicpath-id="89" data-magicpath-path="PortfolioSite.tsx">
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer border-0 shadow-md overflow-hidden" onClick={() => setSelectedProject(project)} data-magicpath-id="90" data-magicpath-path="PortfolioSite.tsx">
                      <div className="relative overflow-hidden" data-magicpath-id="91" data-magicpath-path="PortfolioSite.tsx">
                        <img src={project.image} alt={project.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" data-magicpath-uuid={(project as any)["mpid"] ?? "unsafe"} data-magicpath-field="image:string" data-magicpath-id="92" data-magicpath-path="PortfolioSite.tsx" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center" data-magicpath-id="93" data-magicpath-path="PortfolioSite.tsx">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-magicpath-id="94" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <Badge className="absolute top-3 left-3 bg-teal-600 text-white" data-magicpath-uuid={(project as any)["mpid"] ?? "unsafe"} data-magicpath-field="category:string" data-magicpath-id="95" data-magicpath-path="PortfolioSite.tsx">
                          {project.category}
                        </Badge>
                      </div>
                      <CardHeader data-magicpath-id="96" data-magicpath-path="PortfolioSite.tsx">
                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors" data-magicpath-uuid={(project as any)["mpid"] ?? "unsafe"} data-magicpath-field="title:string" data-magicpath-id="97" data-magicpath-path="PortfolioSite.tsx">
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent data-magicpath-id="98" data-magicpath-path="PortfolioSite.tsx">
                        <CardDescription className="text-slate-600 mb-4 line-clamp-3" data-magicpath-uuid={(project as any)["mpid"] ?? "unsafe"} data-magicpath-field="description:string" data-magicpath-id="99" data-magicpath-path="PortfolioSite.tsx">
                          {project.description}
                        </CardDescription>
                        <div className="flex items-center justify-between text-sm text-slate-500" data-magicpath-id="100" data-magicpath-path="PortfolioSite.tsx">
                          <div className="flex items-center" data-magicpath-uuid={(project as any)["mpid"] ?? "unsafe"} data-magicpath-field="duration:string" data-magicpath-id="101" data-magicpath-path="PortfolioSite.tsx">
                            <Calendar className="w-4 h-4 mr-1" data-magicpath-id="102" data-magicpath-path="PortfolioSite.tsx" />
                            {project.duration}
                          </div>
                          <div className="flex items-center" data-magicpath-uuid={(project as any)["mpid"] ?? "unsafe"} data-magicpath-field="results:string" data-magicpath-id="103" data-magicpath-path="PortfolioSite.tsx">
                            <Award className="w-4 h-4 mr-1" data-magicpath-id="104" data-magicpath-path="PortfolioSite.tsx" />
                            {project.results}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-20 bg-slate-50" data-magicpath-id="105" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="106" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="107" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="108" data-magicpath-path="PortfolioSite.tsx">
                  Témoignages Clients
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="109" data-magicpath-path="PortfolioSite.tsx">
                  Ce que disent mes clients de notre collaboration
                </p>
              </motion.div>

              <Carousel className="max-w-4xl mx-auto" data-magicpath-id="110" data-magicpath-path="PortfolioSite.tsx">
                <CarouselContent data-magicpath-id="111" data-magicpath-path="PortfolioSite.tsx">
                  {testimonials.map(testimonial => <CarouselItem key={testimonial.id} data-magicpath-id="112" data-magicpath-path="PortfolioSite.tsx">
                      <motion.div initial={{
                    opacity: 0,
                    scale: 0.9
                  }} whileInView={{
                    opacity: 1,
                    scale: 1
                  }} transition={{
                    duration: 0.8
                  }} viewport={{
                    once: true
                  }} data-magicpath-id="113" data-magicpath-path="PortfolioSite.tsx">
                        <Card className="border-0 shadow-lg" data-magicpath-id="114" data-magicpath-path="PortfolioSite.tsx">
                          <CardContent className="p-8 text-center" data-magicpath-id="115" data-magicpath-path="PortfolioSite.tsx">
                            <Quote className="w-12 h-12 text-teal-500 mx-auto mb-6" data-magicpath-id="116" data-magicpath-path="PortfolioSite.tsx" />
                            <blockquote className="text-lg text-slate-700 mb-6 leading-relaxed italic" data-magicpath-uuid={(testimonial as any)["mpid"] ?? "unsafe"} data-magicpath-field="quote:string" data-magicpath-id="117" data-magicpath-path="PortfolioSite.tsx">
                              "{testimonial.quote}"
                            </blockquote>
                            <div className="flex items-center justify-center mb-4" data-magicpath-id="118" data-magicpath-path="PortfolioSite.tsx">
                              {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" data-magicpath-id="119" data-magicpath-path="PortfolioSite.tsx" />)}
                            </div>
                            <div className="flex items-center justify-center space-x-4" data-magicpath-id="120" data-magicpath-path="PortfolioSite.tsx">
                              <Avatar className="w-12 h-12" data-magicpath-id="121" data-magicpath-path="PortfolioSite.tsx">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-magicpath-uuid={(testimonial as any)["mpid"] ?? "unsafe"} data-magicpath-field="avatar:string" data-magicpath-id="122" data-magicpath-path="PortfolioSite.tsx" />
                                <AvatarFallback data-magicpath-id="123" data-magicpath-path="PortfolioSite.tsx">{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="text-left" data-magicpath-id="124" data-magicpath-path="PortfolioSite.tsx">
                                <div className="font-semibold text-slate-900" data-magicpath-uuid={(testimonial as any)["mpid"] ?? "unsafe"} data-magicpath-field="name:string" data-magicpath-id="125" data-magicpath-path="PortfolioSite.tsx">{testimonial.name}</div>
                                <div className="text-sm text-slate-600" data-magicpath-uuid={(testimonial as any)["mpid"] ?? "unsafe"} data-magicpath-field="role:string" data-magicpath-id="126" data-magicpath-path="PortfolioSite.tsx">{testimonial.role}</div>
                                <div className="text-sm text-teal-600" data-magicpath-uuid={(testimonial as any)["mpid"] ?? "unsafe"} data-magicpath-field="company:string" data-magicpath-id="127" data-magicpath-path="PortfolioSite.tsx">{testimonial.company}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious data-magicpath-id="128" data-magicpath-path="PortfolioSite.tsx" />
                <CarouselNext data-magicpath-id="129" data-magicpath-path="PortfolioSite.tsx" />
              </Carousel>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-20 bg-white" data-magicpath-id="130" data-magicpath-path="PortfolioSite.tsx">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="131" data-magicpath-path="PortfolioSite.tsx">
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
            }} className="text-center mb-16" data-magicpath-id="132" data-magicpath-path="PortfolioSite.tsx">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" data-magicpath-id="133" data-magicpath-path="PortfolioSite.tsx">
                  Discutons de votre projet
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-magicpath-id="134" data-magicpath-path="PortfolioSite.tsx">
                  Prêt à transformer vos données en avantage concurrentiel ? Contactez-moi pour échanger sur vos besoins.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto" data-magicpath-id="135" data-magicpath-path="PortfolioSite.tsx">
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
              }} className="space-y-8" data-magicpath-id="136" data-magicpath-path="PortfolioSite.tsx">
                  <div className="flex items-center space-x-4" data-magicpath-id="137" data-magicpath-path="PortfolioSite.tsx">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center" data-magicpath-id="138" data-magicpath-path="PortfolioSite.tsx">
                      <Mail className="w-6 h-6 text-teal-600" data-magicpath-id="139" data-magicpath-path="PortfolioSite.tsx" />
                    </div>
                    <div data-magicpath-id="140" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-slate-900" data-magicpath-id="141" data-magicpath-path="PortfolioSite.tsx">Email</h3>
                      <p className="text-slate-600" data-magicpath-id="142" data-magicpath-path="PortfolioSite.tsx">jean.dupont@example.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4" data-magicpath-id="143" data-magicpath-path="PortfolioSite.tsx">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center" data-magicpath-id="144" data-magicpath-path="PortfolioSite.tsx">
                      <Phone className="w-6 h-6 text-teal-600" data-magicpath-id="145" data-magicpath-path="PortfolioSite.tsx" />
                    </div>
                    <div data-magicpath-id="146" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-slate-900" data-magicpath-id="147" data-magicpath-path="PortfolioSite.tsx">Téléphone</h3>
                      <p className="text-slate-600" data-magicpath-id="148" data-magicpath-path="PortfolioSite.tsx">+33 6 12 34 56 78</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4" data-magicpath-id="149" data-magicpath-path="PortfolioSite.tsx">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center" data-magicpath-id="150" data-magicpath-path="PortfolioSite.tsx">
                      <MapPin className="w-6 h-6 text-teal-600" data-magicpath-id="151" data-magicpath-path="PortfolioSite.tsx" />
                    </div>
                    <div data-magicpath-id="152" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-slate-900" data-magicpath-id="153" data-magicpath-path="PortfolioSite.tsx">Localisation</h3>
                      <p className="text-slate-600" data-magicpath-id="154" data-magicpath-path="PortfolioSite.tsx">Paris, France</p>
                    </div>
                  </div>

                  <div className="pt-8" data-magicpath-id="155" data-magicpath-path="PortfolioSite.tsx">
                    <h3 className="font-semibold text-slate-900 mb-4" data-magicpath-id="156" data-magicpath-path="PortfolioSite.tsx">Suivez-moi</h3>
                    <div className="flex space-x-4" data-magicpath-id="157" data-magicpath-path="PortfolioSite.tsx">
                      <Tooltip data-magicpath-id="158" data-magicpath-path="PortfolioSite.tsx">
                        <TooltipTrigger asChild data-magicpath-id="159" data-magicpath-path="PortfolioSite.tsx">
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300" data-magicpath-id="160" data-magicpath-path="PortfolioSite.tsx">
                            <Linkedin className="w-5 h-5" data-magicpath-id="161" data-magicpath-path="PortfolioSite.tsx" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent data-magicpath-id="162" data-magicpath-path="PortfolioSite.tsx">LinkedIn</TooltipContent>
                      </Tooltip>
                      <Tooltip data-magicpath-id="163" data-magicpath-path="PortfolioSite.tsx">
                        <TooltipTrigger asChild data-magicpath-id="164" data-magicpath-path="PortfolioSite.tsx">
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300" data-magicpath-id="165" data-magicpath-path="PortfolioSite.tsx">
                            <Github className="w-5 h-5" data-magicpath-id="166" data-magicpath-path="PortfolioSite.tsx" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent data-magicpath-id="167" data-magicpath-path="PortfolioSite.tsx">GitHub</TooltipContent>
                      </Tooltip>
                      <Tooltip data-magicpath-id="168" data-magicpath-path="PortfolioSite.tsx">
                        <TooltipTrigger asChild data-magicpath-id="169" data-magicpath-path="PortfolioSite.tsx">
                          <Button variant="outline" size="icon" className="hover:bg-teal-50 hover:border-teal-300" data-magicpath-id="170" data-magicpath-path="PortfolioSite.tsx">
                            <Twitter className="w-5 h-5" data-magicpath-id="171" data-magicpath-path="PortfolioSite.tsx" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent data-magicpath-id="172" data-magicpath-path="PortfolioSite.tsx">Twitter</TooltipContent>
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
              }} data-magicpath-id="173" data-magicpath-path="PortfolioSite.tsx">
                  <Card className="border-0 shadow-lg" data-magicpath-id="174" data-magicpath-path="PortfolioSite.tsx">
                    <CardHeader data-magicpath-id="175" data-magicpath-path="PortfolioSite.tsx">
                      <CardTitle data-magicpath-id="176" data-magicpath-path="PortfolioSite.tsx">Envoyez-moi un message</CardTitle>
                      <CardDescription data-magicpath-id="177" data-magicpath-path="PortfolioSite.tsx">
                        Je vous réponds généralement sous 24h
                      </CardDescription>
                    </CardHeader>
                    <CardContent data-magicpath-id="178" data-magicpath-path="PortfolioSite.tsx">
                      <form onSubmit={handleContactSubmit} className="space-y-6" data-magicpath-id="179" data-magicpath-path="PortfolioSite.tsx">
                        <div className="space-y-2" data-magicpath-id="180" data-magicpath-path="PortfolioSite.tsx">
                          <Label htmlFor="contact-name" data-magicpath-id="181" data-magicpath-path="PortfolioSite.tsx">Nom complet</Label>
                          <Input id="contact-name" value={contactForm.name} onChange={e => setContactForm(prev => ({
                          ...prev,
                          name: e.target.value
                        }))} placeholder="Votre nom" required data-magicpath-id="182" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <div className="space-y-2" data-magicpath-id="183" data-magicpath-path="PortfolioSite.tsx">
                          <Label htmlFor="contact-email" data-magicpath-id="184" data-magicpath-path="PortfolioSite.tsx">Email</Label>
                          <Input id="contact-email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
                          ...prev,
                          email: e.target.value
                        }))} placeholder="votre@email.com" required data-magicpath-id="185" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <div className="space-y-2" data-magicpath-id="186" data-magicpath-path="PortfolioSite.tsx">
                          <Label htmlFor="contact-message" data-magicpath-id="187" data-magicpath-path="PortfolioSite.tsx">Message</Label>
                          <Textarea id="contact-message" value={contactForm.message} onChange={e => setContactForm(prev => ({
                          ...prev,
                          message: e.target.value
                        }))} placeholder="Décrivez votre projet..." rows={5} required data-magicpath-id="188" data-magicpath-path="PortfolioSite.tsx" />
                        </div>
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting} data-magicpath-id="189" data-magicpath-path="PortfolioSite.tsx">
                          {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                          <ArrowRight className="ml-2 h-4 w-4" data-magicpath-id="190" data-magicpath-path="PortfolioSite.tsx" />
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
        <footer className="bg-slate-900 text-white py-12" data-magicpath-id="191" data-magicpath-path="PortfolioSite.tsx">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8" data-magicpath-id="192" data-magicpath-path="PortfolioSite.tsx">
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left" data-magicpath-id="193" data-magicpath-path="PortfolioSite.tsx">
              <div data-magicpath-id="194" data-magicpath-path="PortfolioSite.tsx">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4" data-magicpath-id="195" data-magicpath-path="PortfolioSite.tsx">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center" data-magicpath-id="196" data-magicpath-path="PortfolioSite.tsx">
                    <span className="text-white font-bold" data-magicpath-id="197" data-magicpath-path="PortfolioSite.tsx">JD</span>
                  </div>
                  <span className="font-semibold" data-magicpath-id="198" data-magicpath-path="PortfolioSite.tsx">Jean Dupont</span>
                </div>
                <p className="text-slate-400" data-magicpath-id="199" data-magicpath-path="PortfolioSite.tsx">
                  Chef de projet Data & Expert Power BI
                </p>
              </div>

              <div data-magicpath-id="200" data-magicpath-path="PortfolioSite.tsx">
                <h3 className="font-semibold mb-4" data-magicpath-id="201" data-magicpath-path="PortfolioSite.tsx">Contact</h3>
                <div className="space-y-2 text-slate-400" data-magicpath-id="202" data-magicpath-path="PortfolioSite.tsx">
                  <p data-magicpath-id="203" data-magicpath-path="PortfolioSite.tsx">jean.dupont@example.com</p>
                  <p data-magicpath-id="204" data-magicpath-path="PortfolioSite.tsx">+33 6 12 34 56 78</p>
                  <p data-magicpath-id="205" data-magicpath-path="PortfolioSite.tsx">Paris, France</p>
                </div>
              </div>

              <div data-magicpath-id="206" data-magicpath-path="PortfolioSite.tsx">
                <h3 className="font-semibold mb-4" data-magicpath-id="207" data-magicpath-path="PortfolioSite.tsx">Suivez-moi</h3>
                <div className="flex space-x-4 justify-center md:justify-start" data-magicpath-id="208" data-magicpath-path="PortfolioSite.tsx">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" data-magicpath-id="209" data-magicpath-path="PortfolioSite.tsx">
                    <Linkedin className="w-5 h-5" data-magicpath-id="210" data-magicpath-path="PortfolioSite.tsx" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" data-magicpath-id="211" data-magicpath-path="PortfolioSite.tsx">
                    <Github className="w-5 h-5" data-magicpath-id="212" data-magicpath-path="PortfolioSite.tsx" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800" data-magicpath-id="213" data-magicpath-path="PortfolioSite.tsx">
                    <Twitter className="w-5 h-5" data-magicpath-id="214" data-magicpath-path="PortfolioSite.tsx" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-8 bg-slate-800" data-magicpath-id="215" data-magicpath-path="PortfolioSite.tsx" />
            
            <div className="text-center text-slate-400" data-magicpath-id="216" data-magicpath-path="PortfolioSite.tsx">
              <p data-magicpath-id="217" data-magicpath-path="PortfolioSite.tsx">&copy; 2024 Jean Dupont. Tous droits réservés.</p>
            </div>
          </div>
        </footer>

        {/* Project Modal */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)} data-magicpath-id="218" data-magicpath-path="PortfolioSite.tsx">
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-magicpath-id="219" data-magicpath-path="PortfolioSite.tsx">
            {selectedProject && <>
                <DialogHeader data-magicpath-id="220" data-magicpath-path="PortfolioSite.tsx">
                  <DialogTitle className="text-2xl" data-magicpath-id="221" data-magicpath-path="PortfolioSite.tsx">{selectedProject.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6" data-magicpath-id="222" data-magicpath-path="PortfolioSite.tsx">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-64 object-cover rounded-lg" data-magicpath-id="223" data-magicpath-path="PortfolioSite.tsx" />
                  <div className="grid md:grid-cols-2 gap-6" data-magicpath-id="224" data-magicpath-path="PortfolioSite.tsx">
                    <div data-magicpath-id="225" data-magicpath-path="PortfolioSite.tsx">
                      <h3 className="font-semibold text-lg mb-3" data-magicpath-id="226" data-magicpath-path="PortfolioSite.tsx">Description</h3>
                      <p className="text-slate-600 leading-relaxed" data-magicpath-id="227" data-magicpath-path="PortfolioSite.tsx">
                        {selectedProject.description}
                      </p>
                    </div>
                    <div className="space-y-4" data-magicpath-id="228" data-magicpath-path="PortfolioSite.tsx">
                      <div data-magicpath-id="229" data-magicpath-path="PortfolioSite.tsx">
                        <h4 className="font-medium text-slate-900 mb-2" data-magicpath-id="230" data-magicpath-path="PortfolioSite.tsx">Catégorie</h4>
                        <Badge className="bg-teal-600 text-white" data-magicpath-id="231" data-magicpath-path="PortfolioSite.tsx">{selectedProject.category}</Badge>
                      </div>
                      <div data-magicpath-id="232" data-magicpath-path="PortfolioSite.tsx">
                        <h4 className="font-medium text-slate-900 mb-2" data-magicpath-id="233" data-magicpath-path="PortfolioSite.tsx">Durée</h4>
                        <p className="text-slate-600" data-magicpath-id="234" data-magicpath-path="PortfolioSite.tsx">{selectedProject.duration}</p>
                      </div>
                      <div data-magicpath-id="235" data-magicpath-path="PortfolioSite.tsx">
                        <h4 className="font-medium text-slate-900 mb-2" data-magicpath-id="236" data-magicpath-path="PortfolioSite.tsx">Technologies</h4>
                        <div className="flex flex-wrap gap-2" data-magicpath-id="237" data-magicpath-path="PortfolioSite.tsx">
                          {selectedProject.technologies.map(tech => <Badge key={tech} variant="outline" data-magicpath-id="238" data-magicpath-path="PortfolioSite.tsx">{tech}</Badge>)}
                        </div>
                      </div>
                      <div data-magicpath-id="239" data-magicpath-path="PortfolioSite.tsx">
                        <h4 className="font-medium text-slate-900 mb-2" data-magicpath-id="240" data-magicpath-path="PortfolioSite.tsx">Résultats</h4>
                        <p className="text-teal-600 font-medium" data-magicpath-id="241" data-magicpath-path="PortfolioSite.tsx">{selectedProject.results}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>}
          </DialogContent>
        </Dialog>

        {/* Contact Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen} data-magicpath-id="242" data-magicpath-path="PortfolioSite.tsx">
          <DialogContent className="max-w-md" data-magicpath-id="243" data-magicpath-path="PortfolioSite.tsx">
            <DialogHeader data-magicpath-id="244" data-magicpath-path="PortfolioSite.tsx">
              <DialogTitle data-magicpath-id="245" data-magicpath-path="PortfolioSite.tsx">Me contacter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleContactSubmit} className="space-y-4" data-magicpath-id="246" data-magicpath-path="PortfolioSite.tsx">
              <div className="space-y-2" data-magicpath-id="247" data-magicpath-path="PortfolioSite.tsx">
                <Label htmlFor="modal-name" data-magicpath-id="248" data-magicpath-path="PortfolioSite.tsx">Nom complet</Label>
                <Input id="modal-name" value={contactForm.name} onChange={e => setContactForm(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Votre nom" required data-magicpath-id="249" data-magicpath-path="PortfolioSite.tsx" />
              </div>
              <div className="space-y-2" data-magicpath-id="250" data-magicpath-path="PortfolioSite.tsx">
                <Label htmlFor="modal-email" data-magicpath-id="251" data-magicpath-path="PortfolioSite.tsx">Email</Label>
                <Input id="modal-email" type="email" value={contactForm.email} onChange={e => setContactForm(prev => ({
                ...prev,
                email: e.target.value
              }))} placeholder="votre@email.com" required data-magicpath-id="252" data-magicpath-path="PortfolioSite.tsx" />
              </div>
              <div className="space-y-2" data-magicpath-id="253" data-magicpath-path="PortfolioSite.tsx">
                <Label htmlFor="modal-message" data-magicpath-id="254" data-magicpath-path="PortfolioSite.tsx">Message</Label>
                <Textarea id="modal-message" value={contactForm.message} onChange={e => setContactForm(prev => ({
                ...prev,
                message: e.target.value
              }))} placeholder="Décrivez votre projet..." rows={4} required data-magicpath-id="255" data-magicpath-path="PortfolioSite.tsx" />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting} data-magicpath-id="256" data-magicpath-path="PortfolioSite.tsx">
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>;
}