import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import EditableText from "./EditableText";
import { useContent } from "../context/ContentContext";
import EditorToggle from "./EditorToggle";
import { Button } from "./ui/button";

const navigationItems = [
  { id: "accueil", label: "Accueil", href: "#accueil" },
  { id: "expertise", label: "Expertise", href: "#expertise" },
  { id: "blog", label: "Blog", href: "#blog" },
  { id: "bibliotheque", label: "Bibliothèque", href: "#bibliotheque" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export default function Header() {
  const { content, setContent } = useContent();
  const [activeSection, setActiveSection] = useState("accueil");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);

  // Intersection Observer for active section
  useEffect(() => {
    const observers = navigationItems.map((item) => {
      const element = document.getElementById(item.id);
      if (!element) return null;
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(item.id);
          }
        },
        { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
      );
      observer.observe(element);
      return observer;
    });
    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/50"
      style={{ opacity: headerOpacity }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Titre éditable */}
          <div className="flex items-center space-x-2">
            <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
              MM
            </div>
            <EditableText
              value={content.hero.title}
              onChange={(v) =>
                setContent((c) => ({ ...c, hero: { ...c.hero, title: v } }))
              }
              as="h1"
              className="text-xl font-bold hidden sm:block"
            />
          </div>
          {/* Navigation */}
          <ul className="hidden md:flex gap-6">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`text-base font-medium transition-colors duration-200 hover:text-teal-600 ${
                    activeSection === item.id ? "text-teal-600" : "text-gray-700"
                  }`}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          {/* Bouton contact + menu mobile */}
          <div className="flex items-center gap-2">
            <Button className="hidden md:inline-block" onClick={() => scrollToSection("contact")}>Me contacter</Button>
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Ouvrir le menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>
        </div>
        {/* Menu mobile */}
        {isMenuOpen && (
          <ul className="md:hidden flex flex-col gap-4 mt-2 bg-white rounded shadow p-4">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full text-left text-base font-medium transition-colors duration-200 hover:text-teal-600 ${
                    activeSection === item.id ? "text-teal-600" : "text-gray-700"
                  }`}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <Button onClick={() => scrollToSection("contact")}>Me contacter</Button>
          </ul>
        )}
      </nav>
    </motion.header>
  );
} 