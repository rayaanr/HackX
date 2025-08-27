"use client";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { LexicalEditor } from "@/components/forms/lexical-editor";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function OverviewStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<HackathonFormValues>();

  const watchedFields = watch();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Hackathon Name"
          description="The name of your hackathon"
          required
        >
          <Input
            {...register("name")}
            placeholder="Enter hackathon name"
            className={cn(errors.name && "border-destructive")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </FormField>

        <FormField
          label="Logo"
          description="Upload a logo for your hackathon"
        >
          <div className="flex items-center gap-4">
            <div className="border-2 border-dashed rounded-lg w-16 h-16 flex items-center justify-center">
              {watchedFields.logo ? (
                <img
                  src={watchedFields.logo}
                  alt="Logo preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Preview</span>
              )}
            </div>
            <Button variant="outline" type="button">
              Upload
            </Button>
          </div>
        </FormField>
      </div>

      <FormField
        label="Short Description"
        description="A brief description of your hackathon"
        required
      >
        <Textarea
          {...register("shortDescription")}
          placeholder="Enter a short description"
          className={cn(errors.shortDescription && "border-destructive")}
        />
        {errors.shortDescription && (
          <p className="text-sm text-destructive">
            {errors.shortDescription.message}
          </p>
        )}
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Registration Start Date"
          description="When registration opens"
          required
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedFields.registrationStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.registrationStartDate ? (
                  format(watchedFields.registrationStartDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchedFields.registrationStartDate}
                onSelect={(date) =>
                  setValue("registrationStartDate", date as Date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.registrationStartDate && (
            <p className="text-sm text-destructive">
              {errors.registrationStartDate.message}
            </p>
          )}
        </FormField>

        <FormField
          label="Registration End Date"
          description="When registration closes"
          required
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedFields.registrationEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.registrationEndDate ? (
                  format(watchedFields.registrationEndDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchedFields.registrationEndDate}
                onSelect={(date) =>
                  setValue("registrationEndDate", date as Date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.registrationEndDate && (
            <p className="text-sm text-destructive">
              {errors.registrationEndDate.message}
            </p>
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Hackathon Start Date"
          description="When the hackathon begins"
          required
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedFields.hackathonStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.hackathonStartDate ? (
                  format(watchedFields.hackathonStartDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchedFields.hackathonStartDate}
                onSelect={(date) =>
                  setValue("hackathonStartDate", date as Date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.hackathonStartDate && (
            <p className="text-sm text-destructive">
              {errors.hackathonStartDate.message}
            </p>
          )}
        </FormField>

        <FormField
          label="Hackathon End Date"
          description="When the hackathon ends"
          required
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedFields.hackathonEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.hackathonEndDate ? (
                  format(watchedFields.hackathonEndDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchedFields.hackathonEndDate}
                onSelect={(date) => setValue("hackathonEndDate", date as Date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.hackathonEndDate && (
            <p className="text-sm text-destructive">
              {errors.hackathonEndDate.message}
            </p>
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Voting Start Date"
          description="When voting begins"
          required
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedFields.votingStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.votingStartDate ? (
                  format(watchedFields.votingStartDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchedFields.votingStartDate}
                onSelect={(date) => setValue("votingStartDate", date as Date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.votingStartDate && (
            <p className="text-sm text-destructive">
              {errors.votingStartDate.message}
            </p>
          )}
        </FormField>

        <FormField
          label="Voting End Date"
          description="When voting ends"
          required
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedFields.votingEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.votingEndDate ? (
                  format(watchedFields.votingEndDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchedFields.votingEndDate}
                onSelect={(date) => setValue("votingEndDate", date as Date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.votingEndDate && (
            <p className="text-sm text-destructive">
              {errors.votingEndDate.message}
            </p>
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Tech Stack"
          description="Select the technologies used in this hackathon"
          required
        >
          <div className="flex flex-wrap gap-2">
            {["AI", "Web3", "Mobile", "Blockchain", "IoT", "AR/VR"].map(
              (tech) => (
                <div
                  key={tech}
                  className="border rounded-md px-3 py-1 text-sm cursor-pointer hover:bg-accent"
                >
                  {tech}
                </div>
              )
            )}
          </div>
        </FormField>

        <FormField
          label="Experience Level"
          description="Select the required experience level"
          required
        >
          <select
            {...register("experienceLevel")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All Levels</option>
          </select>
          {errors.experienceLevel && (
            <p className="text-sm text-destructive">
              {errors.experienceLevel.message}
            </p>
          )}
        </FormField>
      </div>

      <FormField
        label="Location"
        description="Where the hackathon will take place"
        required
      >
        <Input
          {...register("location")}
          placeholder="Enter location"
          className={cn(errors.location && "border-destructive")}
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location.message}</p>
        )}
      </FormField>

      <FormField
        label="Social Links"
        description="Add links to your social media profiles"
      >
        <div className="space-y-2">
          <Input placeholder="https://twitter.com/yourhackathon" />
          <Input placeholder="https://linkedin.com/company/yourhackathon" />
          <Button variant="outline" size="sm" type="button">
            + Add Link
          </Button>
        </div>
      </FormField>

      <FormField
        label="Full Description"
        description="A detailed description of your hackathon"
        required
      >
        <LexicalEditor
          onChange={(content) => setValue("fullDescription", content)}
          placeholder="Enter a detailed description of your hackathon..."
          className="min-h-[200px]"
        />
        {errors.fullDescription && (
          <p className="text-sm text-destructive">
            {errors.fullDescription.message}
          </p>
        )}
      </FormField>
    </div>
  );
}