'use client';

import { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

interface LeadQualificationProps {
  onComplete: (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    propertyType?: string;
    problem: string;
    emergencyLevel: number;
    preferredContact: 'phone' | 'email' | 'text';
    availability?: string;
    preferredTime?: string;
  }) => void;
  emergencyLevel: number;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  problem: string;
  emergencyLevel: number;
  preferredContact: 'phone' | 'email' | 'text';
  availability: string;
  preferredTime: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const STORAGE_KEY = 'lead-qualification-progress';
const TOTAL_STEPS = 4;

export default function LeadQualification({ onComplete, emergencyLevel }: LeadQualificationProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
    problem: '',
    emergencyLevel: emergencyLevel || 1,
    preferredContact: 'phone',
    availability: '',
    preferredTime: '',
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = getLocalStorage(STORAGE_KEY);
    if (saved) {
      setFormData((prev) => ({ ...prev, ...saved.data }));
      setStep(saved.step || 1);
    }
  }, []);

  // Save progress to localStorage whenever form data changes
  useEffect(() => {
    setLocalStorage(STORAGE_KEY, {
      step,
      data: formData,
      timestamp: new Date().toISOString(),
    });
  }, [formData, step]);

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number (e.g., (555) 123-4567)';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Address is required';
    if (address.trim().length < 5) return 'Please enter a complete address';
    return '';
  };

  const validateProblem = (problem: string): string => {
    if (!problem.trim()) return 'Problem description is required';
    if (problem.trim().length < 10) return 'Please provide more details (at least 10 characters)';
    return '';
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (currentStep === 1) {
      const nameError = validateName(formData.name);
      const phoneError = validatePhone(formData.phone);
      const emailError = validateEmail(formData.email);
      if (nameError) newErrors.name = nameError;
      if (phoneError) newErrors.phone = phoneError;
      if (emailError) newErrors.email = emailError;
    }

    if (currentStep === 2) {
      const problemError = validateProblem(formData.problem);
      if (problemError) newErrors.problem = problemError;
    }

    if (currentStep === 3) {
      const addressError = validateAddress(formData.address);
      if (addressError) newErrors.address = addressError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      setErrors({});
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    // Final validation
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      // Go to first step with errors
      setStep(1);
      return;
    }

    // Clear saved progress
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    onComplete({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      propertyType: formData.propertyType,
      problem: formData.problem.trim(),
      emergencyLevel: formData.emergencyLevel,
      preferredContact: formData.preferredContact,
      availability: formData.availability,
      preferredTime: formData.preferredTime,
    });
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateEmergencyLevel = (level: number) => {
    updateField('emergencyLevel', level);
  };

  const isEmergency = emergencyLevel >= 3 || formData.emergencyLevel >= 3;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 ${isEmergency ? 'border-2 border-red-300' : ''}`}>
      {/* Emergency Alert */}
      {isEmergency && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-semibold text-red-800">Emergency Request</p>
              <p className="text-sm text-red-600">We'll prioritize your request and respond within 2 hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((step / TOTAL_STEPS) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              isEmergency ? 'bg-red-500' : 'bg-primary'
            }`}
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-3">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex-1 text-center ${
                stepNum < step
                  ? 'text-primary'
                  : stepNum === step
                  ? 'text-primary font-semibold'
                  : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum < step
                    ? 'bg-primary text-white'
                    : stepNum === step
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum < step ? '✓' : stepNum}
              </div>
              <p className="text-xs mt-1 hidden sm:block">
                {stepNum === 1 && 'Contact'}
                {stepNum === 2 && 'Problem'}
                {stepNum === 3 && 'Address'}
                {stepNum === 4 && 'Schedule'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Contact Information */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Problem Details */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Details</h3>
            
            {/* Emergency Level Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How urgent is this issue? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { level: 1, label: 'Low', desc: 'Can wait', color: 'bg-gray-100 border-gray-300' },
                { level: 2, label: 'Minor', desc: 'Soon', color: 'bg-blue-100 border-blue-300' },
                { level: 3, label: 'Medium', desc: 'This week', color: 'bg-yellow-100 border-yellow-300' },
                { level: 4, label: 'Urgent', desc: 'Today', color: 'bg-orange-100 border-orange-300' },
                { level: 5, label: 'Emergency', desc: 'Now', color: 'bg-red-100 border-red-300' },
              ].map(({ level, label, desc, color }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateEmergencyLevel(level)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    formData.emergencyLevel === level
                      ? `${color} ring-2 ring-offset-2 ring-primary`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs text-gray-600 mt-1">{desc}</div>
                </button>
              ))}
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe the roofing issue *
              </label>
              <textarea
                value={formData.problem}
                onChange={(e) => updateField('problem', e.target.value)}
                rows={5}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
                  errors.problem ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Please describe the roofing issue in detail. Include any visible damage, when it started, and any relevant information..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.problem.length} characters (minimum 10)
              </p>
              {errors.problem && (
                <p className="mt-1 text-sm text-red-600">{errors.problem}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Address and Property Info */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="State"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateField('propertyType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="multi-unit">Multi-Unit</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Scheduling Availability */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduling Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['phone', 'email', 'text'] as const).map((method) => (
                    <label
                      key={method}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.preferredContact === method
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contact"
                        value={method}
                        checked={formData.preferredContact === method}
                        onChange={() => updateField('preferredContact', method)}
                        className="mr-3"
                      />
                      <span className="capitalize font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When are you available?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Morning', 'Afternoon', 'Evening', 'Anytime'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => updateField('preferredTime', time)}
                      className={`px-4 py-2 border-2 rounded-lg transition-all ${
                        formData.preferredTime === time
                          ? 'border-primary bg-blue-50 font-medium'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.availability}
                  onChange={(e) => updateField('availability', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Any additional scheduling preferences or notes..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            isEmergency
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-primary hover:bg-blue-700 text-white'
          }`}
        >
          {step === TOTAL_STEPS ? 'Submit Request' : 'Next →'}
        </button>
      </div>

      {/* Progress Saved Indicator */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Your progress is automatically saved
      </div>
    </div>
  );
}

