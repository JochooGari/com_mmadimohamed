import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, BarChart, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

const SITES = [
  { name: 'Signes (FR)', lat: 43.27, lon: 5.86, otif: 95.2, alerts: 2 },
  { name: 'Wrexham (UK)', lat: 53.05, lon: -2.99, otif: 93.8, alerts: 3 },
  { name: 'Dublin (IE)', lat: 53.35, lon: -6.26, otif: 94.7, alerts: 1 },
  { name: 'Dreux (FR)', lat: 48.74, lon: 1.37, otif: 96.1, alerts: 0 },
  { name: 'Cambridge (UK)', lat: 52.20, lon: 0.12, otif: 92.9, alerts: 4 },
  { name: 'Tianjin (CN)', lat: 39.12, lon: 117.20, otif: 93.5, alerts: 2 },
];

const COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a78bfa', '#eab308', '#ef4444'];

const trend = Array.from({ length: 30 }).map((_, i) => ({ day: i + 1, otif: 92 + Math.sin(i / 5) * 2 + (i % 7 === 0 ? -1 : 0), volume: 100 + Math.round(Math.random() * 40), alerts: Math.max(0, Math.round(3 + Math.cos(i / 4))) }));

const TRANSPORTERS = [
  { name: 'DHL', perf: 96 },
  { name: 'FedEx', perf: 94 },
  { name: 'K+N', perf: 92 },
  { name: 'DB Schenker', perf: 91 },
  { name: 'UPS', perf: 93 },
];

const PRODUCTS = [
  { name: 'Somatuline', growth: 8.2 },
  { name: 'Dysport', growth: 7.1 },
  { name: 'Decapeptyl', growth: 5.3 },
  { name: 'Onivyde', growth: 6.0 },
  { name: 'Cabometyx', growth: 4.8 },
];

export default function PharmaDemoPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const kpis = useMemo(() => ({
    revenue: 4.08,
    growth: 9.0,
    employees: 5358,
    co2: -45,
    co2s3: -25,
    evFleet: 43,
    otif: 94.5,
    alerts: 8,
    shipments: 1247,
    sitesUp: 6,
  }), []);

  return (
    <section>
      <div className="bg-slate-900 text-white py-10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Supply Chain Intelligence — Pharma</h1>
              <p className="opacity-90 max-w-4xl">Résumé exécutif: <span className="font-semibold">€{kpis.revenue.toFixed(2)}B</span> revenue 2024 (+{kpis.growth}% cc), {kpis.employees.toLocaleString()} employés, sites: Signes, Wrexham, Dublin, Dreux, Cambridge, Tianjin. ESG: CO₂ {kpis.co2}% (S1&2), {kpis.co2s3}% (S3), flotte EV {kpis.evFleet}%.</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={lang} onValueChange={(v)=>setLang(v as any)}>
                <SelectTrigger className="w-28 bg-white/10 text-white border-white/20"><SelectValue placeholder="Lang"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">FR</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
              <Select value={period} onValueChange={(v)=>setPeriod(v as any)}>
                <SelectTrigger className="w-40 bg-white/10 text-white border-white/20"><SelectValue placeholder="Période"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="ops">Performance Opérationnelle</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>OTIF Global</CardTitle>
                  <CardDescription>On Time In Full</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{kpis.otif.toFixed(1)}%</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Expéditions / jour</CardTitle>
                  <CardDescription>Volume consolidé</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{kpis.shipments.toLocaleString()}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Alertes actives</CardTitle>
                  <CardDescription>SLA & qualité</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">{kpis.alerts}</CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Tendances (30 jours)</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="otif" stroke="#10b981" dot={false} name="OTIF %" />
                      <Line type="monotone" dataKey="alerts" stroke="#ef4444" dot={false} name="Alertes" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sites — statut</CardTitle>
                  <CardDescription>6 sites</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {SITES.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary">OTIF {s.otif.toFixed(1)}%</Badge>
                        <Badge variant={s.alerts>0? 'destructive': 'secondary'}>{s.alerts} alertes</Badge>
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ops" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Transporteurs — performance</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TRANSPORTERS}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="perf" fill="#0ea5e9" name="% Respect délais" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Produits — croissance</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PRODUCTS}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="growth" fill="#22c55e" name="Croissance %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Monitoring température — par site</CardTitle></CardHeader>
              <CardContent style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SITES.map((s, i)=>({ name: s.name, temp: 2 + (i%3)*0.5 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area dataKey="temp" stroke="#a78bfa" fill="#c4b5fd" name="Temp °C (moyenne)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Prévision demande (7 jours)</CardTitle></CardHeader>
                <CardContent style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend.slice(20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="volume" stroke="#0ea5e9" name="Volume" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Perfect Order Rate</CardTitle></CardHeader>
                <CardContent className="text-3xl font-bold">95.6%</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Inventory Turnover</CardTitle></CardHeader>
                <CardContent className="text-3xl font-bold">12.4x / an</CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}


