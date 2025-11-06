import { Message, Conversation } from '@/types';

// Emergency keyword detection - comprehensive list
const EMERGENCY_KEYWORDS = {
  critical: ['flooding', 'active leak', 'water pouring', 'ceiling collapsing', 'urgent now', 'asap', 'immediately'],
  high: ['emergency', 'urgent', 'leaking now', 'water damage', 'flooded', 'critical', 'rush'],
  medium: ['leak', 'water', 'dripping', 'wet', 'moisture', 'damage', 'broken', 'cracked'],
  low: ['storm', 'hail', 'wind', 'damage', 'issue', 'problem', 'concern'],
};

const ROOFING_ISSUES = {
  leaks: ['leak', 'dripping', 'water', 'moisture', 'wet', 'stain', 'damp'],
  storm: ['storm', 'hail', 'wind', 'hurricane', 'tornado', 'debris', 'tree'],
  wear: ['shingle', 'tile', 'missing', 'damaged', 'loose', 'worn', 'aging'],
  ventilation: ['vent', 'attic', 'mold', 'ice dam', 'ventilation', 'airflow'],
  gutters: ['gutter', 'downspout', 'drainage', 'clogged', 'overflow'],
};

const ROOFING_ADVICE = {
  leak: "For active leaks, try placing a bucket or container to catch the water temporarily. If water is entering your electrical system or causing significant damage, please turn off power to affected areas and contact us immediately. We can usually respond within 2 hours for emergency leaks.",
  storm: "After a storm, it's important to document any visible damage with photos. Check for missing shingles, dents from hail, or debris. Even if damage isn't immediately visible, we recommend a professional inspection as some issues may not be apparent from the ground.",
  preventive: "Regular roof maintenance can extend your roof's life significantly. We recommend annual inspections, especially after severe weather. Early detection of minor issues can prevent costly repairs down the road.",
  shingles: "Missing or damaged shingles can lead to leaks and further damage. The severity depends on how many are affected and their location. If you see multiple missing shingles or damage near roof valleys, chimneys, or vents, it's worth getting an inspection soon.",
  ventilation: "Proper attic ventilation is crucial for roof health. Poor ventilation can cause ice dams in winter, excessive heat in summer, and can shorten your roof's lifespan. Signs include mold growth, ice buildup, or unusually high energy bills.",
};

// Greeting responses - varied and natural
const GREETING_RESPONSES = [
  "Hello! I'm here to help with your roofing needs. What can I assist you with today?",
  "Hi there! I'm your roofing assistant. How can I help you today?",
  "Welcome! I'm here to help with any roofing questions or emergencies. What brings you here?",
  "Hi! Thanks for reaching out. I'm here to help with all your roofing needs. What can I do for you?",
];

// Qualification question sequence
const QUALIFICATION_SEQUENCE = {
  name: "To get started, may I have your name?",
  phone: "Great! What's the best phone number to reach you?",
  address: "Perfect. And what's the address where we'll be working?",
  problem: "Thanks! Can you describe the roofing issue you're experiencing?",
  contact: "How would you prefer we contact you - by phone, email, or text?",
};

// Human escalation triggers
const ESCALATION_TRIGGERS = [
  'speak to someone',
  'talk to a person',
  'human',
  'representative',
  'manager',
  'supervisor',
  'customer service',
  'too complicated',
  'not helpful',
  'frustrated',
];

interface ConversationContext {
  currentStep: 'greeting' | 'qualification' | 'scheduling' | 'completed';
  isEmergency: boolean;
  emergencyLevel?: number;
  messageHistory?: Message[];
  leadData?: {
    name?: boolean;
    phone?: boolean;
    address?: boolean;
    problem?: boolean;
    preferredContact?: boolean;
  };
  detectedField?: 'name' | 'phone' | 'address' | 'problem' | 'contact' | null;
  lastResponseType?: string;
}

/**
 * Detect emergency keywords with severity levels
 */
