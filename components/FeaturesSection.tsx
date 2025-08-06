import React from 'react';
import { Feature } from '../types';
import FeatureCard from './FeatureCard';
import { SparklesIcon } from './icons'; 

interface FeaturesSectionProps {
  features: Feature[];
  onSelectFeature: (feature: Feature) => void; // For logged-in users
  isLoggedIn: boolean;
  onLoginPrompt: () => void; // For logged-out users, to prompt login
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, onSelectFeature, isLoggedIn, onLoginPrompt }) => {
  return (
    <section id="features-section" className="py-12 md:py-20 bg-white/50 rounded-xl shadow-lg mt-12 md:mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
           <div className="inline-flex items-center space-x-2 bg-accent-light text-accent-dark px-3 py-1 rounded-full text-sm font-semibold mb-4">
             <SparklesIcon className="h-5 w-5" />
            <span>{isLoggedIn ? "Comprehensive AI Health Services" : "Explore Our Key Features"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-textBase mb-4">
            {isLoggedIn ? "Comprehensive Health Support at Your Fingertips" : "Discover What InstantDoc Offers"}
          </h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            {isLoggedIn 
              ? "Discover the diverse ways InstantDoc's AI can assist in your health journey, from answering questions to analyzing symptoms."
              : "InstantDoc provides a suite of AI-powered tools to assist your health journey. Log in to access detailed functionalities."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.key} 
              feature={feature} 
              onSelectFeature={onSelectFeature} 
              isLoggedIn={isLoggedIn}
              onLoginPrompt={onLoginPrompt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;