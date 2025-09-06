"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";

interface ShareDialogProps {
  url: string;
  children: React.ReactNode;
}

export function ShareDialog({ url, children }: ShareDialogProps) {
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
      icon: IconBrandFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
    },
    {
      icon: IconBrandTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    },
    {
      icon: IconBrandLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
    },
    {
      icon: IconBrandReddit,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}`,
    },
    {
      icon: IconBrandWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={url}
              readOnly
              autoFocus={false}
              className="flex-1 bg-muted/50"
            />
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={copyToClipboard}
            >
              {copied ? (
                <IconCheck className="h-4 w-4" />
              ) : (
                <IconCopy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>

          <div className="flex gap-5 justify-between m-auto">
            {socialPlatforms.map((platform, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="p-2"
                asChild
              >
                <Link
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <platform.icon className="size-7" />
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
