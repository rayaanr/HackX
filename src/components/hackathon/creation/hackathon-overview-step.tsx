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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "@/components/ui/file-upload";
import { useFormContext } from "react-hook-form";
import { type HackathonFormData } from "@/lib/schemas/hackathon-schema";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SocialLinksInput } from "./social-links-input";
import MultipleSelector from "@/components/ui/multiselect";
import { TECH_STACK } from "@/constants/tech-stack";

export function OverviewStep() {
  const { control } = useFormContext<HackathonFormData>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Hackathon Name</FormLabel>
                <FormControl>
                  <Input placeholder="The name of your hackathon" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief description of your hackathon"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="lg:col-span-1">
          <FormField
            control={control}
            name="visual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visual</FormLabel>
                <FileUploadField
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Upload a visual for your hackathon"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Removed duplicate Short Description block to avoid conflicting bindings */}

      {/* Period Selection - 3 columns (periods) x 2 rows (start/end) with separators */}
      <div className="space-y-4 border p-2 py-4 rounded-md border-dashed">
        {/* Column Headers */}
        <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] gap-6 items-center">
          <h3 className="font-medium text-center">Registration Period</h3>
          <Separator orientation="vertical" className="h-6 w-px" />
          <h3 className="font-medium text-center">Hackathon Period</h3>
          <Separator orientation="vertical" className="h-6 w-px" />
          <h3 className="font-medium text-center">Voting Period</h3>
        </div>

        {/* Start Date Row */}
        <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] gap-6 items-end">
          <FormField
            control={control}
            name="registrationPeriod.registrationStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-xs">
                  Start Date & Time
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator orientation="vertical" className="h-16 w-px" />
          <FormField
            control={control}
            name="hackathonPeriod.hackathonStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-xs">
                  Start Date & Time
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator orientation="vertical" className="h-16 w-px" />
          <FormField
            control={control}
            name="votingPeriod.votingStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-xs">
                  Start Date & Time
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* End Date Row */}
        <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] gap-6 items-end">
          <FormField
            control={control}
            name="registrationPeriod.registrationEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-xs">
                  End Date & Time
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator orientation="vertical" className="h-16 w-px" />
          <FormField
            control={control}
            name="hackathonPeriod.hackathonEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-xs">
                  End Date & Time
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator orientation="vertical" className="h-16 w-px" />
          <FormField
            control={control}
            name="votingPeriod.votingEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required className="text-xs">
                  End Date & Time
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select end date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Where the hackathon will take place"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="experienceLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Experience Level</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Target experience level for participants" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="all">All Levels</SelectItem>
              </SelectContent>
            </Select>
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
                value={field.value.map((val) => ({
                  label: val,
                  value: val,
                }))}
                onChange={(options) =>
                  field.onChange(options.map((option) => option.value))
                }
                defaultOptions={TECH_STACK}
                placeholder="Technologies and themes for your hackathon"
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

      <SocialLinksInput className="pb-4" />

      <FormField
        control={control}
        name="fullDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Detailed Description</FormLabel>
            <FormControl>
              <RichTextEditor
                initialValue={field.value || ""}
                onChange={(content) => field.onChange(content)}
                placeholder="Provide a comprehensive description of your hackathon, including goals, themes, prizes, and what participants can expect..."
                className="min-h-[200px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
