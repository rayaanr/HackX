"use client";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { cn } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function ScheduleStep() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<HackathonFormValues>();
  
  const { fields: scheduleSlots, append: appendScheduleSlot, remove: removeScheduleSlot } = useFieldArray({
    control,
    name: "schedule",
  });

  const appendNewScheduleSlot = () => {
    appendScheduleSlot({
      name: "",
      description: "",
      speaker: {
        name: "",
        realName: "",
        workplace: "",
        position: "",
        xHandle: "",
        picture: ""
      },
      dateTime: new Date()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Schedule</h3>
        <Button type="button" onClick={appendNewScheduleSlot} variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Schedule Slot
        </Button>
      </div>

      {scheduleSlots.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No schedule slots added yet
          </p>
          <Button 
            type="button" 
            variant="outline" 
            className="mt-4"
            onClick={appendNewScheduleSlot}
          >
            Add your first schedule slot
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {scheduleSlots.map((slot, index) => {
            const watchedFields = watch(`schedule.${index}`);
            
            return (
              <div key={slot.id} className="border rounded-lg p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium">Schedule Slot #{index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeScheduleSlot(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Event Name"
                    required
                  >
                    <Input
                      {...register(`schedule.${index}.name`)}
                      placeholder="Opening Ceremony"
                      className={errors.schedule?.[index]?.name ? "border-destructive" : ""}
                    />
                    {errors.schedule?.[index]?.name && (
                      <p className="text-sm text-destructive">
                        {errors.schedule?.[index]?.name?.message}
                      </p>
                    )}
                  </FormField>

                  <FormField
                    label="Date & Time"
                    required
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watchedFields.dateTime && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchedFields.dateTime ? (
                            format(watchedFields.dateTime, "PPP HH:mm")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={watchedFields.dateTime}
                          onSelect={(date) => setValue(`schedule.${index}.dateTime`, date as Date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.schedule?.[index]?.dateTime && (
                      <p className="text-sm text-destructive">
                        {errors.schedule?.[index]?.dateTime?.message}
                      </p>
                    )}
                  </FormField>
                </div>

                <FormField
                  label="Description"
                  required
                >
                  <Textarea
                    {...register(`schedule.${index}.description`)}
                    placeholder="Describe this event"
                    className={errors.schedule?.[index]?.description ? "border-destructive" : ""}
                  />
                  {errors.schedule?.[index]?.description && (
                    <p className="text-sm text-destructive">
                      {errors.schedule?.[index]?.description?.message}
                    </p>
                  )}
                </FormField>

                <div className="border-t pt-6">
                  <h5 className="text-md font-medium mb-4">Speaker Information</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Speaker Name"
                      required
                    >
                      <Input
                        {...register(`schedule.${index}.speaker.name`)}
                        placeholder="Speaker Name"
                        className={errors.schedule?.[index]?.speaker?.name ? "border-destructive" : ""}
                      />
                      {errors.schedule?.[index]?.speaker?.name && (
                        <p className="text-sm text-destructive">
                          {errors.schedule?.[index]?.speaker?.name?.message}
                        </p>
                      )}
                    </FormField>

                    <FormField
                      label="Speaker Real Name"
                      required
                    >
                      <Input
                        {...register(`schedule.${index}.speaker.realName`)}
                        placeholder="John Doe"
                        className={errors.schedule?.[index]?.speaker?.realName ? "border-destructive" : ""}
                      />
                      {errors.schedule?.[index]?.speaker?.realName && (
                        <p className="text-sm text-destructive">
                          {errors.schedule?.[index]?.speaker?.realName?.message}
                        </p>
                      )}
                    </FormField>

                    <FormField
                      label="Workplace"
                      required
                    >
                      <Input
                        {...register(`schedule.${index}.speaker.workplace`)}
                        placeholder="Company or Organization"
                        className={errors.schedule?.[index]?.speaker?.workplace ? "border-destructive" : ""}
                      />
                      {errors.schedule?.[index]?.speaker?.workplace && (
                        <p className="text-sm text-destructive">
                          {errors.schedule?.[index]?.speaker?.workplace?.message}
                        </p>
                      )}
                    </FormField>

                    <FormField
                      label="Position"
                      required
                    >
                      <Input
                        {...register(`schedule.${index}.speaker.position`)}
                        placeholder="Job Title"
                        className={errors.schedule?.[index]?.speaker?.position ? "border-destructive" : ""}
                      />
                      {errors.schedule?.[index]?.speaker?.position && (
                        <p className="text-sm text-destructive">
                          {errors.schedule?.[index]?.speaker?.position?.message}
                        </p>
                      )}
                    </FormField>

                    <FormField
                      label="X.com Handle"
                    >
                      <Input
                        {...register(`schedule.${index}.speaker.xHandle`)}
                        placeholder="@username"
                      />
                    </FormField>

                    <FormField
                      label="Speaker Picture"
                    >
                      <div className="flex items-center gap-4">
                        <div className="border-2 border-dashed rounded-lg w-16 h-16 flex items-center justify-center">
                          {watchedFields.speaker?.picture ? (
                            <img
                              src={watchedFields.speaker.picture}
                              alt="Speaker preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">Preview</span>
                          )}
                        </div>
                        <Button variant="outline" type="button" size="sm">
                          Upload
                        </Button>
                      </div>
                    </FormField>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}