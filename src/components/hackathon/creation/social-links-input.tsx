"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Plus, X, Link } from "lucide-react";
import {
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandX,
  IconBrandTelegram,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  {
    name: "website",
    label: "Website",
    placeholder: "https://your-website.com",
    icon: Globe,
  },
  {
    name: "discord",
    label: "Discord",
    placeholder: "https://discord.gg/your-server",
    icon: IconBrandDiscord,
  },
  {
    name: "twitter",
    label: "Twitter/X",
    placeholder: "https://x.com/your-handle",
    icon: IconBrandX,
  },
  {
    name: "telegram",
    label: "Telegram",
    placeholder: "https://t.me/your-channel",
    icon: IconBrandTelegram,
  },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-org",
    icon: IconBrandGithub,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/your-profile",
    icon: IconBrandLinkedin,
  },
  {
    name: "custom",
    label: "Custom",
    placeholder: "https://your-custom-link.com",
    icon: Link,
  },
] as const;

interface SocialLinksInputProps {
  name?: string;
  className?: string;
}

export function SocialLinksInput({
  name = "socialLinks",
  className,
}: SocialLinksInputProps) {
  const { register, watch, setValue } = useFormContext();
  const socialLinks = watch(name) || {};
  const [enabledLinks, setEnabledLinks] = useState<Set<string>>(new Set());

  // Keep enabledLinks in sync with socialLinks form value
  const allowedKeys = SOCIAL_LINKS.map((link) => link.name);
  useEffect(() => {
    const validEnabledKeys = Object.keys(socialLinks).filter(
      (key) =>
        Boolean(socialLinks[key]) &&
        allowedKeys.includes(key as (typeof allowedKeys)[number]),
    );
    setEnabledLinks(new Set(validEnabledKeys));
  }, [socialLinks]);

  const addLink = useCallback((linkName: string) => {
    setEnabledLinks((prev) => new Set([...prev, linkName]));
  }, []);

  const removeLink = useCallback(
    (linkName: string) => {
      setEnabledLinks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(linkName);
        return newSet;
      });
      setValue(`${name}.${linkName}`, "");
    },
    [name, setValue],
  );

  const availableLinks = useMemo(
    () => SOCIAL_LINKS.filter((link) => !enabledLinks.has(link.name)),
    [enabledLinks],
  );

  const enabledLinksArray = useMemo(
    () => Array.from(enabledLinks),
    [enabledLinks],
  );

  return (
    <div className={cn(className)}>
      <p className="text-sm">Social Media & Communication</p>
      {/* Add Buttons */}
      {availableLinks.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-2">
            {availableLinks.map(({ name: linkName, label, icon: Icon }) => (
              <Button
                key={linkName}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addLink(linkName)}
                className="flex items-center gap-2"
              >
                <Icon className="size-4" />
                {label}
                <Plus className="size-3" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Enabled Links */}
      {Array.from(enabledLinks).map((linkName) => {
        const linkConfig = SOCIAL_LINKS.find((link) => link.name === linkName);
        if (!linkConfig) return null;

        const { label, placeholder, icon: Icon } = linkConfig;
        const fieldName = `${name}.${linkName}`;

        return (
          <div key={linkName} className="flex items-center gap-3 pt-3">
            <div className="flex gap-1 items-center h-full rounded-md p-2 min-w-[100px]">
              <Icon className="size-5 text-muted-foreground flex-shrink-0" />
              <label className="text-sm font-medium">{label}</label>
            </div>
            <Input
              {...register(fieldName)}
              type="url"
              placeholder={placeholder}
              className="flex-1 max-w-lg"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLink(linkName)}
              className="size-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground pt-2">
        This information will be displayed on your hackathon page to help
        participants connect with you.
      </p>
    </div>
  );
}
