import React from 'react';
import './FormHeader.css';

const FormHeader: React.FC = () => {
  return (
    <div className="form-header">
      <div className="form-header-container">
        <img src="/logo.png" alt="Space Matrix Logo" className="form-header-logo" />
      </div>
    </div>
  );
};

export default FormHeader;
