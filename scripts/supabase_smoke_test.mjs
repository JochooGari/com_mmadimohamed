import fs from 'fs';
import path from 'path';
import https from 'https';

let cfgPath = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cursor', 'mcp.json');
if (!fs.existsSync(cfgPath)) {
  // Fallback explicit path on Windows
  const up = process.env.USERPROFILE || 'C://Users//power';
  cfgPath = path.join(up, '.cursor', 'mcp.json');
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const args = cfg?.mcpServers?.supabase?.args || [];
const refArg = args.find((a) => a.startsWith('--project-ref='));
const ref = refArg ? refArg.split('=')[1] : null;
const pat = cfg?.mcpServers?.supabase?.env?.SUPABASE_ACCESS_TOKEN;

if (!ref || !pat) {
  console.error('Missing Supabase project ref or PAT from .cursor/mcp.json');
  process.exit(1);
}

const sql = [
  'create extension if not exists pgcrypto;',
  'create table if not exists public.mcp_smoke_test (id uuid primary key default gen_random_uuid(), note text, created_at timestamptz not null default now());',
  "insert into public.mcp_smoke_test(note) values ('hello mcp');",
  'select count(*) as rows from public.mcp_smoke_test;',
  'drop table public.mcp_smoke_test;',
  "select to_regclass('public.mcp_smoke_test') as exists_after_drop;",
].join(' ');

const data = JSON.stringify({ query: sql });

const options = {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${pat}`,
    'Content-Type': 'application/json',
  },
};

const url = `https://api.supabase.com/v1/projects/${ref}/sql`;

const req = https.request(url, options, (res) => {
  let body = '';
  res.on('data', (d) => (body += d));
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

req.write(data);
req.end();


