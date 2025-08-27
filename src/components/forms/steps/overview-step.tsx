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
import { CalendarIcon, Upload, Image as ImageIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { LexicalEditor } from "@/components/forms/lexical-editor";
import { TechStackSelector } from "@/components/forms/tech-stack-selector";
import { SocialLinksInput } from "@/components/forms/social-links-input";

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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Hackathon Name"
              description="The name of your hackathon"
              required
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="Enter hackathon name"
              />
            </FormField>

            <FormField
              label="Logo"
              description="Upload a logo for your hackathon"
            >
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed rounded-lg w-16 h-16 flex items-center justify-center bg-muted/30">
                  {watchedFields.logo ? (
                    <img
                      src={watchedFields.logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
            </FormField>
          </div>

          <FormField
            label="Short Description"
            description="A brief description of your hackathon"
            required
            error={errors.shortDescription?.message}
          >
            <Textarea
              {...register("shortDescription")}
              placeholder="Enter a short description"
              rows={3}
            />
          </FormField>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Experience Level"
              description="Target experience level for participants"
              required
              error={errors.experienceLevel?.message}
            >
              <Select onValueChange={(value) => setValue("experienceLevel", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="all">All Levels</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Location"
              description="Where the hackathon will take place"
              required
              error={errors.location?.message}
            >
              <Input
                {...register("location")}
                placeholder="e.g., Online, San Francisco, CA"
              />
            </FormField>
          </div>

          <FormField
            label="Tech Stack"
            description="Technologies and themes for your hackathon"
            required
            error={errors.techStack?.message}
          >
            <TechStackSelector />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            label="Social Media & Communication"
            description="Add links to help participants connect with you"
          >
            <SocialLinksInput />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full Description</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            label="Detailed Description"
            description="Provide a comprehensive description of your hackathon"
            required
            error={errors.fullDescription?.message}
          >
            <LexicalEditor
              onChange={(content) => setValue("fullDescription", content)}
              placeholder="Enter a detailed description of your hackathon, including goals, themes, prizes, and what participants can expect..."
              className="min-h-[200px]"
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}