import { Lead } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read leads from file
export async function getLeads(): Promise<Lead[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(LEADS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Save a new lead
export async function saveLead(lead: Lead): Promise<void> {
  await ensureDataDir();
  const leads = await getLeads();
  leads.push(lead);
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// Update lead status
export async function updateLead(id: string, updates: Partial<Lead>): Promise<void> {
  await ensureDataDir();
  const leads = await getLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...updates };
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
  }
}

// Delete a lead
export async function deleteLead(id: string): Promise<void> {
  await ensureDataDir();
  const leads = await getLeads();
  const filteredLeads = leads.filter((lead) => lead.id !== id);
  await fs.writeFile(LEADS_FILE, JSON.stringify(filteredLeads, null, 2));
}

