"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
  const { control, watch, setValue } = useFormContext<HackathonFormValues>();
  
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
                    control={control}
                    name={`schedule.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Opening Ceremony"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`schedule.${index}.dateTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time *</FormLabel>
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
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date and time</span>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`schedule.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this event"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h5 className="text-md font-medium mb-4">Speaker Information</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={control}
                      name={`schedule.${index}.speaker.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Speaker Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Speaker Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`schedule.${index}.speaker.realName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Speaker Real Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`schedule.${index}.speaker.workplace`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workplace *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Company or Organization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`schedule.${index}.speaker.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Job Title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`schedule.${index}.speaker.xHandle`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X.com Handle</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="@username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`schedule.${index}.speaker.picture`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Speaker Picture</FormLabel>
                          <FormControl>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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