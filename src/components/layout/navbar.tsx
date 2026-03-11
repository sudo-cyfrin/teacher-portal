'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, Users, Search, Home, FileText } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AirFlow</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session && (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/class-details"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Class Details</span>
                  </Link>
                  <Link
                    href="/search"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </Link>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-sm text-gray-600">
                    <div className="font-medium text-gray-900">{session.user.name}</div>
                    <div className="text-xs">{session.user.department}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
