"use client";

import { Icons } from "@/components/icons/icons";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { footerConfig } from "@/config/footer";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import Container from "../container";
import { Logo } from "../logo";
import BuiltWithButton from "../shared/built-with-button";
import { useTheme } from "next-themes";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const { theme } = useTheme();
  return (
    <footer className={cn("border-t", className)}>
      <Container>
        <div className="grid grid-cols-2 gap-8 pt-12 md:grid-cols-6">
          <div className="flex flex-col items-start col-span-full md:col-span-2">
            <div className="space-y-4">
              <div className="items-center space-x-2 flex">
                <Logo />

                <span className="text-xl font-bold">{siteConfig.name}</span>
              </div>

              <p className="text-muted-foreground text-base p4-4 md:pr-12">
                {siteConfig.tagline}
              </p>

              <div className="flex items-center gap-2">
                {siteConfig.links.github && (
                  <Link
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.github className="size-4" aria-hidden="true" />
                  </Link>
                )}
                {siteConfig.links.twitter && (
                  <Link
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.twitter className="size-4" aria-hidden="true" />
                  </Link>
                )}
                {siteConfig.links.youtube && (
                  <Link
                    href={siteConfig.links.youtube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.youtube className="size-4" aria-hidden="true" />
                  </Link>
                )}
                {siteConfig.mail && (
                  <Link
                    href={`mailto:${siteConfig.mail}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Email"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.email className="size-4" aria-hidden="true" />
                  </Link>
                )}
              </div>

              <BuiltWithButton />
            </div>
          </div>

          {footerConfig.links.map((section) => (
            <div
              key={section.title}
              className="col-span-1 md:col-span-1 items-start"
            >
              <span className="text-sm font-semibold uppercase">
                {section.title}
              </span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (link) =>
                    link.href && (
                      <li key={link.title}>
                        <Link
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {link.title}
                        </Link>
                      </li>
                    ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-wrap justify-center gap-4 md:flex-nowrap">
            {/* First Row */}

            {/* DevHunt */}
            <a
              href="https://devhunt.org/tool/indie-hackers"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                src="/images/devhunt-1st.png"
                alt="DevHunt 1st Tool of the Week Badge"
                style={{ width: "200px", height: "50px" }}
                width="200"
                height="50"
              />
            </a>

            {/* Peerlist */}
            <a href="https://peerlist.io/javayhu/project/indiehub" target="_blank" rel="noopener noreferrer">
              <img
                src={theme === 'dark' ? '/images/Peerlist_Launch_SVG_Dark.svg' : '/images/Peerlist_Launch_SVG_Light.svg'}
                style={{ width: "200px" }}
                alt="Peerlist Badge"
              />
            </a>

            {/* Uneed */}
            <a href="https://www.uneed.best/tool/indie-hackers" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.uneed.best/POTD1.png"
                style={{ width: "250px", height: "54px" }}
                alt="Uneed POTD1 Badge"
              />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:flex-nowrap">
            {/* Second Row */}

            {/* FrogDR */}
            <a href="https://frogdr.com/indiehub.best?via=javayhu&utm_source=indiehub.best" target="_blank" rel="noopener noreferrer">
              <img src="https://frogdr.com/indiehub.best/badge-white.svg"
                alt="Monitor your Domain Rating with FrogDR" width="250" height="54" />
            </a>

            {/* Product Hunt */}
            <div>
              <a
                href="https://www.producthunt.com/posts/indiehub-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-indiehub&#0045;3"
                target="_blank"
                rel="noreferrer noopener"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=732100&theme=light&t=1738912992081"
                  alt="IndieHub - The&#0032;Best&#0032;All&#0045;in&#0045;One&#0032;Directory&#0032;for&#0032;Indie&#0032;Makers | Product Hunt"
                  style={{ width: "250px", height: "54px" }}
                  width="250"
                  height="54"
                />
              </a>
            </div>

            {/* Startup Fame */}
            <a href="https://startupfa.me/s/indiehub?utm_source=indiehub.best" target="_blank" rel="noopener noreferrer">
              <img src="https://startupfa.me/badges/featured-badge.webp"
                alt="IndieHub - The Best All-In-One Directory for Indie Makers | Startup Fame"
                width="171" height="54" />
            </a>

            {/* Fazier */}
            <a href="https://fazier.com/launches/indiehub" target="_blank" rel="noopener noreferrer">
              <img src="https://fazier.com/api/v1/public/badges/embed_image.svg?launch_id=2757&badge_type=daily&theme=light"
                style={{ width: "270px", height: "54px" }}
                width="270"
                height="54"
                alt="Example Image"
                className="d-inline-block rounded img-fluid" />
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t py-4">
        <Container className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Copyright &copy; {new Date().getFullYear()} All Rights Reserved.
          </span>

          <div className="flex items-center gap-3">
            <ModeToggle />
          </div>
        </Container>
      </div>
    </footer>
  );
}
