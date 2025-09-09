"use client";

import { useState } from "react";
import { FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  hackathonSchema,
  type HackathonFormData,
} from "@/lib/schemas/hackathon-schema";
import { Trash2, Mail, Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/use-clipboard";
import { nanoid } from "nanoid";

export function JudgesStep() {
  const { control } = useFormContext<HackathonFormData>();
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const { copied: copiedLink, copy } = useClipboard();

  const {
    fields: judges,
    append: appendJudge,
    remove: removeJudge,
  } = useFieldArray({
    control,
    name: "judges",
  });

  const inviteJudgeByEmail = () => {
    if (!newJudgeEmail || !newJudgeEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    appendJudge({
      email: newJudgeEmail,
      status: "waiting",
    });

    setNewJudgeEmail("");
    toast.success(`Invitation sent to ${newJudgeEmail}`);
  };

  const copyInviteLink = () => {
    const inviteLink = `${
      window.location.origin
    }/hackathons/invite?token=${nanoid()}`;
    copy(inviteLink, { successMessage: "Invite link copied to clipboard" });
  };

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto_1fr] gap-0 min-h-[300px] relative">
          {/* Left: Invited Judges List */}
          <div className="lg:pr-6">
            {judges.length === 0 ? (
              <div className="text-center py-12 h-full flex flex-col justify-center">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No judges invited yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the invitation panel to add judges
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-4">
                  Invited Judges ({judges.length})
                </h3>
                <div className="space-y-3">
                  {judges.map((judge, index) => {
                    return (
                      <div
                        key={judge.id}
                        className="flex items-center gap-3 p-3 py-2 border rounded-lg"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <FormField
                            control={control}
                            name={`judges.${index}.email`}
                            render={({ field }) => (
                              <Input
                                type="email"
                                placeholder="judge@example.com"
                                {...field}
                                className="border-none shadow-none py-0.5 px-0 bg-transparent! h-auto font-medium focus-visible:ring-0 rounded-none w-fit"
                                readOnly
                              />
                            )}
                          />
                          <p className="text-xs text-muted-foreground capitalize">
                            Status: Pending (Sent on creation)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJudge(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Separator */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:px-3">
            <Separator orientation="vertical" className="h-full" />
          </div>

          {/* Right: Invite Judges Panel */}
          <div className="lg:pl-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-4">
              Invite Judges
            </h3>
            <div className="space-y-4">
              {/* Email Invitation */}
              <div className="space-y-2">
                <FormLabel>Invite via Email</FormLabel>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="judge@example.com"
                    value={newJudgeEmail}
                    onChange={(e) => setNewJudgeEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        inviteJudgeByEmail();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={inviteJudgeByEmail}
                    disabled={!newJudgeEmail}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>

              {/* Copy Link */}
              <div className="space-y-2 pt-4 border-t">
                <FormLabel>Share Invite Link</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyInviteLink}
                  className="w-full"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Invite Link
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can apply to be a judge
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
