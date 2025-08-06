
import React from 'react';

export enum FeatureKey {
  VOICE_ASSISTANCE = 'VOICE_ASSISTANCE',
  EMERGENCY_DETECTION = 'EMERGENCY_DETECTION',
  HEALTH_QA = 'HEALTH_QA',
  VISUAL_SYMPTOM_CHECKER = 'VISUAL_SYMPTOM_CHECKER',
  LAB_REPORT_ANALYSIS = 'LAB_REPORT_ANALYSIS',
  MENTAL_HEALTH_SUPPORT = 'MENTAL_HEALTH_SUPPORT',
  MEAL_FITNESS_PLANS = 'MEAL_FITNESS_PLANS',
  NUTRITIONAL_INSIGHTS = 'NUTRITIONAL_INSIGHTS',
  GENERAL_CHATBOT = 'GENERAL_CHATBOT',
  MEDICINE_REMINDER = 'MEDICINE_REMINDER',
}

export interface Feature {
  key: FeatureKey;
  title: string;
  description: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  promptPlaceholder: string;
  systemInstruction?: string;
  requiresImageUpload?: boolean;
  // requiresVoice?: boolean; // Removed
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text?: string;
  imageUrl?: string; // For user-uploaded images
  timestamp: Date;
  isTyping?: boolean; // For AI typing indicator
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export interface MedicineReminder {
  id: string;
  drugName: string;
  time: string; // HH:MM format
  notes?: string;
  lastFiredTimestamp?: number; // Timestamp of when it last fired for the day/time
}

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  name: string;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export type AuthTabType = 'login' | 'signup';
export type AppView = 'home' | 'features' | 'about' | 'dashboard';

export interface PersonalDetails {
  fullName: string;
  age: string;
  weight: string;
  weightUnit: 'kg' | 'lbs';
  heightFeet: string;
  heightInches: string;
  heightCm: string;
  heightUnit: 'cm' | 'ft_in';
}

// Props for NewHeader
export interface NewHeaderProps {
  onAskAi: () => void;
  onAuthAction: (tab: AuthTabType) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  currentAppView: AppView;
  onNavigateToView: (view: AppView, sectionId?: string) => void;
}

// Props for AuthModal
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTabType;
  onSwitchTab?: (tab: AuthTabType) => void;
  onLoginSuccess: (userData: { email: string; fullName?: string }) => void; 
}

// Props for UserDashboard
export interface UserDashboardProps {
  userName: string;
  onLogout: () => void;
  emergencyContacts: EmergencyContact[];
  onAddEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onRemoveEmergencyContact: (id: string) => void;
  personalDetails: PersonalDetails | null;
  onEditPersonalDetails: () => void;
  medicineReminders: MedicineReminder[];
  onAddMedicineReminder: (reminder: Omit<MedicineReminder, 'id' | 'lastFiredTimestamp'>) => void;
  onRemoveMedicineReminder: (id: string) => void;
  notificationPermission: NotificationPermission; // Re-added
  onRequestNotificationPermission: () => void; // Re-added
}

// Props for PersonalDetailsModal
export interface PersonalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: PersonalDetails) => void;
  currentDetails: PersonalDetails | null;
}

// Props for FeatureCard
export interface FeatureCardProps {
  feature: Feature;
  onSelectFeature: (feature: Feature) => void;
  isLoggedIn: boolean;
  onLoginPrompt: () => void;
}

// Props for FeaturesSection
export interface FeaturesSectionProps {
  features: Feature[];
  onSelectFeature: (feature: Feature) => void;
  isLoggedIn: boolean;
  onLoginPrompt: () => void;
}