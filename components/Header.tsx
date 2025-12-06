
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClinicalAppLogo, LogOutIcon, UserIcon, MailIcon, MessageCircleIcon, DownloadIcon } from './icons/Icons';

interface HeaderProps {
    onInstallClick: () => void;
    isAppInstalled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onInstallClick, isAppInstalled }) => {
  const { logout, user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            {/* New Dedicated Icon Styling */}
            <div className="shadow-md rounded-[10px] overflow-hidden">
                <ClinicalAppLogo className="h-10 w-10 text-brand-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-tight">
              Clinical Intelligence
              <span className="block text-xs font-normal text-brand-secondary dark:text-brand-accent">AI Image Analysis</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            
            <div className="flex items-center gap-3 sm:gap-4 pr-2 sm:pr-4 sm:mr-2 border-r border-gray-200 dark:border-gray-600">
                {!isAppInstalled && (
                    <button
                        onClick={onInstallClick}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary font-medium rounded-lg transition-all text-xs sm:text-sm"
                        aria-label="Install Application"
                        title="Install Application"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Install App</span>
                    </button>
                )}
                <a 
                    href="https://wa.me/34670887715?text=Hola,%20necesito%20ayuda%20con%20la%20app%20Clinical%20AI" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-all"
                    aria-label="Contact via WhatsApp"
                    title="WhatsApp Support"
                >
                    <MessageCircleIcon className="h-6 w-6" />
                </a>
                <a 
                    href="mailto:support@clinicalai.com"
                    className="hidden sm:block p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
                    aria-label="Contact via Email"
                    title="Email Support"
                >
                    <MailIcon className="h-6 w-6" />
                </a>
            </div>
            
            {user && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 py-1 px-3 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{user.email}</span>
                </div>
            )}

            <button 
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors pl-2"
                title="Sign Out"
            >
                <LogOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
