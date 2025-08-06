
import React from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fit'; // Added '2xl' and 'fit' for chat
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl', // Good for standard content
    '2xl': 'max-w-2xl', // Good for wider content like chat
    fit: 'max-w-fit', // For content that defines its own width
  };
  
  // For chat, we want it to be tall as well
  const chatModalSpecificStyling = title.toLowerCase().includes("chat") || size === '2xl' ? 
    "h-[90vh] max-h-[700px] md:h-[calc(100vh-12rem)] md:max-h-[800px]" : "";

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] p-4 overflow-y-auto"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-cardBg rounded-xl shadow-2xl w-full ${sizeClasses[size]} ${chatModalSpecificStyling} flex flex-col animate-modal-appear relative overflow-hidden`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl md:text-2xl font-semibold text-textBase">{title}</h2>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-textBase transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-light"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        {/* The children (e.g. ChatInterface) will often need to manage their own scrolling */}
        <div className="flex-grow relative"> 
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
