"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/schemas/project-schema";
import { LexicalEditor } from "@/components/ui/rich-text-editor";
import { FileUploadField } from "@/components/ui/file-upload";
import MultipleSelector, { Option } from "@/components/ui/multiselect";

const SECTOR_OPTIONS: Option[] = [
  { value: "ai-ml", label: "AI/ML" },
  { value: "defi", label: "DeFi" },
  { value: "gaming", label: "Gaming" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "social-impact", label: "Social Impact" },
  { value: "iot", label: "IoT" },
  { value: "fintech", label: "FinTech" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "sustainability", label: "Sustainability" },
  { value: "productivity", label: "Productivity" },
  { value: "entertainment", label: "Entertainment" },
  { value: "developer-tools", label: "Developer Tools" },
];

type ProjectFormValues = z.infer<typeof projectSchema>;

export function OverviewStep() {
  const { control, setValue, watch } = useFormContext<ProjectFormValues>();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Logo</FormLabel>
                  <FileUploadField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Drop your project logo here"
                  />
                  <FormDescription>
                    Upload a logo for your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormDescription>The name of your project</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="intro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Intro *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a short intro"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief one-liner about your project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="itchVideo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Itch Video</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/video" {...field} />
                </FormControl>
                <FormDescription>
                  Link to your project video (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector *</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={field.value.map((val) => ({
                      label: val,
                      value: val,
                    }))}
                    onChange={(options) =>
                      field.onChange(options.map((option) => option.value))
                    }
                    defaultOptions={SECTOR_OPTIONS}
                    placeholder="Select sectors..."
                    creatable
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-muted-foreground">
                        No sectors found
                      </p>
                    }
                  />
                </FormControl>
                <FormDescription>
                  What sector does your project belong to?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your project's progress..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What stage is your project at?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="fundraisingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fundraising Status *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your fundraising status..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What is your project's fundraising status?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description *</FormLabel>
                <FormControl>
                  <LexicalEditor
                    onChange={(content) => setValue("description", content)}
                    placeholder="Enter a detailed description of your project..."
                    className="min-h-[200px]"
                  />
                </FormControl>
                <FormDescription>
                  Provide a comprehensive description of your project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
