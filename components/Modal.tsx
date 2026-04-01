import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6" role="dialog">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer pointer-events-auto" 
        onClick={onClose}
      />
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-[slideUp_0.3s_ease-out] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-900/50 backdrop-blur">
          <h2 className="text-xl font-black text-white tracking-tight uppercase italic">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-90"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};