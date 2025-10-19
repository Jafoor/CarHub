// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Car,
  Bike,
  Tag,
  Users,
  Building,
  LayoutDashboard,
  MapPin, Map,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '../auth/logout-button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Vehicle Types', href: '/vehicle-types', icon: Car },
  { name: 'Brands', href: '/brands', icon: Tag },
   { name: 'Divisions', href: '/divisions', icon: Map },
  { name: 'Districts', href: '/districts', icon: MapPin },
  { name: 'Showrooms', href: '/showrooms', icon: Building },
  { name: 'Cars', href: '/cars', icon: Car },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked');
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">Car Management</h1>
        <p className="text-sm text-gray-600">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-2',
                isActive && 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <LogoutButton />
      </div>

    </div>
  );
}