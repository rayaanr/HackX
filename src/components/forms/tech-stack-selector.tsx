"use client";

import { useState, KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TECH_STACK_OPTIONS = [
  "JavaScript",
  "TypeScript", 
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Rails",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "Unity",
  "Unreal Engine",
  "TensorFlow",
  "PyTorch",
  "AI/ML",
  "Machine Learning",
  "Blockchain",
  "Web3",
  "Ethereum",
  "Solidity",
  "Bitcoin",
  "DeFi",
  "NFT",
  "IoT",
  "AR/VR",
  "Mobile",
  "Desktop",
  "Web",
  "Cloud",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "DevOps",
  "Firebase",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "GraphQL",
  "REST API",
];

interface TechStackSelectorProps {
  name?: string;
  className?: string;
}

export function TechStackSelector({ name = "techStack", className }: TechStackSelectorProps) {
  const { setValue, watch } = useFormContext();
  const [customTech, setCustomTech] = useState("");
  const selectedTechStack = watch(name) || [];

  const toggleTech = (tech: string) => {
    const currentTechStack = selectedTechStack || [];
    if (currentTechStack.includes(tech)) {
      setValue(name, currentTechStack.filter((t: string) => t !== tech));
    } else {
      setValue(name, [...currentTechStack, tech]);
    }
  };

  const addCustomTech = () => {
    if (customTech.trim() && !selectedTechStack.includes(customTech.trim())) {
      setValue(name, [...selectedTechStack, customTech.trim()]);
      setCustomTech("");
    }
  };

  const removeTech = (tech: string) => {
    setValue(name, selectedTechStack.filter((t: string) => t !== tech));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTech();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected tech stack */}
      {selectedTechStack.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Technologies:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTechStack.map((tech: string) => (
              <Badge
                key={tech}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {tech}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTech(tech)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add custom technology */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Add Custom Technology:</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Enter technology name"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomTech}
            disabled={!customTech.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Popular tech stack options */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Popular Technologies:</h4>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {TECH_STACK_OPTIONS.map((tech) => (
            <Button
              key={tech}
              type="button"
              variant={selectedTechStack.includes(tech) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTech(tech)}
              className="text-xs h-7"
            >
              {tech}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}