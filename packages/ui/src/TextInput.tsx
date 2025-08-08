  "use client"
import { useState } from "react";

export const TextInput = ({
    placeholder,
    onChange,
    label,
    type = "text",
    value,
    showEye = false
}: {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
    type?: string;
    value?: string | number;
    showEye?: boolean;
}) => {
    const [showContent, setShowContent] = useState(false);

    const inputType = showEye ? (showContent ? "text" : "password") : type;

    return (
        <div className="pt-2 relative">
            <label className="block mb-2 text-sm font-medium text-gray-900">{label}</label>
            <input 
                onChange={(e) => onChange(e.target.value)} 
                type={inputType} 
                id="first_name" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-20" 
                placeholder={placeholder}
                value={value}
            />
            {showEye && (
                <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-600 hover:text-gray-900 focus:outline-none"
                    style={{ top: '2.5rem' }} // Adjust this value to align the button vertically
                    onClick={() => setShowContent(!showContent)}
                >
                    {showContent ? "Hide" : "Show"}
                </button>
            )}
        </div>
    );
}