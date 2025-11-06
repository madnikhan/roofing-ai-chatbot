'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when chat is open (optional, can be removed if not desired)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Don't prevent scroll - let user scroll page while chat is open
    }
  }, [isOpen, isMinimized]);

  const handleToggle = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsMinimized(false);
      setIsAnimating(false);
    }, 200);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const handleLeadCaptured = async (leadData: any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        // Success - the ChatInterface component handles its own success messaging
      }
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group animate-fade-in"
          aria-label="Open chat"
          aria-expanded="false"
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {/* Pulse animation */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } ${
            isMinimized
              ? 'w-72 sm:w-80 h-16 overflow-hidden'
              : 'w-full sm:w-[400px] h-[600px] max-h-[90vh] max-w-[calc(100vw-2rem)] sm:max-w-[400px] flex flex-col'
          }`}
          role="dialog"
          aria-label="Chat window"
          aria-modal="true"
          aria-live="polite"
        >
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h3 className="font-semibold text-sm sm:text-base">Roofing AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={isMinimized ? handleMaximize : handleMinimize}
                className="p-1.5 hover:bg-white/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                aria-expanded={!isMinimized}
              >
                {isMinimized ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <ChatInterface onLeadCaptured={handleLeadCaptured} />
            </div>
          )}
        </div>
      )}

      {/* Backdrop (optional - uncomment if you want a dark overlay) */}
      {isOpen && !isMinimized && (
        <div
          className="fixed inset-0 z-40 bg-black/10 pointer-events-none transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </>
  );
}


