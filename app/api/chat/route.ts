import { NextRequest, NextResponse } from 'next/server';
import { 
  generateResponse, 
  detectEmergency, 
  getEmergencyLevel,
  getNextStep 
} from '@/lib/ai-responses';
import { Conversation, Message } from '@/types';

// Request body interface
interface ChatRequest {
  message: string;
  conversationState?: Conversation;
  messageHistory?: Message[];
}

// Response interface
interface ChatResponse {
  response: string;
  isEmergency: boolean;
  emergencyLevel: number;
  updatedConversation: Conversation;
  shouldShowQualification: boolean;
  qualificationStep?: 'name' | 'phone' | 'address' | 'problem' | 'contact' | null;
  leadData?: {
    name?: string;
    phone?: string;
    address?: string;
    problem?: string;
    preferredContact?: 'phone' | 'email' | 'text';
  };
}

// Lead qualification field detection
function detectQualificationField(message: string, currentStep: string): {
  field: 'name' | 'phone' | 'address' | 'problem' | 'contact' | null;
  value: string;
} {
  const lowerMessage = message.toLowerCase().trim();
  
  // Phone number detection (various formats)
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = message.match(phoneRegex);
  
  // Email detection
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = message.match(emailRegex);
  
  // Address detection (contains street, st, ave, road, rd, etc.)
  const addressKeywords = ['street', 'st', 'avenue', 'ave', 'road', 'rd', 'drive', 'dr', 'lane', 'ln', 'court', 'ct', 'blvd', 'boulevard'];
  const hasAddressKeywords = addressKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Name detection (2-3 words, no numbers, no special address keywords)
  const namePattern = /^[A-Za-z\s]{2,30}$/;
  const isName = namePattern.test(message.trim()) && 
                 message.split(' ').length >= 2 && 
                 message.split(' ').length <= 3 &&
                 !hasAddressKeywords &&
                 !phoneMatch &&
                 !emailMatch;
  
  switch (currentStep) {
    case 'qualification':
      // Try to detect what field they're providing
      if (phoneMatch) {
        return { field: 'phone', value: phoneMatch[0] };
      }
      if (emailMatch) {
        return { field: 'contact', value: emailMatch[0] };
      }
      if (hasAddressKeywords || (message.length > 20 && !phoneMatch && !emailMatch)) {
        return { field: 'address', value: message };
      }
      if (isName) {
        return { field: 'name', value: message.trim() };
      }
      // If it's a longer message, likely problem description
      if (message.length > 30) {
        return { field: 'problem', value: message };
      }
      break;
  }
  
  return { field: null, value: message };
}

// Determine next qualification step
function getQualificationStep(
  conversationState: Conversation,
  detectedField: 'name' | 'phone' | 'address' | 'problem' | 'contact' | null,
  leadData: any
): 'name' | 'phone' | 'address' | 'problem' | 'contact' | null {
  if (conversationState.currentStep !== 'qualification') {
    return null;
  }
  
  // If we detected a field, mark it as collected
  if (detectedField && detectedField !== 'contact') {
    leadData[detectedField] = true;
  }
  
  // Determine next missing field
  if (!leadData.name) return 'name';
  if (!leadData.phone) return 'phone';
  if (!leadData.address) return 'address';
  if (!leadData.problem) return 'problem';
  if (!leadData.preferredContact) return 'contact';
  
  return null; // All fields collected
}

// Simulate response delay (1-2 seconds)
function simulateResponseDelay(): Promise<void> {
  const delay = 1000 + Math.random() * 1000; // 1-2 seconds
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: ChatRequest = await request.json();
    const { message, conversationState, messageHistory } = body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 1000 characters.' },
        { status: 400 }
      );
    }

    // Initialize conversation state if not provided
    const currentConversation: Conversation = conversationState || {
      messages: [],
      currentStep: 'greeting',
      isEmergency: false,
    };

    // Emergency detection
    const isEmergency = detectEmergency(message);
    const emergencyLevel = isEmergency ? getEmergencyLevel(message) : currentConversation.emergencyLevel || 0;
    
    // Update conversation emergency status
    const updatedConversation: Conversation = {
      ...currentConversation,
      isEmergency: currentConversation.isEmergency || isEmergency,
      emergencyLevel: Math.max(emergencyLevel, currentConversation.emergencyLevel || 0),
    };

    // Lead qualification tracking
    let leadData = {
      name: false,
      phone: false,
      address: false,
      problem: false,
      preferredContact: false,
    };

    // Detect qualification field from message
    const detectedField = detectQualificationField(message, updatedConversation.currentStep);
    
    // Determine if we should show qualification form
    const shouldShowQualification = 
      isEmergency || 
      emergencyLevel >= 3 ||
      (updatedConversation.currentStep === 'qualification') ||
      (messageHistory && messageHistory.length >= 2);

    // Get next conversation step
    const nextStep = getNextStep(updatedConversation.currentStep, message);
    updatedConversation.currentStep = nextStep;

    // Get qualification step if in qualification flow
    const qualificationStep = getQualificationStep(
      updatedConversation,
      detectedField.field,
      leadData
    );

    // Simulate AI processing delay (1-2 seconds) for realistic response time
    await simulateResponseDelay();

    // Generate context-aware response
    const response = generateResponse(message, {
      ...updatedConversation,
      messageHistory: messageHistory || [],
      detectedField: detectedField.field,
      leadData,
    });

    // Build response object
    const chatResponse: ChatResponse = {
      response,
      isEmergency,
      emergencyLevel,
      updatedConversation,
      shouldShowQualification,
      qualificationStep: qualificationStep || undefined,
      leadData: detectedField.field ? {
        [detectedField.field]: detectedField.value,
      } : undefined,
    };

    return NextResponse.json(chatResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    // Enhanced error handling
    if (error instanceof SyntaxError) {
      console.error('Chat API - JSON parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error('Chat API error:', error.message, error.stack);
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    console.error('Chat API - Unknown error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'chat-api',
    timestamp: new Date().toISOString(),
  });
}

