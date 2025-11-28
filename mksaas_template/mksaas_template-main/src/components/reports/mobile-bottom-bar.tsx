'use client';

import { ArrowUp, Menu, Search, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MobileBottomBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // TODO: Implement Search and Menu functionality
  // For now, these buttons are placeholders or can trigger simple actions

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <div className="flex items-center gap-1 rounded-full border bg-background/80 backdrop-blur shadow-lg p-1.5 px-3">
        {/*
        <button className="p-2 hover:bg-muted rounded-full" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="w-px h-4 bg-border" />
        */}
        <button
          className="p-2 hover:bg-muted rounded-full"
          aria-label="Search"
          onClick={() =>
            document
              .querySelector<HTMLElement>('button[aria-label="Search"]')
              ?.click()
          }
        >
          <Search className="h-5 w-5" />
        </button>
        <div className="w-px h-4 bg-border" />
        <button
          className="p-2 hover:bg-muted rounded-full"
          aria-label="Share"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: document.title,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('链接已复制');
            }
          }}
        >
          <Share2 className="h-5 w-5" />
        </button>
        <div className="w-px h-4 bg-border" />
        <button
          className="p-2 hover:bg-muted rounded-full"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
