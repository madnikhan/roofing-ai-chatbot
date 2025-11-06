export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Conversation {
  messages: Message[];
  currentStep: 'greeting' | 'qualification' | 'scheduling' | 'completed';
  isEmergency: boolean;
  emergencyLevel?: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  problem: string;
  emergencyLevel: number;
  status: 'new' | 'contacted' | 'scheduled' | 'completed';
  preferredContact: 'phone' | 'email' | 'text';
  availability?: string;
  scheduledTime?: string;
  createdAt: Date;
  email?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  preferredTime?: string;
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

