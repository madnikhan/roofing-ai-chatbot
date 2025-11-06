import { Lead } from '@/types';

const LEADS_KEY = 'leads';

// Read leads from Vercel KV
export async function getLeads(): Promise<Lead[]> {
  try {
    // Try to use Vercel KV if available (only on Vercel)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const leads = await kv.get<Lead[]>(LEADS_KEY);
        return leads || [];
      } catch (error) {
        console.error('Vercel KV error, falling back to file system:', error);
      }
    }
    
    // Fallback to file system for local development
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const DATA_DIR = path.join(process.cwd(), 'data');
    const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
    
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    try {
      const data = await fs.readFile(LEADS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error reading leads:', error);
    return [];
  }
}

// Save a new lead
export async function saveLead(lead: Lead): Promise<void> {
  try {
    // Try to use Vercel KV if available (only on Vercel)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        const leads = await getLeads();
        leads.push(lead);
        await kv.set(LEADS_KEY, leads);
        return;
      } catch (error) {
        console.error('Vercel KV error, falling back to file system:', error);
      }
    }
    
    // Fallback to file system for local development
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const DATA_DIR = path.join(process.cwd(), 'data');
    const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
    
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    const leads = await getLeads();
    leads.push(lead);
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Error saving lead:', error);
    throw error;
  }
}

// Update lead status
export async function updateLead(id: string, updates: Partial<Lead>): Promise<void> {
  try {
    const leads = await getLeads();
    const index = leads.findIndex((lead) => lead.id === id);
    
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates };
      
      // Try to use Vercel KV if available (only on Vercel)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          const { kv } = await import('@vercel/kv');
          await kv.set(LEADS_KEY, leads);
          return;
        } catch (error) {
          console.error('Vercel KV error, falling back to file system:', error);
        }
      }
      
      // Fallback to file system for local development
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const DATA_DIR = path.join(process.cwd(), 'data');
      const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
      
      await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

// Delete a lead
export async function deleteLead(id: string): Promise<void> {
  try {
    const leads = await getLeads();
    const filteredLeads = leads.filter((lead) => lead.id !== id);
    
    // Try to use Vercel KV if available (only on Vercel)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.set(LEADS_KEY, filteredLeads);
        return;
      } catch (error) {
        console.error('Vercel KV error, falling back to file system:', error);
      }
    }
    
    // Fallback to file system for local development
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const DATA_DIR = path.join(process.cwd(), 'data');
    const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
    
    await fs.writeFile(LEADS_FILE, JSON.stringify(filteredLeads, null, 2));
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}
