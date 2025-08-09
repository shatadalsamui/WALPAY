"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ onClick, children, disabled = false }: ButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      type="button" 
      disabled={disabled}
      className={`w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-3 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>

  );
};
