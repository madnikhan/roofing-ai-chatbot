'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '@/types';
import MessageBubble from './MessageBubble';
import EmergencyDetector from './EmergencyDetector';
import LeadQualification from './LeadQualification';
import SchedulingWidget from './SchedulingWidget';
import { generateId, getLocalStorage, setLocalStorage } from '@/lib/utils';
import { generateResponse, getNextStep, detectEmergency } from '@/lib/ai-responses';

interface ChatInterfaceProps {
  onLeadCaptured?: (lead: any) => void;
}

export default function ChatInterface({ onLeadCaptured }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [],
    currentStep: 'greeting',
    isEmergency: false,
  });
  const [emergencyLevel, setEmergencyLevel] = useState(0);
  const [showQualification, setShowQualification] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load conversation from localStorage
  useEffect(() => {
    const saved = getLocalStorage('chat-conversation');
    if (saved) {
      setConversation(saved);
      setMessages(saved.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })));
    } else {
      // Initial greeting
      const greeting: Message = {
        id: generateId(),
        text: "Hello! I'm here to help with your roofing needs. What can I assist you with today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([greeting]);
      setConversation({
        messages: [greeting],
        currentStep: 'greeting',
        isEmergency: false,
      });
    }
  }, []);

  // Auto-scroll to bottom with smooth behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Save conversation to localStorage
  useEffect(() => {
    setLocalStorage('chat-conversation', conversation);
  }, [conversation]);

  const handleEmergencyDetected = (level: number) => {
    setEmergencyLevel(level);
    setConversation((prev) => ({
      ...prev,
      isEmergency: true,
      emergencyLevel: level,
    }));
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // Update conversation state
    const updatedConversation: Conversation = {
      ...conversation,
      messages: newMessages,
      currentStep: getNextStep(conversation.currentStep, userMessage.text),
      isEmergency: conversation.isEmergency || emergencyLevel > 0,
      emergencyLevel: emergencyLevel || conversation.emergencyLevel,
    };
    setConversation(updatedConversation);

    // Show qualification form if emergency or after a few messages
    if (emergencyLevel > 0 || newMessages.length >= 3) {
      setShowQualification(true);
    }

    // Bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = {
        id: generateId(),
        text: generateResponse(userMessage.text, updatedConversation),
        sender: 'bot',
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, botResponse];
      setMessages(finalMessages);
      setConversation({
        ...updatedConversation,
        messages: finalMessages,
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQualificationComplete = async (leadData: any) => {
    setShowQualification(false);
    setShowScheduling(true);

    // Send lead to API
    if (onLeadCaptured) {
      onLeadCaptured(leadData);
    }

    const confirmation: Message = {
      id: generateId(),
      text: `Thank you ${leadData.name}! I've received your information. Would you like to schedule an appointment?`,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, confirmation]);
  };

  const handleSchedule = async (date: string, time: string) => {
    setShowScheduling(false);
    const confirmation: Message = {
      id: generateId(),
      text: `Perfect! Your appointment is scheduled for ${new Date(date).toLocaleDateString()} at ${time}. We'll contact you at your preferred method. Thank you!`,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, confirmation]);
    setConversation((prev) => ({
      ...prev,
      currentStep: 'completed',
    }));
  };

  const quickReplies = [
    'I have a leak',
    'Need a quote',
    'Schedule inspection',
    'Emergency repair',
    'Water damage',
    'Storm damage',
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scroll-smooth"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {messages.map((message, index) => {
          const isEmergencyMsg = detectEmergency(message.text) || 
                                (conversation.isEmergency && message.sender === 'user');
          return (
            <div
              key={message.id}
              className="animate-fade-in"
              style={{
                animation: `fadeInSlide 0.4s ease-out ${index * 0.05}s both`,
              }}
            >
              <MessageBubble message={message} isEmergency={isEmergencyMsg} />
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start mb-4 animate-fade-in">
            <div className="bg-gray-100 rounded-lg px-4 py-3 rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 mr-2">AI is typing</span>
                <div className="flex space-x-1">
                  <div 
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0s', animationDuration: '1.4s' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showQualification && (
          <div className="animate-fade-in">
            <LeadQualification
              onComplete={handleQualificationComplete}
              emergencyLevel={emergencyLevel || conversation.emergencyLevel || 1}
            />
          </div>
        )}

        {showScheduling && (
          <div className="animate-fade-in">
            <SchedulingWidget
              emergencyLevel={emergencyLevel || conversation.emergencyLevel || 1}
              onSchedule={handleSchedule}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emergency Detector */}
      {input && (
        <div className="px-3 sm:px-4 animate-slide-up">
          <EmergencyDetector
            message={input}
            onEmergencyDetected={handleEmergencyDetected}
          />
        </div>
      )}

      {/* Quick Replies */}
      {messages.length <= 3 && (
        <div className="px-3 sm:px-4 pb-2 animate-fade-in">
          <p className="text-xs text-gray-500 mb-2 px-1">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => {
                  setInput(reply);
                  // Auto-focus input after setting quick reply
                  setTimeout(() => {
                    const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
                    inputEl?.focus();
                  }, 50);
                }}
                className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-3 sm:p-4 rounded-b-lg shadow-lg">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none"
            aria-label="Message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base transition-all duration-200 shadow-sm active:scale-95 disabled:active:scale-100"
            aria-label="Send message"
          >
            <span className="hidden sm:inline">Send</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 px-1">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

