
import React from 'react';
import { ImageType } from '../types';
import { HeartPulseIcon, LungIcon, EyeIcon, SkinIcon } from './icons/Icons';

interface ImageTypeSelectorProps {
  selectedType: ImageType;
  onTypeChange: (type: ImageType) => void;
}

const imageTypes = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.RADIOLOGY, label: 'Radiology', icon: LungIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Dermatoscopy', icon: SkinIcon },
];

const ImageTypeButton: React.FC<{
    type: ImageType;
    label: string;
    icon: React.ElementType;
    isSelected: boolean;
    onClick: (type: ImageType) => void;
}> = ({ type, label, icon: Icon, isSelected, onClick }) => {
    const baseClasses = "flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
    const selectedClasses = "bg-brand-secondary border-brand-secondary text-white shadow-lg scale-105";
    const unselectedClasses = "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-brand-accent dark:hover:border-brand-accent focus:ring-brand-secondary";

    return (
        <button
            onClick={() => onClick(type)}
            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
        >
            <Icon className="h-8 w-8 mb-2" />
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );
};

const ImageTypeSelector: React.FC<ImageTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
