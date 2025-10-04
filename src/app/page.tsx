"use client";

import { LandingNavbar } from "@/components/landing/navbar";
import { HeroGeometric } from "@/components/landing/hero";
import { HackXFeatures } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import {
  IconBrandTwitter,
  IconBrandGithub,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import Image from "next/image";

const YEAR = new Date().getFullYear();

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroGeometric
          badge="AthenaX"
          title1="Build Amazing"
          title2="Hackathons"
          subtitle="Trustless. Transparent. Unstoppable hackathons on IPFS and Smart Contracts."
        />
        <HackXFeatures />
      </main>
      <Footer
        logo={
          <div className="flex items-center justify-center w-8 h-8">
            <Image
              src="/logo-icon.svg"
              alt="HackX Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
        }
        brandName="HackX"
        socialLinks={[
          {
            icon: <IconBrandTwitter className="h-5 w-5" />,
            href: "https://twitter.com/hackx",
            label: "Follow HackX on Twitter",
          },
          {
            icon: <IconBrandGithub className="h-5 w-5" />,
            href: "https://github.com/hackx-platform",
            label: "HackX GitHub",
          },
          {
            icon: <IconBrandLinkedin className="h-5 w-5" />,
            href: "https://linkedin.com/company/hackx",
            label: "HackX LinkedIn",
          },
        ]}
        mainLinks={[
          { href: "/hackathons", label: "Hackathons" },
          { href: "/projects", label: "Projects" },
          { href: "/judge", label: "Judge" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
          { href: "/cookies", label: "Cookie Policy" },
        ]}
        copyright={{
          text: `© ${YEAR} HackX Platform`,
          license: "Powered by Web3 • Built for Innovators",
        }}
      />
    </div>
  );
}
