"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, MessageCircle, Twitter, Send, Github } from "lucide-react";
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
    icon: MessageCircle,
  },
  {
    name: "twitter",
    label: "Twitter/X",
    placeholder: "https://x.com/your-handle",
    icon: Twitter,
  },
  {
    name: "telegram",
    label: "Telegram",
    placeholder: "https://t.me/your-channel",
    icon: Send,
  },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-org",
    icon: Github,
  },
] as const;

interface SocialLinksInputProps {
  name?: string;
  className?: string;
}

export function SocialLinksInput({ name = "socialLinks", className }: SocialLinksInputProps) {
  const { register, watch, setValue } = useFormContext();
  const socialLinks = watch(name) || {};

  const clearLink = (linkName: string) => {
    setValue(`${name}.${linkName}`, "");
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {SOCIAL_LINKS.map(({ name: linkName, label, placeholder, icon: Icon }) => {
            const fieldName = `${name}.${linkName}`;
            const currentValue = socialLinks[linkName];
            
            return (
              <div key={linkName} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">{label}</label>
                  {currentValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearLink(linkName)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  )}
                </div>
                <Input
                  {...register(fieldName)}
                  type="url"
                  placeholder={placeholder}
                  className="pl-8"
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          These links will be displayed on your hackathon page to help participants connect with you.
        </div>
      </CardContent>
    </Card>
  );
}