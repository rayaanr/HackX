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
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { type HackathonFormData } from "@/lib/schemas/hackathon-schema";
import { Trash2, Plus } from "lucide-react";
import { ImageUploader } from "@/components/ui/file-upload";

export function ScheduleStep() {
  const { control } = useFormContext<HackathonFormData>();

  const {
    fields: scheduleSlots,
    append: appendScheduleSlot,
    remove: removeScheduleSlot,
  } = useFieldArray({
    control,
    name: "schedule",
  });

  // Watch all hasSpeaker values at once to avoid Rules of Hooks violation
  const watchedHasSpeakerValues = useWatch({
    control,
    name: "schedule",
  });

  const appendNewScheduleSlot = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

    appendScheduleSlot({
      name: "",
      description: "",
      speaker: {
        name: "",
        xName: "",
        position: "",
        xHandle: "",
        picture: "",
      },
      startDateTime: now,
      endDateTime: endTime,
      hasSpeaker: false,
    });
  };

  return (
    <div className="space-y-6">
      {scheduleSlots.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={appendNewScheduleSlot}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Schedule Slot
          </Button>
        </div>
      )}

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
            // Get the watched hasSpeaker value for this specific index
            const watchedHasSpeaker =
              watchedHasSpeakerValues?.[index]?.hasSpeaker;

            return (
              <div key={slot.id} className="border rounded-lg p-6 space-y-6">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeScheduleSlot(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <FormField
                    control={control}
                    name={`schedule.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Opening Ceremony" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={control}
                      name={`schedule.${index}.startDateTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Start Date & Time</FormLabel>
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

                    <FormField
                      control={control}
                      name={`schedule.${index}.endDateTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>End Date & Time</FormLabel>
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

                <FormField
                  control={control}
                  name={`schedule.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Description</FormLabel>
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
                  <FormField
                    control={control}
                    name={`schedule.${index}.hasSpeaker`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            Add a speaker
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {watchedHasSpeaker && (
                    <div className="mt-6 space-y-6">
                      <h5 className="text-md font-medium">
                        Speaker Information
                      </h5>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={control}
                            name={`schedule.${index}.speaker.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel required>Speaker Name</FormLabel>
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
                            name={`schedule.${index}.speaker.position`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel required>
                                    Position & Workplace
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Job Title, Company"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={control}
                            name={`schedule.${index}.speaker.xName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel required>Speaker X Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
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
                                <FormLabel>x.com Handle</FormLabel>
                                <FormControl>
                                  <Input placeholder="@username" {...field} />
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
                                <FormLabel>Speaker Avatar</FormLabel>
                                <FormControl>
                                  <ImageUploader
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Upload Avatar"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
