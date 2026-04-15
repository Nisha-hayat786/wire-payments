'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Webhook, ScrollText, ArrowRight, FileCode, BookOpen } from 'lucide-react';

const developerSections = [
  {
    title: 'API Keys',
    description: 'Manage your API keys for authenticating requests',
    href: '/dashboard/developers/api-keys',
    icon: Key,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Webhooks',
    description: 'Configure webhook endpoints for real-time events',
    href: '/dashboard/developers/webhooks',
    icon: Webhook,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'API Logs',
    description: 'View API request logs and debugging information',
    href: '/dashboard/developers/logs',
    icon: ScrollText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function DevelopersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Developers</h1>
        <p className="text-gray-600 mt-1">Integrate WirePayments into your application</p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6">
        {developerSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                  <section.icon className={`w-6 h-6 ${section.color}`} />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  Configure
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Complete reference for the WirePayments API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Explore our REST API, webhooks, and integration guides.
            </p>
            <Link href="/docs">
              <Button>
                <FileCode className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
