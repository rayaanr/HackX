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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { type ProjectFormData } from "@/lib/schemas/project-schema";
import MultipleSelector from "@/components/ui/multiselect";
import { TECH_STACK } from "@/constants/tech-stack";

export function TechStackStep() {
  const { control } = useFormContext<ProjectFormData>();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="githubLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/username/project"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Link to your project's GitHub repository
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="demoVideo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demo Video</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/demo" {...field} />
                </FormControl>
                <FormDescription>
                  Link to your project's demo video (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="techStack"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tech Stack *</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={
                      Array.isArray(field.value)
                        ? field.value.map((val) => ({
                            label: val,
                            value: val,
                          }))
                        : []
                    }
                    onChange={(options) =>
                      field.onChange(options.map((option) => option.value))
                    }
                    defaultOptions={TECH_STACK}
                    placeholder="Select technologies..."
                    creatable
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-muted-foreground">
                        No technologies found
                      </p>
                    }
                  />
                </FormControl>
                <FormDescription>
                  Technologies used in your project
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
