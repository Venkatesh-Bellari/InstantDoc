import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PersonalDetails, PersonalDetailsModalProps } from '../types';

const PersonalDetailsModal: React.FC<PersonalDetailsModalProps> = ({ isOpen, onClose, onSave, currentDetails }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft_in'>('cm');
  const [error, setError] = useState<string | null>(null);

  const inputBaseClasses = "w-full p-2.5 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-md focus:ring-1 focus:ring-brand-light focus:border-brand-light outline-none";


  useEffect(() => {
    if (isOpen) {
      if (currentDetails) {
        setFullName(currentDetails.fullName || '');
        setAge(currentDetails.age || '');
        setWeight(currentDetails.weight || '');
        setWeightUnit(currentDetails.weightUnit || 'kg');
        setHeightCm(currentDetails.heightCm || '');
        setHeightFeet(currentDetails.heightFeet || '');
        setHeightInches(currentDetails.heightInches || '');
        setHeightUnit(currentDetails.heightUnit || 'cm');
      } else {
        // Reset to defaults if no current details (e.g. first time)
        setFullName('');
        setAge('');
        setWeight('');
        setWeightUnit('kg');
        setHeightCm('');
        setHeightFeet('');
        setHeightInches('');
        setHeightUnit('cm');
      }
      setError(null); // Reset error when modal opens or currentDetails change
    }
  }, [currentDetails, isOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!age.trim() || !/^\d+$/.test(age) || parseInt(age) <= 0 || parseInt(age) > 120) {
      setError("Please enter a valid age (1-120).");
      return;
    }
    if (!weight.trim() || !/^\d*\.?\d+$/.test(weight) || parseFloat(weight) <= 0) {
      setError("Please enter a valid weight.");
      return;
    }
    if (heightUnit === 'cm' && (!heightCm.trim() || !/^\d*\.?\d+$/.test(heightCm) || parseFloat(heightCm) <= 0)) {
      setError("Please enter a valid height in cm.");
      return;
    }
    if (heightUnit === 'ft_in') {
      if (!heightFeet.trim() || !/^\d+$/.test(heightFeet) || parseInt(heightFeet) < 0) {
        setError("Please enter valid feet.");
        return;
      }
      // Inches can be 0. Allow empty string for inches if feet are provided. Default to 0 if empty.
      const inchesValue = heightInches.trim() === '' ? '0' : heightInches;
      if (!/^\d*\.?\d+$/.test(inchesValue) || parseFloat(inchesValue) < 0 || parseFloat(inchesValue) >= 12) {
        setError("Please enter valid inches (0-11.99).");
        return;
      }
    }
    
    onSave({ 
        fullName,
        age, 
        weight, weightUnit, 
        heightCm: heightUnit === 'cm' ? heightCm : '', 
        heightFeet: heightUnit === 'ft_in' ? heightFeet : '', 
        heightInches: heightUnit === 'ft_in' ? (heightInches.trim() === '' ? '0' : heightInches) : '', 
        heightUnit 
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Health Profile" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-sm text-textMuted mb-4">
          Providing these details helps us tailor your health insights. This is optional but recommended.
        </p>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-textBase mb-1">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputBaseClasses}
            placeholder="e.g., Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-textBase mb-1">Age (Years)</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputBaseClasses}
            placeholder="e.g., 30"
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-textBase mb-1">Weight</label>
          <div className="flex space-x-2">
            <input
              type="number"
              id="weight"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`${inputBaseClasses} w-2/3`}
              placeholder="e.g., 70"
            />
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
              className={`${inputBaseClasses} w-1/3`}
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-textBase mb-1">Height</label>
          <select
            value={heightUnit}
            onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'ft_in')}
            className={`${inputBaseClasses} mb-2`}
          >
            <option value="cm">Centimeters (cm)</option>
            <option value="ft_in">Feet & Inches (ft/in)</option>
          </select>

          {heightUnit === 'cm' && (
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 175"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className={inputBaseClasses}
            />
          )}
          {heightUnit === 'ft_in' && (
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Feet"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className={`${inputBaseClasses} w-1/2`}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Inches (0-11.9)"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className={`${inputBaseClasses} w-1/2`}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-textMuted bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Skip for Now
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-md transition-colors"
          >
            Save Details
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PersonalDetailsModal;