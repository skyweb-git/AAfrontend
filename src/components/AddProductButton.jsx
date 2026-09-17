import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const AddProductButton = ({ 
  className = "", 
  onClick,
  children = "Add Product",
  variant = "primary" 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('Add Product button clicked');
    
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to product management
      try {
        navigate('/product-management');
      } catch (error) {
        console.error('Navigation error:', error);
        alert('Failed to navigate to product management. Please try again.');
      }
    }
  };

  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors";
  
  const variantClasses = {
    primary: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline: "border border-red-600 text-red-600 hover:bg-red-50"
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
    >
      <Plus size={20} />
      {children}
    </button>
  );
};

export default AddProductButton;
