"use client";

import { useState } from "react";
import { FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFormContext, useFieldArray } from "react-hook-form";
import { type HackathonFormData } from "@/lib/schemas/hackathon-schema";
import { Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

export function JudgesStep() {
  const { control } = useFormContext<HackathonFormData>();
  const [newJudgeAddress, setNewJudgeAddress] = useState("");

  const {
    fields: judges,
    append: appendJudge,
    remove: removeJudge,
  } = useFieldArray({
    control,
    name: "judges",
  });

  const addJudgeByAddress = () => {
    // Validate EVM address format
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmAddressRegex.test(newJudgeAddress)) {
      toast.error("Please enter a valid EVM address");
      return;
    }

    // Check if judge is already added
    if (judges.find((judge) => judge.address === newJudgeAddress)) {
      toast.error("This judge has already been added");
      return;
    }

    appendJudge({
      address: newJudgeAddress,
      status: "pending",
    });

    setNewJudgeAddress("");
    toast.success(`Judge added: ${newJudgeAddress}`);
  };

  return (
    <Card className="bg-background/30">
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto_1fr] gap-0 min-h-[300px] relative">
          {/* Left: Invited Judges List */}
          <div className="lg:pr-6">
            {judges.length === 0 ? (
              <div className="text-center py-12 h-full flex flex-col justify-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No judges added yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the panel to add judges by EVM address
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-4">
                  Added Judges ({judges.length})
                </h3>
                <div className="space-y-3">
                  {judges.map((judge, index) => {
                    return (
                      <div
                        key={judge.id}
                        className="flex items-center gap-3 p-3 py-2 border rounded-lg w-full"
                      >
                        <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <div className="min-w-0 flex-1">
                            <FormField
                              control={control}
                              name={`judges.${index}.address`}
                              render={({ field }) => (
                                <div className="font-mono text-sm font-medium text-foreground break-all">
                                  {field.value}
                                </div>
                              )}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            Status: Added
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

          {/* Right: Add Judges Panel */}
          <div className="lg:pl-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-4">
              Add Judges
            </h3>
            <div className="space-y-4">
              {/* EVM Address Input */}
              <div className="space-y-2">
                <FormLabel>Add by EVM Address</FormLabel>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={newJudgeAddress}
                    onChange={(e) => setNewJudgeAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addJudgeByAddress();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addJudgeByAddress}
                    disabled={!newJudgeAddress}
                    className="w-full"
                  >
                    <Wallet className="h-4 w-4" />
                    Add Judge
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Enter the wallet address of the judge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
