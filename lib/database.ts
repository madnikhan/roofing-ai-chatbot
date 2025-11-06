import { Lead } from '@/types';
import { getRedisClient, connectRedis } from './redis';

const LEADS_KEY = 'leads';

// Read leads from Redis (Vercel KV or other Redis)
export async function getLeads(): Promise<Lead[]> {
  try {
    // Try direct Redis connection first (ioredis)
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await connectRedis();
        const leadsDataStr = await redisClient.get(LEADS_KEY);
        
        if (!leadsDataStr) {
          return [];
        }
        
        const leadsData = JSON.parse(leadsDataStr) as Lead[];
        
        // Convert date strings back to Date objects
        return leadsData.map((lead: any) => ({
          ...lead,
          createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        }));
      } catch (error) {
        console.error('Direct Redis connection error:', error);
        // Fall through to try REST API
      }
    }

    // Try REST API (Vercel KV or Upstash)
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (redisUrl && redisToken) {
      try {
        // Try Vercel KV REST API (@vercel/kv)
        const { kv } = await import('@vercel/kv');
        const leadsData = await kv.get<Lead[]>(LEADS_KEY);
        
        if (!leadsData) {
          return [];
        }
        
        // Convert date strings back to Date objects
        return leadsData.map((lead: any) => ({
          ...lead,
          createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        }));
      } catch (error) {
        console.error('Redis REST API error:', error);
        throw error;
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
    // Try direct Redis connection first (ioredis)
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await connectRedis();
        const leads = await getLeads();
        
        // Serialize lead (convert Date to string for storage)
        const serializedLead = {
          ...lead,
          createdAt: lead.createdAt instanceof Date ? lead.createdAt.toISOString() : lead.createdAt,
        };
        
        leads.push(serializedLead as any);
        await redisClient.set(LEADS_KEY, JSON.stringify(leads));
        return;
      } catch (error) {
        console.error('Direct Redis save error:', error);
        // Fall through to try REST API
      }
    }

    // Try REST API (Vercel KV or Upstash)
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (redisUrl && redisToken) {
      try {
        // Try Vercel KV REST API (@vercel/kv)
        const { kv } = await import('@vercel/kv');
        const leads = await getLeads();
        
        // Serialize lead (convert Date to string for storage)
        const serializedLead = {
          ...lead,
          createdAt: lead.createdAt instanceof Date ? lead.createdAt.toISOString() : lead.createdAt,
        };
        
        leads.push(serializedLead as any);
        await kv.set(LEADS_KEY, leads);
        return;
      } catch (error) {
        console.error('Redis REST API save error:', error);
        throw error;
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
      const updatedLead = { ...leads[index], ...updates };
      
      // Serialize updated lead (convert Date to string for storage)
      const serializedLead = {
        ...updatedLead,
        createdAt: updatedLead.createdAt instanceof Date ? updatedLead.createdAt.toISOString() : updatedLead.createdAt,
      };
      
      leads[index] = serializedLead as any;
      
      // Try direct Redis connection first (ioredis)
      const redisClient = getRedisClient();
      if (redisClient) {
        try {
          await connectRedis();
          await redisClient.set(LEADS_KEY, JSON.stringify(leads));
          return;
        } catch (error) {
          console.error('Direct Redis update error:', error);
          // Fall through to try REST API
        }
      }

      // Try REST API (Vercel KV or Upstash)
      const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
      
      if (redisUrl && redisToken) {
        try {
          // Try Vercel KV REST API (@vercel/kv)
          const { kv } = await import('@vercel/kv');
          await kv.set(LEADS_KEY, leads);
          return;
        } catch (error) {
          console.error('Redis REST API update error:', error);
          throw error;
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
    
    // Try direct Redis connection first (ioredis)
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await connectRedis();
        await redisClient.set(LEADS_KEY, JSON.stringify(filteredLeads));
        return;
      } catch (error) {
        console.error('Direct Redis delete error:', error);
        // Fall through to try REST API
      }
    }

    // Try REST API (Vercel KV or Upstash)
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (redisUrl && redisToken) {
      try {
        // Try Vercel KV REST API (@vercel/kv)
        const { kv } = await import('@vercel/kv');
        await kv.set(LEADS_KEY, filteredLeads);
        return;
      } catch (error) {
        console.error('Redis REST API delete error:', error);
        throw error;
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
