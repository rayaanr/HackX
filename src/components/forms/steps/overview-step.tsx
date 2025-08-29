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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FileUploadField } from "@/components/ui/file-upload";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { LexicalEditor } from "@/components/forms/lexical-editor";
import { SocialLinksInput } from "@/components/forms/social-links-input";
import { TECH_STACK_OPTIONS } from "./project-tech-stack-step";
import MultipleSelector from "@/components/ui/multiselect";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function OverviewStep() {
  const { control, setValue, watch } = useFormContext<HackathonFormValues>();

  const watchedFields = watch();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hackathon Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter hackathon name" {...field} />
                  </FormControl>
                  <FormDescription>The name of your hackathon</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FileUploadField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Drop your hackathon logo here"
                  />
                  <FormDescription>
                    Upload a logo for your hackathon
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a short description"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of your hackathon
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Removed duplicate Short Description block to avoid conflicting bindings */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="registrationStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Start Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When registration opens</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="registrationEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration End Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When registration closes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="hackathonStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hackathon Start Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When the hackathon begins</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="hackathonEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hackathon End Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When the hackathon ends</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="votingStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting Start Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When voting begins</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="votingEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting End Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>When voting ends</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Target experience level for participants
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Online, San Francisco, CA"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Where the hackathon will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  Technologies and themes for your hackathon
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="socialLinks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media & Communication</FormLabel>
                <FormControl>
                  <SocialLinksInput />
                </FormControl>
                <FormDescription>
                  Add links to help participants connect with you
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full Description</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="fullDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Description *</FormLabel>
                <FormControl>
                  <LexicalEditor
                    onChange={(content) => setValue("fullDescription", content)}
                    placeholder="Enter a detailed description of your hackathon, including goals, themes, prizes, and what participants can expect..."
                    className="min-h-[200px]"
                  />
                </FormControl>
                <FormDescription>
                  Provide a comprehensive description of your hackathon
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
