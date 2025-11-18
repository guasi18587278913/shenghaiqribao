'use client';

import { getAnnouncements } from '@/actions/announcements';
import { AnnouncementsDrawer } from '@/components/announcements/announcements-drawer';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import Container from '@/components/layout/container';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { UserButton } from '@/components/layout/user-button';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { ArrowUpRightIcon, BellIcon, BookOpen, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

interface NavBarProps {
  scroll?: boolean;
}

const customNavigationMenuTriggerStyle = cn(
  navigationMenuTriggerStyle(),
  'relative bg-transparent text-muted-foreground cursor-pointer',
  'hover:bg-accent hover:text-accent-foreground',
  'focus:bg-accent focus:text-accent-foreground',
  'data-active:font-semibold data-active:bg-transparent data-active:text-accent-foreground',
  'data-[state=open]:bg-transparent data-[state=open]:text-accent-foreground'
);

export function Navbar({ scroll }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);
  const menuLinks = useNavbarLinks();
  const localePathname = useLocalePathname();
  const [mounted, setMounted] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load announcements when drawer is opened
  useEffect(() => {
    if (announcementsOpen && announcements.length === 0) {
      getAnnouncements(1, 20).then(({ announcements: data }) => {
        setAnnouncements(data);
      });
    }
  }, [announcementsOpen, announcements.length]);

  return (
    <>
      {/* Announcements Drawer */}
      <AnnouncementsDrawer
        open={announcementsOpen}
        onOpenChange={setAnnouncementsOpen}
        announcements={announcements}
      />

      <section
        className={cn(
          'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
          scroll
            ? scrolled
              ? 'bg-muted/50 backdrop-blur-md border-b supports-backdrop-filter:bg-muted/50'
              : 'bg-transparent'
            : 'border-b bg-muted/50'
        )}
      >
        <Container className="px-4">
          {/* desktop navbar */}
          <nav className="hidden lg:flex items-center justify-between">
            {/* Brand - Left side */}
            <LocaleLink href="/reports" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                AI产品出海日报
              </span>
            </LocaleLink>

            {/* navbar right show navigation, sign in or user */}
            <div className="flex items-center gap-x-6">
              {/* Navigation links with icons */}
              <button
                onClick={() => setAnnouncementsOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
              >
                <BellIcon className="h-4 w-4" />
                <span>官方通知</span>
              </button>

              <LocaleLink
                href="/resources"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                  'hover:bg-accent hover:text-accent-foreground',
                  localePathname.startsWith('/resources') &&
                    'bg-accent text-accent-foreground'
                )}
              >
                <UsersIcon className="h-4 w-4" />
                <span>圈友资源</span>
              </LocaleLink>

              {!mounted || isPending ? (
                <Skeleton className="size-8 border rounded-full" />
              ) : currentUser ? (
                <>
                  {/* <CreditsBalanceButton /> */}
                  <UserButton user={currentUser} />
                </>
              ) : (
                <LoginWrapper mode="modal" asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    登录
                  </Button>
                </LoginWrapper>
              )}
            </div>
          </nav>

          {/* mobile navbar */}
          <NavbarMobile className="lg:hidden" />
        </Container>
      </section>
    </>
  );
}
