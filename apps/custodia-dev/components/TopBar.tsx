'use client';

import { useSession } from 'next-auth/react';

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:px-8">
      {/* Left Section - Can add search or app title */}
      <div className="flex-1" />

      {/* Right Section - User Info */}
      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {session.user.name || session.user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>
        )}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {session?.user?.email?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
