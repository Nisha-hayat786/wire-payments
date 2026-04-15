'use client';

import React, { useState } from 'react';
import { Plus, X, Tag, Braces } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface MetadataItem {
  key: string;
  value: string;
}

interface MetadataBuilderProps {
  onChange: (metadata: Record<string, any>) => void;
  initialValue?: Record<string, any>;
}

export function MetadataBuilder({ onChange, initialValue = {} }: MetadataBuilderProps) {
  const [items, setItems] = useState<MetadataItem[]>(
    Object.entries(initialValue).map(([key, value]) => ({ key, value: String(value) }))
  );

  const updateMetadata = (newItems: MetadataItem[]) => {
    setItems(newItems);
    const metadataObject = newItems.reduce((acc, item) => {
      if (item.key) acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>);
    onChange(metadataObject);
  };

  const addItem = () => {
    updateMetadata([...items, { key: '', value: '' }]);
  };

  const removeItem = (index: number) => {
    updateMetadata(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof MetadataItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    updateMetadata(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Braces className="w-4 h-4 text-stripe-purple" />
           <span className="text-xs font-bold text-deep-navy uppercase tracking-widest">Metadata</span>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={addItem}
          className="h-8 text-[10px] font-bold text-stripe-purple hover:text-stripe-purple uppercase tracking-widest"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Field
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 group"
            >
              <Input 
                placeholder="Key"
                value={item.key}
                onChange={(e) => handleItemChange(index, 'key', e.target.value)}
                className="h-9 text-sm border-soft-blue bg-white focus:ring-stripe-purple font-mono"
              />
              <Input 
                placeholder="Value"
                value={item.value}
                onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                className="h-9 text-sm border-soft-blue bg-white focus:ring-stripe-purple font-mono"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeItem(index)}
                className="h-9 w-9 text-slate hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="py-8 text-center bg-muted/20 border border-dashed border-soft-blue rounded-md">
            <p className="text-[10px] font-bold text-slate uppercase tracking-widest opacity-40">No custom metadata attached</p>
          </div>
        )}
      </div>
    </div>
  );
}
