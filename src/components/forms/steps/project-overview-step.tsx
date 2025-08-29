"use client";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/schemas/project-schema";
import { ImageIcon, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LexicalEditor } from "@/components/forms/lexical-editor";

type ProjectFormValues = z.infer<typeof projectSchema>;

const SECTORS = [
  "AI/ML",
  "DeFi",
  "Gaming",
  "Healthcare",
  "Education",
  "E-commerce",
  "Social Impact",
  "IoT",
  "Cybersecurity",
  "Web3",
  "Other",
];

export function OverviewStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setValue("logo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const watchedFields = watch();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Project Logo"
              description="Upload a logo for your project"
            >
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed rounded-lg w-16 h-16 flex items-center justify-center bg-muted/30">
                  {logoPreview || watchedFields.logo ? (
                    <img
                      src={logoPreview || watchedFields.logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" type="button" onClick={triggerFileInput}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </FormField>

            <FormField
              label="Project Name"
              description="The name of your project"
              required
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="Enter project name"
              />
            </FormField>
          </div>

          <FormField
            label="Project Intro"
            description="A brief one-liner about your project"
            required
            error={errors.intro?.message}
          >
            <Textarea
              {...register("intro")}
              placeholder="Enter a short intro"
              rows={3}
            />
          </FormField>

          <FormField
            label="Itch Video"
            description="Link to your project video (optional)"
            error={errors.itchVideo?.message}
          >
            <Input
              {...register("itchVideo")}
              placeholder="https://example.com/video"
            />
          </FormField>

          <FormField
            label="Sector"
            description="What sector does your project belong to?"
            required
            error={errors.sector?.message}
          >
            <ToggleGroup 
              type="multiple" 
              value={Array.isArray(watchedFields.sector) ? watchedFields.sector : watchedFields.sector ? [watchedFields.sector] : []}
              onValueChange={(value) => setValue("sector", value)}
              className="flex flex-wrap gap-2"
            >
              {SECTORS.map((sector) => (
                <ToggleGroupItem
                  key={sector}
                  value={sector}
                  aria-label={`Toggle ${sector}`}
                  className="px-3 py-2 h-auto rounded-md text-sm"
                >
                  {sector}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FormField>

          <FormField
            label="Progress"
            description="What stage is your project at?"
            required
            error={errors.progress?.message}
          >
            <Textarea
              {...register("progress")}
              placeholder="Describe your project's progress..."
              rows={4}
            />
          </FormField>

          <FormField
            label="Fundraising Status"
            description="What is your project's fundraising status?"
            required
            error={errors.fundraisingStatus?.message}
          >
            <Textarea
              {...register("fundraisingStatus")}
              placeholder="Describe your fundraising status..."
              rows={4}
            />
          </FormField>

          <FormField
            label="Full Description"
            description="Provide a comprehensive description of your project"
            required
            error={errors.description?.message}
          >
            <LexicalEditor
              onChange={(content) => setValue("description", content)}
              placeholder="Enter a detailed description of your project..."
              className="min-h-[200px]"
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}