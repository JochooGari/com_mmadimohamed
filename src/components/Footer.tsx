import React from "react";
import { Linkedin, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-8" style={{ backgroundColor: '#0f172b' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid md:grid-cols-3 gap-4 text-center md:text-left">
          {/* Logo + Présentation */}
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MM</span>
              </div>
              <span className="font-semibold text-white">MMADI Mohamed</span>
            </div>
            <p className="text-slate-200 text-sm">
              <strong>EXECUTIVE SUMMARY</strong><br />
              Chef de projet IT et consultant BI avec 8 ans d'expertise Power BI dans la data & la transformation digitale (banque-assurance, pharma, retail & luxe). Spécialiste de la conduite de projets Data/BI : de la collecte multi-cloud (Azure, GCP) jusqu'au reporting self-service. Bilingue FR/EN, habitué aux environnements complexes et aux équipes pluridisciplinaires. Doté d'une facilité de communication pour transformer les idées de chacun en une idée pour tous.
            </p>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Expertise</h3>
            <ul className="text-slate-200 text-sm space-y-1">
              <li>Conduite de projet data</li>
              <li>Tableaux de bord Power BI</li>
              <li>Gouvernance Data</li>
              <li>Strategie Data</li>
              <li>Formation</li>
              <li>DAX</li>
              <li>Power Query</li>
            </ul>
          </div>

          {/* Suivez-moi */}
          <div>
            <h3 className="font-semibold mb-2 text-white">Suivez-moi</h3>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="text-slate-400 hover:text-teal-400" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-teal-400" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-teal-400" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 my-3" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <a href="#" className="hover:underline">Mentions légales</a>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:underline">Politique de confidentialité</a>
          </div>
          <div>
            © 2025 MMADI Mohamed Tous droits réservés. Ce site respecte le Règlement Général sur la Protection des Données (RGPD).
          </div>
        </div>
      </div>
    </footer>
  );
} 