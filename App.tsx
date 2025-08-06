
import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewHeader from './components/NewHeader';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AboutUsSection from './components/AboutUsSection';
import UserDashboard from './components/UserDashboard';
import ChatInterface from './components/ChatInterface';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import PersonalDetailsModal from './components/PersonalDetailsModal';
import { Feature, FeatureKey, EmergencyContact, AuthTabType, AppView, PersonalDetails, MedicineReminder } from './types';
import { FEATURES, APP_TITLE, GENERAL_CHAT_FEATURE } from './constants';
import { EmergencyIcon, PhoneIcon, ChatBubbleOvalLeftEllipsisIcon, WhatsAppIcon } from './components/icons';

const App: React.FC = () => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentFeatureForChat, setCurrentFeatureForChat] = useState<Feature | null>(null);
  
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState<string>(''); 
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [autoActionStatus, setAutoActionStatus] = useState<string[]>([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false); 
  
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    return savedContacts ? JSON.parse(savedContacts) : [];
  });

  const [medicineReminders, setMedicineReminders] = useState<MedicineReminder[]>(() => {
    const savedReminders = localStorage.getItem('medicineReminders');
    return savedReminders ? JSON.parse(savedReminders) : [];
  });
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  // audioContextRef removed

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestBrowserNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationPermission('granted');
        return;
      }
      if (Notification.permission === 'denied') {
        setNotificationPermission('denied');
        // Optionally inform user how to unblock in browser settings
        console.log("Notification permission was previously denied. User needs to unblock it in browser settings.");
        return;
      }
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } else {
      console.warn("Browser notifications not supported.");
    }
  };

  const displayMedicineNotification = (reminder: MedicineReminder) => {
    if (notificationPermission === 'granted') {
      const formattedTime = formatTimeTo12Hour(reminder.time);
      const title = "Medicine Reminder";
      const body = `Time to take ${reminder.drugName} at ${formattedTime}. ${reminder.notes ? `Notes: ${reminder.notes}` : ''}`;
      const options: NotificationOptions = {
        body: body,
        icon: '/logo.png', // Assuming logo.png is in public folder
        tag: reminder.id, // So new notifications for the same reminder replace old ones
      };
      new Notification(title, options);
      console.log(`Desktop Notification shown for: ${reminder.drugName}`);
    }
  };
  
  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24 || !time24.includes(':')) return "Invalid Time";
    const [hours, minutes] = time24.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "Invalid Time";

    const period = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12; 

    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
  };


  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<AuthTabType>('login');
  
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(() => {
    const savedDetails = localStorage.getItem('personalDetails');
    return savedDetails ? JSON.parse(savedDetails) : null;
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!(localStorage.getItem('personalDetails'))); 
  const [currentAppView, setCurrentAppView] = useState<AppView>(localStorage.getItem('personalDetails') ? 'dashboard' : 'home');
  const [isPersonalDetailsModalOpen, setIsPersonalDetailsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    localStorage.setItem('medicineReminders', JSON.stringify(medicineReminders));
  }, [medicineReminders]);

  useEffect(() => {
    if (personalDetails) {
      localStorage.setItem('personalDetails', JSON.stringify(personalDetails));
      setIsLoggedIn(true); 
    } else {
      localStorage.removeItem('personalDetails');
      setIsLoggedIn(false); 
    }
  }, [personalDetails]);


  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    setEmergencyContacts(prev => [...prev, { ...contact, id: Date.now().toString() }]);
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const addMedicineReminder = (reminder: Omit<MedicineReminder, 'id' | 'lastFiredTimestamp'>) => {
    console.log("Adding medicine reminder:", reminder);
    setMedicineReminders(prev => [...prev, { ...reminder, id: Date.now().toString() }]);
  };

  const removeMedicineReminder = (id: string) => {
    setMedicineReminders(prev => prev.filter(reminder => reminder.id !== id));
  };
  

  useEffect(() => {
    console.log("Medicine reminder check interval set up for desktop notifications.");
    const checkRemindersInterval = setInterval(() => {
      const now = new Date();
      const currentTimeHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayDateStr = now.toDateString(); 

      let changed = false;
      const updatedReminders = medicineReminders.map(reminder => {
        const reminderLastFiredDate = reminder.lastFiredTimestamp ? new Date(reminder.lastFiredTimestamp).toDateString() : null;
        const reminderLastFiredTimeHHMM = reminder.lastFiredTimestamp 
          ? `${String(new Date(reminder.lastFiredTimestamp).getHours()).padStart(2, '0')}:${String(new Date(reminder.lastFiredTimestamp).getMinutes()).padStart(2, '0')}`
          : null;

        if (reminder.time === currentTimeHHMM) {
          if (reminderLastFiredDate !== todayDateStr || reminderLastFiredTimeHHMM !== currentTimeHHMM) {
            console.log(`FIRING Reminder: ${reminder.drugName} at ${reminder.time}.`);
            displayMedicineNotification(reminder); // Display desktop notification
            changed = true;
            return { ...reminder, lastFiredTimestamp: now.getTime() };
          }
        }
        return reminder;
      });

      if (changed) {
        console.log("Updating reminders state due to fired reminder(s).");
        setMedicineReminders(updatedReminders);
      }
    }, 60000); // Check every minute

    return () => {
      console.log("Clearing medicine reminder check interval.");
      clearInterval(checkRemindersInterval);
    };
  }, [medicineReminders, notificationPermission]); // Added notificationPermission to dependencies


  const handleSelectFeature = useCallback((feature: Feature) => {
    if (!isLoggedIn) {
      handleOpenAuthModal('login');
      return;
    }
    setCurrentFeatureForChat(feature);
    setIsChatModalOpen(true);
  }, [isLoggedIn]); 

  const handleOpenGeneralChat = useCallback(() => {
    const generalChatFeature = FEATURES.find(f => f.key === FeatureKey.GENERAL_CHATBOT) || GENERAL_CHAT_FEATURE;
    setCurrentFeatureForChat(generalChatFeature);
    setIsChatModalOpen(true);
  }, []); 
  
  const handleCloseChatModal = useCallback(() => {
    setIsChatModalOpen(false);
    setCurrentFeatureForChat(null);
  }, []);

  const handleOpenAuthModal = (tab: AuthTabType = 'login') => {
    setActiveAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLoginSuccess = (userData: { email: string; fullName?: string }) => { 
    setIsLoggedIn(true); 
    setIsAuthModalOpen(false);

    setPersonalDetails(prevDetails => {
        const existingDetails = prevDetails || JSON.parse(localStorage.getItem('personalDetails') || '{}');
        const newDetailsBase: PersonalDetails = { 
            fullName: userData.fullName || existingDetails?.fullName || '',
            age: existingDetails?.age || '',
            weight: existingDetails?.weight || '',
            weightUnit: existingDetails?.weightUnit || 'kg',
            heightCm: existingDetails?.heightCm || '',
            heightFeet: existingDetails?.heightFeet || '',
            heightInches: existingDetails?.heightInches || '',
            heightUnit: existingDetails?.heightUnit || 'cm',
        };
        if (!existingDetails?.age || (userData.fullName && !existingDetails?.fullName)) { 
            setIsPersonalDetailsModalOpen(true);
        } else {
             setCurrentAppView('dashboard'); 
        }
        return newDetailsBase;
    });
  };

  const handleSavePersonalDetails = (details: PersonalDetails) => {
    setPersonalDetails(details); 
    setIsPersonalDetailsModalOpen(false);
    setCurrentAppView('dashboard'); 
  };

  const handleSkipPersonalDetails = () => {
    setIsPersonalDetailsModalOpen(false);
    if (currentAppView !== 'dashboard') {
      setCurrentAppView('dashboard');
    }
  };
  
  const handleEditPersonalDetails = () => {
    setIsPersonalDetailsModalOpen(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPersonalDetails(null); 
    setCurrentAppView('home'); 
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0); 
  };

 const handleNavigateToView = (view: AppView, sectionId?: string) => {
    if (view === 'dashboard' && !isLoggedIn) {
      handleOpenAuthModal('login');
      return; 
    }

    setCurrentAppView(view);

    setTimeout(() => {
      let targetElementId = sectionId;
      
      if (view === 'home' && !targetElementId && !isLoggedIn) {
        targetElementId = 'hero-section';
      }
      
      if (targetElementId) {
        const element = document.getElementById(targetElementId.startsWith('#') ? targetElementId.substring(1) : targetElementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  };
  
  const sanitizePhoneNumber = (phone: string) => phone.replace(/[^0-9]/g, '');

  const getEmergencyMessageText = useCallback((problem: string, location: { latitude: number; longitude: number } | null): string => {
    const userNameForMsg = (personalDetails?.fullName && personalDetails.fullName.trim() !== "") ? personalDetails.fullName.trim() : 'The user';
    let locationString = "User's location not available at this time.";
    if (location) {
      locationString = `User's current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
    return `Urgent Health Alert for ${userNameForMsg}.\n\nIssue: ${problem || "an unspecified critical health issue"}.\n${locationString}\n\nPlease take immediate action.`;
  }, [personalDetails]);


  const handleEmergencyAlert = useCallback((aiDetectedProblem: string) => {
    setEmergencyMessage(aiDetectedProblem); 
    setIsEmergencyModalOpen(true);
    setCurrentUserLocation(null); 
    setIsFetchingLocation(true); 
    setAutoActionStatus(["Attempting to get your location and prepare alerts..."]);

    const processAlertActions = (locationData: { latitude: number; longitude: number } | null) => {
      setCurrentUserLocation(locationData);
      setIsFetchingLocation(false);
      
      let currentStatusUpdates: string[] = [];
      currentStatusUpdates.push(`Location ${locationData ? 'obtained' : 'not available'}.`);

      if (emergencyContacts.length > 0) {
        emergencyContacts.forEach(contact => {
          currentStatusUpdates.push(`SMS/WhatsApp options ready for ${contact.name} (${contact.phone}).`);
        });
      } else {
        currentStatusUpdates.push("No emergency contacts saved. Please use manual options or call emergency services.");
      }
      setAutoActionStatus(currentStatusUpdates);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location obtained for emergency:", position.coords);
          processAlertActions({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location for emergency:", error.message, error); 
          processAlertActions(null); 
        },
        { timeout: 7000, enableHighAccuracy: true } 
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      processAlertActions(null); 
    }
  }, [emergencyContacts, getEmergencyMessageText]); 

  const closeEmergencyModal = () => {
    setIsEmergencyModalOpen(false);
    setEmergencyMessage(''); 
    setCurrentUserLocation(null);
    setAutoActionStatus([]);
    setIsFetchingLocation(false);
  };

  useEffect(() => {
    if (!process.env.API_KEY) {
      console.warn(
        "Gemini API Key (process.env.API_KEY) is not set. AI features will not work. " +
        "Please ensure it's configured in your environment."
      );
    }
  }, []);

  const BlurryShapes = () => (
    <>
      <div className="blurry-shape bg-brand/30 w-72 h-72 top-[-5%] left-[5%] animate-subtle-pulse animation-delay-2000"></div>
      <div className="blurry-shape bg-accent/30 w-96 h-96 top-[10%] right-[-10%] animate-subtle-pulse"></div>
      <div className="blurry-shape bg-pink-400/30 w-60 h-60 bottom-[5%] left-[20%] animate-subtle-pulse animation-delay-4000"></div>
      <div className="blurry-shape bg-purple-400/30 w-80 h-80 top-[30%] left-[-15%] animate-subtle-pulse animation-delay-1000"></div>
    </>
  );
  
  const commonFeaturesList = FEATURES.filter(f => f.key !== FeatureKey.GENERAL_CHATBOT);
  const displayedUserName = personalDetails?.fullName || "User";

  const renderMainContent = () => {
    if (!isLoggedIn) {
      return (
        <>
          <HeroSection
            onExploreServices={() => handleNavigateToView('home', 'features-section')}
            onAskQuestion={handleOpenGeneralChat}
          />
          <FeaturesSection
            features={commonFeaturesList}
            onSelectFeature={handleSelectFeature}
            isLoggedIn={isLoggedIn}
            onLoginPrompt={() => handleOpenAuthModal('login')}
          />
          <AboutUsSection />
        </>
      );
    } else { 
      if (currentAppView === 'home') {
        return (
          <>
            <HeroSection
              onExploreServices={() => handleNavigateToView('features')}
              onAskQuestion={handleOpenGeneralChat}
            />
            <FeaturesSection
              features={commonFeaturesList}
              onSelectFeature={handleSelectFeature}
              isLoggedIn={isLoggedIn}
              onLoginPrompt={() => handleOpenAuthModal('login')}
            />
            <AboutUsSection />
          </>
        );
      }
      if (currentAppView === 'features') {
        return (
          <FeaturesSection
            features={commonFeaturesList}
            onSelectFeature={handleSelectFeature}
            isLoggedIn={isLoggedIn}
            onLoginPrompt={() => handleOpenAuthModal('login')} 
          />
        );
      }
      if (currentAppView === 'about') {
        return <AboutUsSection />;
      }
      if (currentAppView === 'dashboard') {
        return (
          <UserDashboard
            userName={displayedUserName}
            onLogout={handleLogout}
            emergencyContacts={emergencyContacts}
            onAddEmergencyContact={addEmergencyContact}
            onRemoveEmergencyContact={removeEmergencyContact}
            personalDetails={personalDetails}
            onEditPersonalDetails={handleEditPersonalDetails}
            medicineReminders={medicineReminders}
            onAddMedicineReminder={addMedicineReminder}
            onRemoveMedicineReminder={removeMedicineReminder}
            notificationPermission={notificationPermission} // Re-added
            onRequestNotificationPermission={requestBrowserNotificationPermission} // Re-added
          />
        );
      }
      return (
         <UserDashboard
            userName={displayedUserName}
            onLogout={handleLogout}
            emergencyContacts={emergencyContacts}
            onAddEmergencyContact={addEmergencyContact}
            onRemoveEmergencyContact={removeEmergencyContact}
            personalDetails={personalDetails}
            onEditPersonalDetails={handleEditPersonalDetails}
            medicineReminders={medicineReminders}
            onAddMedicineReminder={addMedicineReminder}
            onRemoveMedicineReminder={removeMedicineReminder}
            notificationPermission={notificationPermission} // Re-added
            onRequestNotificationPermission={requestBrowserNotificationPermission} // Re-added
         />
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bgLight text-textBase overflow-x-hidden relative">
      <BlurryShapes/>
      <NewHeader 
        onAskAi={handleOpenGeneralChat} 
        onAuthAction={handleOpenAuthModal}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        currentAppView={currentAppView}
        onNavigateToView={handleNavigateToView}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10 relative">
        {renderMainContent()}
      </main>

      {currentFeatureForChat && (
        <Modal
          key={currentFeatureForChat.key} 
          isOpen={isChatModalOpen}
          onClose={handleCloseChatModal}
          title={currentFeatureForChat.title}
          size="2xl" 
        >
          <ChatInterface
            feature={currentFeatureForChat}
            onCloseChat={handleCloseChatModal}
            onEmergencyAlert={handleEmergencyAlert}
          />
        </Modal>
      )}

      <AuthModal
        isOpen={isAuthModalOpen && !isLoggedIn} 
        onClose={handleCloseAuthModal}
        initialTab={activeAuthTab}
        onSwitchTab={setActiveAuthTab}
        onLoginSuccess={handleLoginSuccess} 
      />

      <PersonalDetailsModal
        isOpen={isPersonalDetailsModalOpen}
        onClose={handleSkipPersonalDetails} 
        onSave={handleSavePersonalDetails}
        currentDetails={personalDetails}
      />

      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={closeEmergencyModal}
        title="Emergency Alert!"
        size="lg"
      >
        <div className="p-4 md:p-6">
          <div className="text-center">
            <EmergencyIcon className="w-16 h-16 text-emergency mx-auto mb-4" />
            <p className="text-lg font-semibold text-textBase mb-3">
              Urgent: {personalDetails?.fullName || 'The user'} may be experiencing: {emergencyMessage || "a critical health issue"}.
            </p>
          </div>
          
          {autoActionStatus.length > 0 && (
            <div className={`text-sm p-3 rounded-md mb-4 border ${isFetchingLocation ? 'bg-yellow-100 border-yellow-200 text-yellow-700 animate-pulse' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
              <p className="font-medium mb-1">Status:</p>
              <ul className="list-disc list-inside ml-2">
                {autoActionStatus.map((status, index) => (
                  <li key={index}>{status}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-md text-textMuted mb-2 text-center">
            Please act immediately. Review options below.
          </p>

          {currentUserLocation && !isFetchingLocation && (
            <p className="text-sm text-textMuted mb-4 text-center">
              User's Current Location: 
              <a 
                href={`https://www.google.com/maps?q=${currentUserLocation.latitude},${currentUserLocation.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-accent hover:underline ml-1"
              >
                View on Map
              </a>
            </p>
          )}
           {!currentUserLocation && !isFetchingLocation && autoActionStatus.some(s => s.toLowerCase().includes("could not get location") || s.toLowerCase().includes("geolocation not supported") || s.toLowerCase().includes("location not available")) && (
             <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-4 border border-red-200 text-center">Could not retrieve location. Messages will not include specific coordinates.</p>
           )}
          
          {emergencyContacts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-textMuted mb-2 font-medium">Your Emergency Contacts:</p>
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-textBase">{contact.name}</p>
                      <p className="text-xs text-textMuted">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                    <a
                      href={`tel:${sanitizePhoneNumber(contact.phone)}`}
                      className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" /> Call
                    </a>
                    <a
                      href={`sms:${sanitizePhoneNumber(contact.phone)}?&body=${encodeURIComponent(getEmergencyMessageText(emergencyMessage,currentUserLocation ))}`}
                      className={`flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm ${isFetchingLocation ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={(e) => { if (isFetchingLocation) e.preventDefault(); }}
                      aria-disabled={isFetchingLocation}
                    >
                      <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 mr-2" /> SMS
                      {isFetchingLocation && <span className="text-xs ml-1">(loc...)</span>}
                    </a>
                    <a
                      href={`https://wa.me/${sanitizePhoneNumber(contact.phone)}?text=${encodeURIComponent(getEmergencyMessageText(emergencyMessage, currentUserLocation))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm ${isFetchingLocation ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={(e) => { if (isFetchingLocation) e.preventDefault(); }}
                      aria-disabled={isFetchingLocation}
                    >
                      <WhatsAppIcon className="w-4 h-4 mr-2" /> WhatsApp
                      {isFetchingLocation && <span className="text-xs ml-1">(loc...)</span>}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             !autoActionStatus.some(s => s.includes("No emergency contacts saved")) && <p className="text-textMuted text-center">No emergency contacts saved. Please add contacts in your dashboard for faster help.</p>
          )}
          <a
            href="tel:108" 
            className="mt-6 block w-full bg-emergency hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg text-center"
          >
             Call Emergency Services (e.g., 108)
          </a>
          <button
            onClick={closeEmergencyModal}
            className="mt-6 text-sm text-textMuted hover:text-textBase underline block mx-auto"
          >
            Dismiss this alert
          </button>
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default App;
