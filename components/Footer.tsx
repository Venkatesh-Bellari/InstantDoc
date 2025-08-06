
import React from 'react';
import { APP_TITLE } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bgLighter text-textMuted p-6 text-center mt-auto border-t border-gray-200/70 z-10 relative">
      <div className="container mx-auto">
        <p className="text-md">&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
        <p className="text-xs mt-3 max-w-2xl mx-auto">
          Disclaimer: {APP_TITLE} is an AI-powered assistant and does not provide medical diagnoses.
          Always consult with a qualified healthcare professional for medical advice and treatment.
          In case of emergency, call your local emergency services immediately.
        </p>
        <p className="text-xs mt-2">
          Made with AI assistance.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
