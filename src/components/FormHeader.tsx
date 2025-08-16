import React from 'react';
import './FormHeader.css';

const FormHeader: React.FC = () => {
  return (
    <div className="form-header">
      <img src="/logo.png" alt="Space Matrix Logo" className="form-header-logo" />
    </div>
  );
};

export default FormHeader;
