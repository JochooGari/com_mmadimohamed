import { PortfolioContent } from "../types/content";

export const defaultContent: PortfolioContent = {
  hero: {
    title: "Chef de projet Data",
    highlight: "Expert Power BI",
    subtitle: "Consultant Data & BI",
    description: "Je vous accompagne dans vos projets data, de la stratégie à la mise en œuvre.",
    cta: "Me contacter",
    image: "/hero.jpg"
  },
  expertise: {
    strategy: ["Data Strategy", "Data Governance", "Data Quality"],
    dashboards: ["Power BI", "Tableau", "Google Data Studio"]
  },
  expertiseTitle: "Mon Expertise",
  expertiseSubtitle: "Des solutions sur mesure pour transformer vos données en avantage concurrentiel",
  blogTitle: "Blog & Actualités",
  blogSubtitle: "Découvrez mes derniers articles sur la Business Intelligence et la transformation data",
  resourcesTitle: "Bibliothèque de Ressources",
  resourcesSubtitle: "Guides, templates et outils gratuits pour accélérer vos projets data",
  contactTitle: "Discutons de votre projet",
  contactSubtitle: "Prêt à transformer vos données en avantage concurrentiel ? Contactez-moi pour échanger sur vos besoins.",
  blog: [
    {
      id: "blog-1",
      title: "Les 5 erreurs à éviter dans votre stratégie data",
      excerpt: "Découvrez les pièges les plus courants et comment les éviter pour réussir votre transformation data.",
      content: "...",
      image: "",
      date: "15 Mars 2024",
      tags: ["Stratégie"],
      published: true,
      readTime: "5 min"
    },
    {
      id: "blog-2",
      title: "Power BI vs Tableau : Quel outil choisir en 2024 ?",
      excerpt: "Comparaison détaillée des deux leaders du marché de la Business Intelligence.",
      content: "...",
      image: "",
      date: "8 Mars 2024",
      tags: ["Outils"],
      published: true,
      readTime: "8 min"
    },
    {
      id: "blog-3",
      title: "Comment optimiser les performances de vos rapports Power BI",
      excerpt: "Techniques avancées pour accélérer vos dashboards et améliorer l'expérience utilisateur.",
      content: "...",
      image: "",
      date: "1 Mars 2024",
      tags: ["Performance"],
      published: true,
      readTime: "6 min"
    }
  ],
  resources: [
    {
      id: "resource-1",
      title: "Guide complet Power BI",
      description: "Manuel de 50 pages couvrant toutes les fonctionnalités essentielles",
      type: "guide",
      category: "PDF",
      fileUrl: "#",
      downloadCount: 2300,
      featured: true
    },
    {
      id: "resource-2",
      title: "Templates Dashboard Finance",
      description: "Collection de modèles prêts à l'emploi pour le reporting financier",
      type: "template",
      category: "PBIX",
      fileUrl: "#",
      downloadCount: 1800,
      featured: true
    },
    {
      id: "resource-3",
      title: "Checklist Audit Data",
      description: "Liste de contrôle pour évaluer la maturité data de votre organisation",
      type: "tool",
      category: "Excel",
      fileUrl: "#",
      downloadCount: 950,
      featured: false
    },
    {
      id: "resource-4",
      title: "Formation DAX Avancée",
      description: "Vidéos de formation sur les fonctions DAX les plus complexes",
      type: "tool",
      category: "DAX",
      fileUrl: "#",
      downloadCount: 3100,
      featured: false
    }
  ],
  contact: {
    email: "contact@exemple.com",
    phone: "+33 6 12 34 56 78",
    address: "Paris, France",
    message: ""
  },
  settings: {
    darkMode: false,
    theme: "default"
  }
}; 