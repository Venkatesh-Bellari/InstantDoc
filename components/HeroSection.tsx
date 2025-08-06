
import React from 'react';
import { SparklesIcon, ChevronRightIcon } from './icons'; 
// Ensure doctor.png is in public folder (e.g. public/doctor.png)
// Correction: doctor.png is now in the 'components' folder.

interface HeroSectionProps {
  onExploreServices: () => void;
  onAskQuestion: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onExploreServices, onAskQuestion }) => {
  const featuresList = ["AI-Powered", "24/7 Available", "Multilingual"]; // Added "Multilingual"

  return (
    <section id="hero-section" className="py-12 md:py-20"> {/* Added id */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-brand-light text-brand-dark px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <SparklesIcon className="h-5 w-5" />
              <span>AI-Powered Health Assistant</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-textBase leading-tight mb-6">
              Your Personal <span className="text-brand">AI Health</span> Companion, Always Here for You
            </h1>
            <p className="text-lg text-textMuted max-w-xl mx-auto md:mx-0 mb-8">
              InstantDoc provides intelligent health insights, symptom analysis, and personalized support to help you navigate your wellness journey with confidence.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start mb-10">
              <button
                onClick={onExploreServices}
                className="bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center group"
              >
                Explore Our Services
                <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={onAskQuestion}
                className="bg-transparent hover:bg-brand-light text-brand border-2 border-brand px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out hover:shadow-md transform hover:-translate-y-1 flex items-center justify-center group"
              >
                Ask a Question
                <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              {featuresList.map((feature, index) => (
                <React.Fragment key={feature}>
                  <div className="flex items-center space-x-2 text-sm text-textMuted">
                    <span className="h-2 w-2 bg-brand rounded-full"></span>
                    <span>{feature}</span>
                  </div>
                  {/* {index < featuresList.length - 1 && <span className="text-textLight">|</span>} */}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative mt-10 md:mt-0 flex justify-center">
            <img
              src="/ai_doctor_illustration.png" 
              alt="AI Doctor Illustration"
              className="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain z-10 relative"
              style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
            />
             {/* Decorative background elements for image */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="w-4/5 h-4/5 bg-brand-light/50 rounded-full transform scale-110 opacity-50 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
