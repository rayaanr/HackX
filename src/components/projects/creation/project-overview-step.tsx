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
import {
  projectSchema,
  type ProjectFormData,
} from "@/lib/schemas/project-schema";
import { LexicalEditor } from "@/components/ui/rich-text-editor";
import { FileUploadField } from "@/components/ui/file-upload";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import {
  MOCK_PROJECT_DATA,
  getRandomMockProject,
} from "@/data/mock-project-data";

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
    // Load all the mock data into the form
    setValue("logo", mockData.logo);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Overview</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadRandomMockData}
                className="flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Load Random
              </Button>
              <div className="relative">
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value) {
                      const mockData =
                        MOCK_PROJECT_DATA[parseInt(e.target.value)];
                      loadMockData(mockData);
                      e.target.value = ""; // Reset select
                    }
                  }}
                >
                  <option value="">Choose specific...</option>
                  {MOCK_PROJECT_DATA.map((project, index) => (
                    <option key={index} value={index}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm">
                  Load Specific
                </Button>
              </div>
            </div>
          </div>
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
            name="pitchVideo"
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
                    initialContent={field.value || ""}
                    onChange={(content) => field.onChange(content)}
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
