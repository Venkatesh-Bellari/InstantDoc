

import React, { useState } from 'react';
import { UserDashboardProps, PersonalDetails, MedicineReminder } from '../types'; 
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentChartBarIcon,
  PlusCircleIcon,
  TrashIcon,
  PhoneIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon, // Re-added
  XCircleIcon, // Re-added
  ExclamationTriangleIcon // Re-added
} from './icons'; 

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  userName, 
  onLogout, 
  emergencyContacts,
  onAddEmergencyContact,
  onRemoveEmergencyContact,
  personalDetails,
  onEditPersonalDetails,
  medicineReminders,
  onAddMedicineReminder,
  onRemoveMedicineReminder,
  notificationPermission, // Re-added
  onRequestNotificationPermission // Re-added
}) => {
  const recentActivities = [ 
    { id: 1, type: "Chat", detail: "Asked about flu symptoms", time: "2 hours ago" },
    { id: 2, type: "Analysis", detail: "Uploaded lab report", time: "1 day ago" },
  ];
  const healthSummaryPoints = [ 
    "Maintain current fitness routine.",
    "Ensure adequate hydration.",
    "Follow up on recent recommendations.",
  ];

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [contactError, setContactError] = useState('');

  const [newReminderDrugName, setNewReminderDrugName] = useState('');
  const [newReminderHour, setNewReminderHour] = useState('08'); 
  const [newReminderMinute, setNewReminderMinute] = useState('00'); 
  const [newReminderPeriod, setNewReminderPeriod] = useState<'AM' | 'PM'>('AM'); 
  const [newReminderNotes, setNewReminderNotes] = useState('');
  const [reminderError, setReminderError] = useState('');
  
  const inputBaseClasses = "w-full p-2.5 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-md focus:ring-1 focus:ring-brand-light focus:border-brand-light outline-none text-sm";
  const selectBaseClasses = `${inputBaseClasses} appearance-none`;


  const localSanitizePhoneNumber = (phone: string) => phone.replace(/[^0-9]/g, '');

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(''); 

    if (!newContactName.trim()) {
      setContactError("Contact name is required.");
      return;
    }
    if (!newContactPhone.trim()) {
      setContactError("Phone number is required.");
      return;
    }

    const sanitizedPhone = localSanitizePhoneNumber(newContactPhone);
    if (sanitizedPhone.length < 7 || sanitizedPhone.length > 15) {
      setContactError("Please enter a valid phone number (7-15 digits, e.g., 14155552671 for US).");
      return;
    }
    
    onAddEmergencyContact({ 
        name: newContactName, 
        phone: newContactPhone
    });
    setNewContactName('');
    setNewContactPhone('');
    setContactError('');
  };
  
  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReminderError('');

    if (!newReminderDrugName.trim()) {
      setReminderError("Drug name is required.");
      return;
    }

    let hour24 = parseInt(newReminderHour, 10);
    const minute = parseInt(newReminderMinute, 10);

    if (isNaN(hour24) || hour24 < 1 || hour24 > 12) {
        setReminderError("Invalid hour.");
        return;
    }
    if (isNaN(minute) || minute < 0 || minute > 59) {
        setReminderError("Invalid minute.");
        return;
    }

    if (newReminderPeriod === 'PM' && hour24 < 12) {
      hour24 += 12;
    } else if (newReminderPeriod === 'AM' && hour24 === 12) { 
      hour24 = 0;
    }
    
    const time24Format = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    onAddMedicineReminder({
      drugName: newReminderDrugName,
      time: time24Format,
      notes: newReminderNotes.trim() || undefined
    });

    setNewReminderDrugName('');
    setNewReminderHour('08');
    setNewReminderMinute('00');
    setNewReminderPeriod('AM');
    setNewReminderNotes('');
    setReminderError('');
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


  const formatHeight = (details: PersonalDetails | null): string => {
    if (!details) return 'N/A';
    if (details.heightUnit === 'cm' && details.heightCm) {
      return `${details.heightCm} cm`;
    }
    if (details.heightUnit === 'ft_in' && details.heightFeet) {
      const inchesDisplay = details.heightInches ? ` ${details.heightInches} in` : '';
      return `${details.heightFeet} ft${inchesDisplay}`;
    }
    return 'N/A';
  };
  
  const formatWeight = (details: PersonalDetails | null): string => {
    if (!details || !details.weight) return 'N/A';
    return `${details.weight} ${details.weightUnit}`;
  }

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));


  return (
    <div className="py-8 md:py-12 animate-modal-appear">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-textBase mb-3">
          Welcome Back, <span className="text-brand">{userName || "User"}!</span>
        </h1>
        <p className="text-lg text-textMuted">Here's your personal health dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Profile Overview Card */}
        <div className="bg-cardBg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="w-10 h-10 text-accent mr-3" />
            <h2 className="text-2xl font-semibold text-textBase">My Profile</h2>
          </div>
          {personalDetails ? (
            <div className="text-sm text-textMuted space-y-1 mb-3">
              {personalDetails.fullName && <p>Name: {personalDetails.fullName}</p>}
              <p>Age: {personalDetails.age || 'N/A'} years</p>
              <p>Weight: {formatWeight(personalDetails)}</p>
              <p>Height: {formatHeight(personalDetails)}</p>
            </div>
          ) : (
            <p className="text-textMuted mb-3">Your profile details are not yet complete.</p>
          )}
          <button 
            onClick={onEditPersonalDetails}
            className="flex items-center text-sm text-brand hover:underline mt-2"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-1" />
            {personalDetails && (personalDetails.age || personalDetails.fullName) ? 'Edit Profile Details' : 'Complete Your Profile'}
          </button>
        </div>

        {/* Health Summary Card */}
        <div className="bg-cardBg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <DocumentChartBarIcon className="w-10 h-10 text-brand-dark mr-3" />
            <h2 className="text-2xl font-semibold text-textBase">Health Summary</h2>
          </div>
          <ul className="space-y-2 text-textMuted list-disc list-inside">
            {healthSummaryPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
           <p className="text-xs text-textLight mt-4">*AI insights will improve as you use the app and complete your profile.</p>
        </div>
        
        {/* Emergency Contacts Card */}
        <div className="bg-cardBg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
                <PhoneIcon className="w-10 h-10 text-emergency mr-3" />
                <h2 className="text-2xl font-semibold text-textBase">Emergency Contacts</h2>
            </div>
            <form onSubmit={handleAddContactSubmit} className="mb-4 space-y-3">
                <input 
                    type="text" 
                    placeholder="Contact Name" 
                    value={newContactName} 
                    onChange={(e) => setNewContactName(e.target.value)}
                    className={inputBaseClasses}
                    aria-label="Emergency contact name"
                />
                <input 
                    type="tel" 
                    placeholder="Phone (e.g. 14155552671)" 
                    value={newContactPhone} 
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className={inputBaseClasses}
                    aria-label="Emergency contact phone"
                />
                {contactError && <p className="text-xs text-red-500 px-1">{contactError}</p>}
                <button type="submit" className="w-full flex items-center justify-center p-2.5 bg-brand hover:bg-brand-dark text-white rounded-md transition-colors font-medium text-sm">
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Contact
                </button>
            </form>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {emergencyContacts.length > 0 ? emergencyContacts.map(contact => (
                    <div key={contact.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border border-gray-200">
                        <div>
                            <p className="font-medium text-sm text-textBase">{contact.name}</p>
                            <p className="text-xs text-textMuted">{contact.phone}</p>
                        </div>
                        <button onClick={() => onRemoveEmergencyContact(contact.id)} aria-label={`Remove emergency contact ${contact.name}`} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                    <p className="text-sm text-textMuted text-center">No contacts added yet.</p>
                )}
            </div>
        </div>

        {/* Medicine Reminders Card */}
        <div className="bg-cardBg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
                <BellIcon className="w-10 h-10 text-blue-500 mr-3" />
                <h2 className="text-2xl font-semibold text-textBase">Medicine Reminders</h2>
            </div>
            
             {/* Notification Permission UI */}
            <div className="mb-4 p-3 rounded-md text-sm 
                ${notificationPermission === 'granted' ? 'bg-green-100 text-green-700 border border-green-200' : 
                  notificationPermission === 'denied' ? 'bg-red-100 text-red-700 border border-red-200' : 
                  'bg-yellow-100 text-yellow-700 border border-yellow-200'}"
            >
                {notificationPermission === 'granted' && (
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        Desktop notifications are enabled for reminders.
                    </div>
                )}
                {notificationPermission === 'denied' && (
                    <div className="flex items-center">
                        <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        Desktop notifications are blocked. Please enable them in browser settings to receive alerts.
                    </div>
                )}
                {notificationPermission === 'default' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            Enable desktop notifications for reminders?
                        </div>
                        <button 
                            onClick={onRequestNotificationPermission}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors flex-shrink-0"
                        >
                            Enable Notifications
                        </button>
                    </div>
                )}
            </div>
            
            <form onSubmit={handleAddReminderSubmit} className="mb-4 space-y-3">
                <input 
                    type="text" 
                    placeholder="Drug Name" 
                    value={newReminderDrugName} 
                    onChange={(e) => setNewReminderDrugName(e.target.value)}
                    className={inputBaseClasses}
                    aria-label="Drug name for reminder"
                />
                <div className="flex space-x-2">
                    <select 
                        value={newReminderHour} 
                        onChange={(e) => setNewReminderHour(e.target.value)} 
                        className={selectBaseClasses + " w-1/3"}
                        aria-label="Reminder hour"
                    >
                        {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select 
                        value={newReminderMinute} 
                        onChange={(e) => setNewReminderMinute(e.target.value)} 
                        className={selectBaseClasses + " w-1/3"}
                        aria-label="Reminder minute"
                    >
                        {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select 
                        value={newReminderPeriod} 
                        onChange={(e) => setNewReminderPeriod(e.target.value as 'AM' | 'PM')} 
                        className={selectBaseClasses + " w-1/3"}
                        aria-label="Reminder period AM/PM"
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
                 <textarea 
                    placeholder="Optional Notes (e.g., take with food)" 
                    value={newReminderNotes} 
                    onChange={(e) => setNewReminderNotes(e.target.value)}
                    className={`${inputBaseClasses} min-h-[60px]`}
                    aria-label="Optional notes for medicine reminder"
                    rows={2}
                />
                {reminderError && <p className="text-xs text-red-500 px-1">{reminderError}</p>}
                <button type="submit" className="w-full flex items-center justify-center p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-medium text-sm">
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Reminder
                </button>
            </form>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {medicineReminders.length > 0 ? medicineReminders.map(reminder => (
                    <div key={reminder.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div>
                            <p className="font-medium text-sm text-textBase flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1.5 text-blue-500 flex-shrink-0" />
                                {reminder.drugName} - {formatTimeTo12Hour(reminder.time)}
                            </p>
                            {reminder.notes && <p className="text-xs text-textMuted mt-0.5 ml-5 italic">{reminder.notes}</p>}
                        </div>
                        <button 
                            onClick={() => onRemoveMedicineReminder(reminder.id)} 
                            aria-label={`Remove reminder for ${reminder.drugName}`}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 flex-shrink-0 ml-2"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                    <p className="text-sm text-textMuted text-center">No medicine reminders set.</p>
                )}
            </div>
        </div>


        {/* Recent Activity Card */}
        <div className="bg-cardBg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow lg:col-span-3">
          <div className="flex items-center mb-4">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-emerald-500 mr-3" />
            <h2 className="text-2xl font-semibold text-textBase">Recent Activity</h2>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {recentActivities.length > 0 ? recentActivities.map(activity => (
              <div key={activity.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-textBase">{activity.type}: <span className="font-normal">{activity.detail}</span></p>
                <p className="text-xs text-textLight">{activity.time}</p>
              </div>
            )) : (
              <p className="text-textMuted">No recent activity to show.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;