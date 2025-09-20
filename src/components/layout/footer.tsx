
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, User, Sparkles, Footprints } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation, type Language } from './language-provider';

type NavItem = {
  href: string;
  labelKey: keyof (typeof import('@/lib/translations').translations)['en'];
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/explore', labelKey: 'explore', icon: Compass },
  { href: '/ai', labelKey: 'ai', icon: Sparkles },
  { href: '/activities', labelKey: 'activities', icon: Footprints },
  { href: '/profile', labelKey: 'you', icon: User },
];

export function Footer() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-card shadow-sm">
      <nav className="flex items-center justify-around h-full max-w-screen-md mx-auto">
        {navItems.map((item) => {
          // Calculate isActive only on the client after mount
          let isActive = false;
          if (isClient) {
            if (item.href === '/') {
              isActive = pathname === '/';
            } else {
              // Ensure pathname is not null before calling startsWith
              isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);
            }
          }

          return (
            <div key={item.labelKey} className="flex items-center justify-center w-1/5 h-full">
              {item.href === '/ai' ? (
                // Middle AI button
                <Link href={item.href} className="flex flex-col items-center group transform -translate-y-3 sm:-translate-y-4">
                  <div
                    className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary text-primary-foreground shadow-lg
                                cursor-pointer transition-all duration-200 ease-in-out hover:bg-primary/90
                                ${isClient && isActive ? 'ring-2 ring-offset-2 ring-offset-card ring-primary' : ''}`}
                  >
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <span
                    className={`text-[0.6rem] sm:text-xs font-medium mt-1.5 
                                ${isClient && isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              ) : (
                // Other navigation items
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full p-1 sm:p-2 transition-colors duration-200 ease-in-out
                    ${isClient && isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'}
                  `}
                >
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 mb-0.5`} />
                  <span className="text-[0.6rem] sm:text-xs font-medium">{t(item.labelKey)}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </footer>
  );
}
