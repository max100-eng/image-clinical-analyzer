import React from 'react';
import { ImageType } from '../types';
import { HeartPulseIcon, LungIcon, EyeIcon, SkinIcon, BeakerIcon, FlaskIcon } from './icons/Icons';

interface ImageTypeSelectorProps {
  selectedType: ImageType;
  onTypeChange: (type: ImageType) => void;
}

const imageTypes = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.RADIOLOGY, label: 'Radiología', icon: LungIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Dermatoscopia', icon: SkinIcon },
  { type: ImageType.URINALYSIS, label: 'Urianálisis', icon: BeakerIcon },
  { type: ImageType.TOXICOLOGY, label: 'Toxicología', icon: FlaskIcon },
];

const ImageTypeButton: React.FC<{
    type: ImageType;
    label: string;
    icon: React.ElementType;
    isSelected: boolean;
    onClick: (type: ImageType) => void;
}> = ({ type, label, icon: Icon, isSelected, onClick }) => {
    return (
        <button
            onClick={() => onClick(type)}
            className={`flex flex-col items-center justify-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-secondary/20 ${
                isSelected 
                ? "bg-brand-primary border-brand-primary text-white shadow-xl scale-105 z-10" 
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-secondary/50 hover:bg-brand-secondary/5"
            }`}
        >
            <div className={`p-3 rounded-xl mb-3 transition-colors ${isSelected ? "bg-white/20" : "bg-gray-50 dark:bg-gray-700"}`}>
                <Icon className={`h-8 w-8 ${isSelected ? "text-white" : "text-brand-secondary"}`} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">{label}</span>
        </button>
    );
};

const ImageTypeSelector: React.FC<ImageTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {imageTypes.map(({ type, label, icon }) => (
        <ImageTypeButton
            key={type}
            type={type}
            label={label}
            icon={icon}
            isSelected={selectedType === type}
            onClick={onTypeChange}
        />
      ))}
    </div>
  );
};

export default ImageTypeSelector;
