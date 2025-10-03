"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "motion/react";
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";

interface ShareLinkProps {
  url: string;
  children: React.ReactNode;
  title?: string;
}

export function ShareLink({ url, children, title }: ShareLinkProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: IconBrandFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      color: "hover:bg-blue-600/20 hover:text-blue-400",
    },
    {
      name: "Twitter",
      icon: IconBrandTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${
        title ? `&text=${encodeURIComponent(title)}` : ""
      }`,
      color: "hover:bg-sky-500/20 hover:text-sky-400",
    },
    {
      name: "LinkedIn",
      icon: IconBrandLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
      color: "hover:bg-blue-700/20 hover:text-blue-300",
    },
    {
      name: "Reddit",
      icon: IconBrandReddit,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}${
        title ? `&title=${encodeURIComponent(title)}` : ""
      }`,
      color: "hover:bg-orange-600/20 hover:text-orange-400",
    },
    {
      name: "WhatsApp",
      icon: IconBrandWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${title ? title + " - " : ""}${url}`,
      )}`,
      color: "hover:bg-green-600/20 hover:text-green-400",
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 border-white/10 bg-black/80 backdrop-blur-lg"
        align="end"
        sideOffset={8}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Share this link</h4>
          </div>

          {/* URL Copy Section */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              value={url}
              readOnly
              className="flex-1 bg-white/5 border-white/10 text-white/90 text-sm focus:border-blue-400/50 transition-colors"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="px-3 border-white/10 hover:bg-white/10 hover:border-blue-400/50 transition-all duration-200"
              onClick={copyToClipboard}
            >
              <motion.div
                key={copied ? "check" : "copy"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {copied ? (
                  <IconCheck className="h-4 w-4 text-green-400" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )}
              </motion.div>
              <span className="sr-only">Copy</span>
            </Button>
          </div>

          <Separator className="bg-white/10 mb-4" />

          {/* Social Media Links */}
          <div>
            <p className="text-sm text-white/60 mb-3">Share on social media</p>
            <div className="flex gap-2 justify-center">
              {socialPlatforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.05 * index,
                    duration: 0.3,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full hover:bg-white/10 transition-all duration-200 ${platform.color}`}
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Share on ${platform.name}`}
                    >
                      <platform.icon className="size-6" />
                      <span className="sr-only">Share on {platform.name}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