export function detectEmergency(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const allKeywords = [
    ...EMERGENCY_KEYWORDS.critical,
    ...EMERGENCY_KEYWORDS.high,
    ...EMERGENCY_KEYWORDS.medium,
    ...EMERGENCY_KEYWORDS.low,
  ];
  return allKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get emergency level (1-5 scale)
 * 5 = Critical, immediate action needed
 * 4 = High priority, urgent
 * 3 = Medium priority, needs attention soon
 * 2 = Low priority, can wait
 * 1 = Not an emergency
 */
export function getEmergencyLevel(message: string): number {
  const lowerMessage = message.toLowerCase();
  
  // Critical (Level 5)
  if (EMERGENCY_KEYWORDS.critical.some(kw => lowerMessage.includes(kw))) {
    return 5;
  }
  
  // High (Level 4)
  if (EMERGENCY_KEYWORDS.high.some(kw => lowerMessage.includes(kw))) {
    return 4;
  }
  
  // Medium (Level 3)
  if (EMERGENCY_KEYWORDS.medium.some(kw => lowerMessage.includes(kw))) {
    return 3;
  }
  
  // Low (Level 2)
  if (EMERGENCY_KEYWORDS.low.some(kw => lowerMessage.includes(kw))) {
    return 2;
  }
  
  return 1;
}

/**
 * Detect if user wants to escalate to human support
 */
export function shouldEscalateToHuman(message: string, conversationState: ConversationContext): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Check for escalation keywords
  if (ESCALATION_TRIGGERS.some(trigger => lowerMessage.includes(trigger))) {
    return true;
  }
  
  // Escalate if conversation is stuck or user is frustrated
  if (conversationState.messageHistory && conversationState.messageHistory.length > 8) {
    // Check if user is repeating themselves
    const recentMessages = conversationState.messageHistory.slice(-3);
    if (recentMessages.length >= 2) {
      const lastUserMessage = recentMessages[recentMessages.length - 1]?.text.toLowerCase();
      const prevUserMessage = recentMessages[recentMessages.length - 2]?.text.toLowerCase();
      if (lastUserMessage === prevUserMessage || lastUserMessage.includes('still') || lastUserMessage.includes('again')) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get the next qualification question based on collected data
 */
function getNextQualificationQuestion(leadData: any): string | null {
  if (!leadData) return QUALIFICATION_SEQUENCE.name;
  
  if (!leadData.name) return QUALIFICATION_SEQUENCE.name;
  if (!leadData.phone) return QUALIFICATION_SEQUENCE.phone;
  if (!leadData.address) return QUALIFICATION_SEQUENCE.address;
  if (!leadData.problem) return QUALIFICATION_SEQUENCE.problem;
  if (!leadData.preferredContact) return QUALIFICATION_SEQUENCE.contact;
  
  return null; // All questions answered
}

/**
 * Detect roofing issue type from message
 */
function detectRoofingIssue(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [issueType, keywords] of Object.entries(ROOFING_ISSUES)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return issueType;
    }
  }
  
  return null;
}

/**
 * Get roofing-specific advice based on issue type
 */
function getRoofingAdvice(issueType: string | null, emergencyLevel: number): string {
  if (!issueType) return '';
  
  const advice = ROOFING_ADVICE[issueType as keyof typeof ROOFING_ADVICE];
  if (advice) {
    return advice;
  }
  
  // Default advice based on emergency level
  if (emergencyLevel >= 4) {
    return "This sounds like it needs immediate attention. We can dispatch a technician within 2 hours for emergency situations. Would you like to proceed with scheduling?";
  }
  
  return "I'd recommend having a professional inspection to assess the full extent of the issue. We offer free inspections and can provide a detailed estimate. Would you like to schedule one?";
}

/**
 * Generate context-aware response
 */
export function generateResponse(userMessage: string, conversationState: ConversationContext): string {
  const lowerMessage = userMessage.toLowerCase();
  const isEmergency = detectEmergency(userMessage);
  const emergencyLevel = isEmergency ? getEmergencyLevel(userMessage) : (conversationState.emergencyLevel || 1);
  
  // Check for human escalation
  if (shouldEscalateToHuman(userMessage, conversationState)) {
    return "I understand you'd like to speak with someone directly. Let me connect you with one of our roofing specialists. Can I get your phone number so they can call you right away?";
  }
  
  // Emergency responses - prioritize based on severity
  if (isEmergency || emergencyLevel >= 3) {
    if (emergencyLevel >= 5) {
      return "🚨 This sounds like a critical emergency! We prioritize these situations and can typically have a technician on-site within 2 hours. To expedite this, can I get your name and phone number right away?";
    }
    
    if (emergencyLevel >= 4) {
      return "🚨 I understand this is urgent. We can help! Emergency roof repairs are typically available within 2-4 hours. Can you provide your name and phone number so we can contact you immediately?";
    }
    
    // Medium emergency - provide advice and transition to qualification
    const issueType = detectRoofingIssue(userMessage);
    const advice = getRoofingAdvice(issueType, emergencyLevel);
    
    if (advice) {
      return `${advice} Let's get your information so we can help you as quickly as possible. What's your name?`;
    }
    
    return "This sounds like it needs attention soon. Let's get your information so we can schedule an inspection. What's your name?";
  }
  
  // Greeting phase
  if (conversationState.currentStep === 'greeting') {
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help') || lowerMessage.length < 5) {
      return GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
    }
    
    // User has described an issue - transition to qualification
    if (lowerMessage.length > 10) {
      const issueType = detectRoofingIssue(userMessage);
      const advice = getRoofingAdvice(issueType, emergencyLevel);
      
      if (advice) {
        return `${advice} To help you better, I'll need a few details. Can I start with your name?`;
      }
      
      return "I understand. To help you better, I'll need a few details. Can I start with your name?";
    }
  }
  
  // Qualification phase - handle field collection
  if (conversationState.currentStep === 'qualification') {
    const leadData = conversationState.leadData || {};
    
    // Check if we detected a field from the API
    if (conversationState.detectedField) {
      const nextQuestion = getNextQualificationQuestion({
        ...leadData,
        [conversationState.detectedField]: true,
      });
      
      if (nextQuestion) {
        return nextQuestion;
      }
      
      // All fields collected - transition to scheduling
      return "Perfect! I have all the information I need. Would you like to schedule an appointment? We can typically schedule inspections within 24-48 hours, or sooner for emergencies.";
    }
    
    // Handle yes/no responses
    if (lowerMessage.includes('yes') || lowerMessage.includes('sure') || lowerMessage.includes('ok') || lowerMessage.includes('yep')) {
      const nextQuestion = getNextQualificationQuestion(leadData);
      return nextQuestion || "Great! Is there anything else I can help you with?";
    }
    
    if (lowerMessage.includes('no') || lowerMessage.includes('not') || lowerMessage.includes('nope') || lowerMessage.includes("don't")) {
      return "No problem! Is there anything else I can help you with regarding your roofing needs?";
    }
    
    // Continue with qualification sequence
    const nextQuestion = getNextQualificationQuestion(leadData);
    if (nextQuestion) {
      return nextQuestion;
    }
  }
  
  // Scheduling phase
  if (conversationState.currentStep === 'scheduling') {
    if (lowerMessage.includes('yes') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('time')) {
      return "Great! I can help you schedule an appointment. What time works best for you? We have availability today and tomorrow.";
    }
    
    if (lowerMessage.includes('no') || lowerMessage.includes('not now') || lowerMessage.includes('later')) {
      return "No problem! We're here whenever you're ready. Feel free to reach out anytime, or I can send you a reminder. How would you like to proceed?";
    }
    
    return "I'd be happy to help you schedule an appointment. When would be a good time for you? We have availability today and tomorrow.";
  }
  
  // Appointment/quote requests
  if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('estimate')) {
    return "I'd be happy to help you get a quote! To provide an accurate estimate, I'll need to gather some information about your roof and the specific issue. Can I start with your name?";
  }
  
  if (lowerMessage.includes('inspection') || lowerMessage.includes('inspect') || lowerMessage.includes('check')) {
    return "Roof inspections are important for maintaining your roof's integrity and catching issues early. We offer free inspections with no obligation. Would you like to schedule one?";
  }
  
  if (lowerMessage.includes('repair') || lowerMessage.includes('fix') || lowerMessage.includes('broken')) {
    const issueType = detectRoofingIssue(userMessage);
    const advice = getRoofingAdvice(issueType, emergencyLevel);
    
    if (advice) {
      return `${advice} Can you describe what needs to be fixed in more detail?`;
    }
    
    return "We can definitely help with roof repairs! Can you describe what needs to be fixed? This will help us determine if it's an emergency or if we can schedule a regular appointment.";
  }
  
  // Maintenance/preventive care
  if (lowerMessage.includes('maintenance') || lowerMessage.includes('prevent') || lowerMessage.includes('maintain') || lowerMessage.includes('upkeep')) {
    return ROOFING_ADVICE.preventive + " Would you like to schedule a maintenance inspection?";
  }
  
  // Warranty/guarantee questions
  if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee') || lowerMessage.includes('warrant')) {
    return "We stand behind our work with comprehensive warranties. The specifics depend on the type of work and materials used. I can connect you with one of our specialists who can provide detailed warranty information. Would you like to speak with them?";
  }
  
  // Thank you/positive feedback
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
    return "You're very welcome! I'm glad I could help. Is there anything else you need assistance with regarding your roofing needs?";
  }
  
  // Greeting variations
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hi! How can I help you with your roofing needs today?";
  }
  
  // Default contextual response
  const issueType = detectRoofingIssue(userMessage);
  if (issueType) {
    const advice = getRoofingAdvice(issueType, emergencyLevel);
    if (advice) {
      return `${advice} Can you tell me more about your specific situation?`;
    }
  }
  
  // If we have conversation history, reference it
  if (conversationState.messageHistory && conversationState.messageHistory.length > 0) {
    return "I understand. Can you provide a bit more detail about your roofing concern? This will help me assist you better.";
  }
  
  // Default response
  return "I'd be happy to help! Can you tell me more about your roofing issue so I can provide the best assistance?";
}

