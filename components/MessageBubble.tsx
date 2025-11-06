'use client';

import { Message } from '@/types';
import { formatDate } from '@/lib/utils';
import { detectEmergency } from '@/lib/ai-responses';

interface MessageBubbleProps {
  message: Message;
  isEmergency?: boolean;
}

export default function MessageBubble({ message, isEmergency }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isEmergencyMessage = isEmergency || detectEmergency(message.text);

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : isEmergencyMessage
            ? 'bg-red-50 text-red-900 border-2 border-red-300 rounded-bl-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {isEmergencyMessage && !isUser && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-red-500 text-xs font-semibold">🚨 URGENT</span>
          </div>
        )}
        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <p
          className={`text-xs mt-1.5 ${
            isUser ? 'text-white/70' : isEmergencyMessage ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {formatDate(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

