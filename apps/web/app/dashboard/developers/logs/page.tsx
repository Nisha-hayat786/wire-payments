'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Search, 
  RotateCw, 
  Filter, 
  FileJson, 
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Code2
} from 'lucide-react';
import { useMerchant } from '../../merchant-context';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebhookLogsPage() {
  const supabase = createClient();
  const { merchant } = useMerchant();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = async (isRefresh = false) => {
    if (!merchant?.id) return;
    if (isRefresh) setRefreshing(true);
    
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*, webhook_endpoints(url)')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast.error('Failed to load logs');
    } else {
      setLogs(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [merchant]);

  return (
    <div className="space-y-10 selection:bg-stripe-purple/10 selection:text-stripe-purple pb-20">
      <div className="flex items-center justify-between">
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-light text-deep-navy">Delivery Logs</h1>
          <p className="text-sm text-slate mt-1 italic opacity-70">Auditing institutional event propagation and endpoint health.</p>
        </motion.div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-soft-blue flex items-center gap-2 h-9 text-[10px] uppercase font-bold tracking-widest px-6" onClick={() => fetchLogs(true)}>
             <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-6">
         {[
           { label: 'Total Deliveries', value: logs.length, icon: Activity, color: 'text-stripe-purple' },
           { label: 'Success Rate', value: '100%', icon: CheckCircle2, color: 'text-success-green' },
           { label: 'Avg Latency', value: '42ms', icon: Clock, color: 'text-blue-500' },
           { label: 'Endpoints Active', value: '1', icon: ExternalLink, color: 'text-slate' },
         ].map(stat => (
            <Card key={stat.label} className="border-soft-blue shadow-none bg-white">
               <CardContent className="p-4 py-6 text-center space-y-2">
                  <stat.icon className={`w-5 h-5 mx-auto ${stat.color} opacity-40`} />
                  <div className="text-xl font-light text-deep-navy font-mono">{stat.value}</div>
                  <div className="text-[9px] font-bold text-slate uppercase tracking-widest">{stat.label}</div>
               </CardContent>
            </Card>
         ))}
      </div>

      <Card className="border-soft-blue shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-soft-blue bg-muted/20 py-4 px-8 flex flex-row items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
                 <input type="text" placeholder="Filter by event type..." className="bg-white border border-soft-blue rounded-md h-9 pl-10 pr-4 text-xs w-64 focus:ring-1 ring-stripe-purple outline-none" />
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 border border-soft-blue bg-white">
                 <Filter className="w-4 h-4 text-slate" />
              </Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10 border-b border-soft-blue">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Status</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Event</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Endpoint</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate">Attempt ID</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-extrabold text-slate text-right">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm text-deep-navy">
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-4"><div className="h-8 bg-muted/20 rounded w-full" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate italic opacity-40">No webhook events recorded in this period.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`border-b border-soft-blue last:border-0 hover:bg-muted/5 transition-colors cursor-pointer group ${expandedLog === log.id ? 'bg-muted/5' : ''}`}
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      >
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              {log.status === 'succeeded' ? (
                                <div className="w-2 h-2 rounded-full bg-success-green shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,44,44,0.3)]" />
                              )}
                              <Badge className={`text-[9px] font-bold ${log.status === 'succeeded' ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`} variant="outline">
                                {log.response_code || '---'} {log.status.toUpperCase()}
                              </Badge>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2">
                              <Code2 className="w-3.5 h-3.5 text-stripe-purple opacity-40" />
                              <span className="font-bold text-xs uppercase tracking-tight">{log.payload?.type || 'invoice.updated'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-xs text-slate font-mono opacity-80">{log.webhook_endpoints?.url || 'Default Endpoint'}</span>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-[10px] text-slate font-mono uppercase opacity-50">{log.id.slice(0, 12)}...</span>
                        </td>
                        <td className="px-8 py-5 text-right text-slate text-xs font-mono font-medium">
                           {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedLog === log.id && (
                          <tr className="bg-[#fcfdfe] border-b border-soft-blue shadow-inner">
                            <td colSpan={5} className="px-8 py-8">
                               <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="grid md:grid-cols-2 gap-8"
                               >
                                  <div className="space-y-4">
                                     <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold text-deep-navy uppercase tracking-widest flex items-center gap-2">
                                           <FileJson className="w-3.5 h-3.5 text-stripe-purple" />
                                           Event Payload
                                        </h4>
                                        <Button variant="ghost" className="h-6 text-[9px] uppercase font-bold text-stripe-purple hover:bg-stripe-purple/10" onClick={() => navigator.clipboard.writeText(JSON.stringify(log.payload, null, 2))}>
                                           Copy JSON
                                        </Button>
                                     </div>
                                     <div className="bg-deep-navy text-[#f8f8f2] p-6 rounded-xl font-mono text-xs overflow-x-auto border border-white/10 shadow-xl max-h-[400px]">
                                        <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                                     </div>
                                  </div>
                                  <div className="space-y-4">
                                     <h4 className="text-[10px] font-bold text-deep-navy uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-stripe-purple" />
                                        Response Data
                                     </h4>
                                     <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-white border border-soft-blue shadow-sm">
                                           <p className="text-[10px] text-slate uppercase font-bold mb-1 opacity-50">Content Type</p>
                                           <p className="text-xs font-mono font-medium">application/json</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white border border-soft-blue shadow-sm">
                                           <p className="text-[10px] text-slate uppercase font-bold mb-1 opacity-50">Body</p>
                                           <p className="text-xs font-mono break-all line-clamp-2 italic text-slate">{log.response_body || '{"received": true}'}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-stripe-purple/5 border border-stripe-purple/10 flex items-center justify-between">
                                           <p className="text-xs font-medium text-stripe-purple">Is this a failure?</p>
                                           <Button size="sm" variant="outline" className="h-8 text-[10px] uppercase font-bold border-stripe-purple/20 text-stripe-purple bg-white hover:bg-stripe-purple/5">
                                              Retry Delivery
                                           </Button>
                                        </div>
                                     </div>
                                  </div>
                               </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center text-[10px] text-slate font-bold uppercase tracking-widest opacity-60">
         <p>Showing latest 50 results</p>
         <div className="flex gap-4">
            <span className="hover:text-stripe-purple cursor-pointer transition-colors">Previous Page</span>
            <span className="hover:text-stripe-purple cursor-pointer transition-colors">Next Page</span>
         </div>
      </div>
    </div>
  );
}
