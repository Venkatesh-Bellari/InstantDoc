
import React from 'react';
import { InformationCircleIcon, SparklesIcon } from './icons';

const AboutUsSection: React.FC = () => {
  return (
    <section id="about-us-section" className="py-12 md:py-20 bg-cardBg/70 rounded-xl shadow-lg mt-12 md:mt-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 bg-accent-light text-accent-dark px-3 py-1 rounded-full text-sm font-semibold mb-4">
            <InformationCircleIcon className="h-5 w-5" />
            <span>Our Mission & Vision</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-textBase mb-4">
            About InstantDoc
          </h2>
          <p className="text-lg text-textMuted max-w-3xl mx-auto">
            We are dedicated to revolutionizing healthcare access through innovative AI technology, making personalized health insights available to everyone, anytime, anywhere.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6 text-textBase">
            <div>
              <h3 className="text-2xl font-semibold mb-2 flex items-center">
                <SparklesIcon className="h-6 w-6 text-brand mr-2"/>
                Our Vision
              </h3>
              <p className="text-textMuted leading-relaxed">
                To be the leading AI-powered health companion, empowering individuals to take proactive control of their well-being with confidence and ease. We envision a future where healthcare is not just reactive but predictive and deeply personalized.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2 flex items-center">
                 <SparklesIcon className="h-6 w-6 text-brand mr-2"/>
                Our Mission
              </h3>
              <p className="text-textMuted leading-relaxed">
                To provide accessible, reliable, and empathetic AI-driven health support. We aim to break down barriers to health information, offer intelligent symptom analysis, and guide users towards better health outcomes through cutting-edge technology and user-centric design.
              </p>
            </div>
             <div>
              <h3 className="text-2xl font-semibold mb-2 flex items-center">
                 <SparklesIcon className="h-6 w-6 text-brand mr-2"/>
                Our Team
              </h3>
              <p className="text-textMuted leading-relaxed">
                InstantDoc is built by a passionate team of doctors, AI researchers, engineers, and designers committed to making a positive impact on global health. We combine medical expertise with technological innovation to create solutions that truly matter. (Placeholder text)
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center">
            {/* You can add an illustrative image or graphic here */}
            <div className="w-full max-w-md h-72 bg-gradient-to-br from-brand-light via-accent-light to-pink-200 rounded-xl shadow-xl flex items-center justify-center p-8">
                <SparklesIcon className="w-24 h-24 text-white opacity-70 animate-subtle-pulse"/>
                 <p className="text-center text-xl font-semibold text-white/80 ml-4">Innovating Health, Together.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;