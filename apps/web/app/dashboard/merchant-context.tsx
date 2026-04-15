'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface MerchantContextType {
  user: any;
  merchant: any;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children, user, merchant }: MerchantContextType & { children: ReactNode }) {
  return (
    <MerchantContext.Provider value={{ user, merchant }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
}
