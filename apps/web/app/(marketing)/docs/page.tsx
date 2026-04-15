import React from 'react';
import { DocContent } from './doc-content';
import { CopyClient } from './copy-client';

export default function DocsPage() {
  return (
    <div className="space-y-16 pb-32">
      {/* Header */}
      <div className="space-y-8">
        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase bg-stripe-purple/5 text-stripe-purple border border-stripe-purple/20">
             Developer Portal
           </div>
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-6xl font-light tracking-tighter text-deep-navy">Documentation</h1>
               <p className="text-lg text-slate mt-4 max-w-xl">
                 Integrate crypto payments in minutes with our simple API.
               </p>
             </div>
             <CopyClient />
           </div>
        </div>
      </div>

      <DocContent />
    </div>
  );
}
