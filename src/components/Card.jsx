import React from 'react';

export const Card = ({ children, className = '', style = {}, ...props }) => {
  return (
    <div className={`glass-panel p-6 ${className}`} style={style} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, action, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <h3 className="text-xl font-semibold">{title}</h3>
    {action && <div>{action}</div>}
  </div>
);
