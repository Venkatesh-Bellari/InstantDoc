import React from 'react';
import { Feature, FeatureCardProps } from '../types'; // Ensure FeatureCardProps is imported

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onSelectFeature, isLoggedIn, onLoginPrompt }) => {
  const { Icon, title, description } = feature;

  const handleClick = () => {
    if (isLoggedIn) {
      onSelectFeature(feature);
    } else {
      onLoginPrompt();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  if (!isLoggedIn) {
    // Compact view for logged-out users
    return (
      <div
        className="bg-cardBg p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center h-full border border-gray-200 hover:border-accent-light group"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyPress={handleKeyPress}
        aria-label={`Feature: ${title}. Login to access.`}
      >
        <div className="p-3 bg-accent-light/50 rounded-full mb-4 inline-block">
            <Icon className="w-8 h-8 text-accent-dark opacity-70" />
        </div>
        <h3 className="text-lg font-semibold text-textBase group-hover:text-accent-dark transition-colors">{title}</h3>
        {/* Description is hidden for logged-out users to keep it compact */}
         <p className="text-xs text-textLight mt-2">Login to explore this feature.</p>
      </div>
    );
  }

  // Full view for logged-in users
  return (
    <div
      className="bg-cardBg p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center text-center transform hover:-translate-y-2 h-full border border-gray-100 hover:border-brand-light group"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
      aria-label={`Select feature: ${title}`}
    >
      <div className="p-4 bg-brand-light rounded-full mb-5 inline-block transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-10 h-10 text-brand-dark" />
      </div>
      <h3 className="text-xl font-semibold text-textBase mb-2">{title}</h3>
      <div className="w-12 h-0.5 bg-brand-dark/30 mx-auto mb-3 transition-all duration-300 group-hover:w-16 group-hover:bg-brand-dark"></div>
      <p className="text-textMuted text-md flex-grow">{description}</p>
    </div>
  );
};

export default FeatureCard;