/**
 * Determine next conversation step based on current state and user message
 */
export function getNextStep(
  currentStep: 'greeting' | 'qualification' | 'scheduling' | 'completed',
  userMessage: string,
  conversationState?: ConversationContext
): 'greeting' | 'qualification' | 'scheduling' | 'completed' {
  const lowerMessage = userMessage.toLowerCase();
  
  // Transition from greeting to qualification
  if (currentStep === 'greeting') {
    if (lowerMessage.length > 10 && !lowerMessage.match(/^(hello|hi|hey|thanks|thank you)$/i)) {
      return 'qualification';
    }
  }
  
  // Transition from qualification to scheduling
  if (currentStep === 'qualification') {
    // Check if all fields are collected
    if (conversationState?.leadData) {
      const { name, phone, address, problem, preferredContact } = conversationState.leadData;
      if (name && phone && address && problem && preferredContact) {
        return 'scheduling';
      }
    }
    
    // Or explicit scheduling request
    if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
      return 'scheduling';
    }
    
    // Stay in qualification if not all fields collected
    return 'qualification';
  }
  
  // Transition from scheduling to completed
  if (currentStep === 'scheduling') {
    if (lowerMessage.includes('confirm') || lowerMessage.includes('booked') || lowerMessage.includes('scheduled') || lowerMessage.includes('done')) {
      return 'completed';
    }
  }
  
  return currentStep;
}

/**
 * Check if conversation should show qualification form
 */
export function shouldShowQualificationForm(conversationState: ConversationContext, messageCount: number): boolean {
  // Show if emergency
  if (conversationState.isEmergency || (conversationState.emergencyLevel && conversationState.emergencyLevel >= 3)) {
    return true;
  }
  
  // Show after 2+ messages
  if (messageCount >= 2) {
    return true;
  }
  
  // Show if in qualification step
  if (conversationState.currentStep === 'qualification') {
    return true;
  }
  
  return false;
}

