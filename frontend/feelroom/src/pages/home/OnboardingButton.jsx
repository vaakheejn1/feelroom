// src/components/ui/PinkOnboardingButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PinkOnboardingButton = ({ label = '시작하기', to = '/onboarding' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(to)}
            className="
        bg-pink-400 hover:bg-pink-500
        text-white font-semibold
        px-4 py-2
        rounded-full
        shadow-md hover:shadow-lg
        transition
        duration-200
      "
        >
            {label}
        </button>
    );
};

export default PinkOnboardingButton;
