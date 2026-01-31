import React from 'react';

interface POSCashierLayoutContentProps {
  children: React.ReactNode;
}

const POSCashierLayoutContent: React.FC<POSCashierLayoutContentProps> = ({ children }) => {
  return (
    <div className="w-full mt-0 sm:mt-[5%]" style={{ scrollMarginTop: '64px' }}>
      {children}
    </div>
  );
};

export default POSCashierLayoutContent;
