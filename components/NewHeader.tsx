
import React, { useState } from 'react';
import { APP_TITLE } from '../constants';
import { UserIcon, MenuIcon, CloseIcon, ArrowLeftOnRectangleIcon } from './icons';
import { AuthTabType, NewHeaderProps, AppView } from '../types';

const NewHeader: React.FC<NewHeaderProps> = ({
  onAskAi,
  onAuthAction,
  isLoggedIn,
  onLogout,
  currentAppView,
  onNavigateToView
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  interface NavLinkItem {
    name: string;
    targetView: AppView;
    sectionId: string;
  }

  const mainNavLinks: NavLinkItem[] = [
    { name: 'Home', targetView: 'home', sectionId: 'hero-section' },
    { name: 'Features', targetView: 'features', sectionId: 'features-section' },
    { name: 'About Us', targetView: 'about', sectionId: 'about-us-section' },
  ];

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavLinkItem) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onNavigateToView('home', item.sectionId);
    } else {
      onNavigateToView(item.targetView, item.sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleAuthOrDashboardClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, action: 'auth' | 'dashboard') => {
    e.preventDefault();
    if (action === 'auth' && !isLoggedIn) {
      onAuthAction('login');
    } else if (action === 'dashboard' && isLoggedIn) {
      onNavigateToView('dashboard');
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onLogout();
    setIsMobileMenuOpen(false);
  }

  const renderNavLink = (item: NavLinkItem, isMobile: boolean = false) => (
    <a
      key={item.name}
      href={`#${item.sectionId}`}
      onClick={(e) => handleNavLinkClick(e, item)}
      className={`transition-colors font-medium
        ${isMobile
          ? 'text-textMuted hover:text-brand py-2.5 text-center rounded-md hover:bg-gray-100 block'
          : `text-textMuted hover:text-brand ${currentAppView === item.targetView ? 'text-brand font-semibold' : ''}`
        }`}
    >
      {item.name}
    </a>
  );

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#hero-section"
            onClick={(e) => handleNavLinkClick(e, {name: 'Home', targetView: 'home', sectionId: 'hero-section'})}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand rounded-sm"
            aria-label={`${APP_TITLE} Home`}
          >
            {/* SparklesIcon removed from here */}
            <span className="text-2xl font-bold text-brand transition-opacity duration-200 ease-in-out group-hover:opacity-80">
              {APP_TITLE}.
            </span>
          </a>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-7">
              {mainNavLinks.map(link => renderNavLink(link))}
              {isLoggedIn && (
                <a
                  href="#dashboard"
                  onClick={(e) => handleAuthOrDashboardClick(e, 'dashboard')}
                  className={`text-textMuted hover:text-brand transition-colors font-medium ${currentAppView === 'dashboard' ? 'text-brand font-semibold' : ''}`}
                >
                  Dashboard
                </a>
              )}
            </nav>

            <button
              onClick={onAskAi}
              className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            >
              Ask AI
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogoutClick}
                className="flex items-center text-textMuted hover:text-brand transition-colors font-medium text-sm"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1.5" />
                Logout
              </button>
            ) : (
              <a
                href="#login"
                onClick={(e) => handleAuthOrDashboardClick(e, 'auth')}
                className="flex items-center text-textMuted hover:text-brand transition-colors font-medium text-sm"
              >
                <UserIcon className="h-5 w-5 mr-1.5" />
                Login / Sign Up
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-textMuted hover:text-brand p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-xl z-40 p-5">
          <nav className="flex flex-col space-y-1 mb-4">
            {mainNavLinks.map(link => renderNavLink(link, true))}
            {isLoggedIn && (
              <a
                href="#dashboard"
                onClick={(e) => handleAuthOrDashboardClick(e, 'dashboard')}
                className={`text-textMuted hover:text-brand transition-colors font-medium py-2.5 text-center rounded-md hover:bg-gray-100 block ${currentAppView === 'dashboard' ? 'text-brand bg-gray-100 font-semibold' : ''}`}
              >
                Dashboard
              </a>
            )}
          </nav>
          <button
            onClick={() => {
              onAskAi();
              setIsMobileMenuOpen(false);
            }}
            className="bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full mb-3"
          >
            Ask AI
          </button>
          {isLoggedIn ? (
             <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center text-textMuted hover:text-brand transition-colors font-medium py-2.5 border border-gray-300 rounded-md hover:bg-gray-100"
              >
               <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
          ) : (
            <a
              href="#login"
              onClick={(e) => handleAuthOrDashboardClick(e, 'auth')}
              className="w-full flex items-center justify-center text-textMuted hover:text-brand transition-colors font-medium py-2.5 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Login / Sign Up
            </a>
          )}
        </div>
      )}
    </header>
  );
};

export default NewHeader;
