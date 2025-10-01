"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
      <Card className="bg-transparent/30">
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="githubLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>GitHub Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/username/project"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="demoVideo"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Demo Video</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/demo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="techStack"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Tech Stack</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
