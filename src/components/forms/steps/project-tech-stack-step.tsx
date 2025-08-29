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
import { z } from "zod";
import { projectSchema } from "@/lib/schemas/project-schema";
import MultipleSelector, { Option } from "@/components/ui/multiselect";

type ProjectFormValues = z.infer<typeof projectSchema>;

export const TECH_STACK_OPTIONS: Option[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "vuejs", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "java", label: "Java" },
  { value: "spring", label: "Spring" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "rails", label: "Rails" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "flutter", label: "Flutter" },
  { value: "react-native", label: "React Native" },
  { value: "unity", label: "Unity" },
  { value: "unreal", label: "Unreal Engine" },
  { value: "tensorflow", label: "TensorFlow" },
  { value: "pytorch", label: "PyTorch" },
  { value: "ai-ml", label: "AI/ML" },
  { value: "machine-learning", label: "Machine Learning" },
  { value: "blockchain", label: "Blockchain" },
  { value: "web3", label: "Web3" },
  { value: "ethereum", label: "Ethereum" },
  { value: "solidity", label: "Solidity" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "defi", label: "DeFi" },
  { value: "nft", label: "NFT" },
  { value: "iot", label: "IoT" },
  { value: "ar-vr", label: "AR/VR" },
  { value: "mobile", label: "Mobile" },
  { value: "desktop", label: "Desktop" },
  { value: "web", label: "Web" },
  { value: "cloud", label: "Cloud" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "GCP" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "devops", label: "DevOps" },
  { value: "firebase", label: "Firebase" },
  { value: "mongodb", label: "MongoDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "redis", label: "Redis" },
  { value: "graphql", label: "GraphQL" },
  { value: "rest-api", label: "REST API" },
];

export function TechStackStep() {
  const { control, watch } = useFormContext<ProjectFormValues>();

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
                    value={field.value.map((val) => ({
                      label: val,
                      value: val,
                    }))}
                    onChange={(options) =>
                      field.onChange(options.map((option) => option.value))
                    }
                    defaultOptions={TECH_STACK_OPTIONS}
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
