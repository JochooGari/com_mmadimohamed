import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function series(n = 30) {
  const arr: { day: string; organic: number; social: number; referral: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    arr.push({ day: `${d.getDate()}/${d.getMonth()+1}`, organic: 120 + Math.round(Math.random()*80), social: 40 + Math.round(Math.random()*40), referral: 20 + Math.round(Math.random()*20) });
  }
  return arr;
}

export default function AdminAnalytics() {
  const data = useMemo(() => series(30), []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card style={{ height: 280 }}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Trafic par source (30 jours)</CardTitle></CardHeader>
          <CardContent style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area dataKey="organic" stackId="1" stroke="#0ea5e9" fill="#93c5fd" name="Organic" />
              <Area dataKey="social" stackId="1" stroke="#22c55e" fill="#86efac" name="Social" />
              <Area dataKey="referral" stackId="1" stroke="#f97316" fill="#fdba74" name="Referral" />
            </AreaChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card style={{ height: 280 }}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Temps moyen sur page</CardTitle></CardHeader>
          <CardContent style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="organic" stroke="#0ea5e9" name="Secondes" />
            </LineChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="text-sm text-slate-600">Astuce: connectez Plausible/GA4 pour remplacer ces placeholders par vos données (events download_resource, contact_submit, view_*)</div>
    </div>
  );
}


