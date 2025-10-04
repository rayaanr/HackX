"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { type ProjectFormData } from "@/lib/schemas/project-schema";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUploadField } from "@/components/ui/file-upload";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { getRandomMockProject } from "@/data/mock-project-data";

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

export function OverviewStep() {
  const { control, setValue, watch } = useFormContext<ProjectFormData>();

  const loadMockData = (mockData: ProjectFormData) => {
    // Load all the mock data into the form (excluding logo - users should upload their own)
    // setValue("logo", mockData.logo); // Removed - don't load logo from mock data
    setValue("name", mockData.name);
    setValue("intro", mockData.intro);
    setValue("pitchVideo", mockData.pitchVideo);
    setValue("sector", mockData.sector);
    setValue("progress", mockData.progress);
    setValue("fundraisingStatus", mockData.fundraisingStatus);
    setValue("description", mockData.description);
    setValue("githubLink", mockData.githubLink);
    setValue("demoVideo", mockData.demoVideo);
    setValue("techStack", mockData.techStack);
    setValue("hackathonIds", mockData.hackathonIds);
  };

  const loadRandomMockData = () => {
    const randomProject = getRandomMockProject();
    loadMockData(randomProject);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-transparent border-none">
        <CardContent className="space-y-6 px-0">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-4 space-y-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="intro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Project Intro</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a short intro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name="logo"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Project Logo</FormLabel>
                  <FileUploadField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Drop your project logo here"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="pitchVideo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pitch Video</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/video" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Sector</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Progress</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your project's progress..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="fundraisingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Fundraising Status</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your fundraising status..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Full Description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialValue={field.value || ""}
                    onChange={(content) => field.onChange(content)}
                    placeholder="Enter a detailed description of your project..."
                    className="min-h-[200px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
