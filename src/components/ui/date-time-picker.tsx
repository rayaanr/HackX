"use client";

import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useId, useState } from "react";

interface DateTimePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className = "",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = useState<string>(
    value ? format(value, "HH:mm") : "09:00",
  );

  // Generate unique IDs for this component instance
  const baseId = useId();
  const datePickerId = `${baseId}-date`;
  const timePickerId = `${baseId}-time`;

  useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setTimeValue(format(value, "HH:mm"));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
      onChange?.(newDate);
    } else {
      setSelectedDate(undefined);
      onChange?.(undefined);
    }
    setOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
      onChange?.(newDate);
    }
  };

  return (
    <div className={`grid grid-cols-[2fr_1fr] gap-2 ${className}`}>
      <div className="flex flex-col gap-3">
        {label && (
          <Label htmlFor={datePickerId} className="px-1">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={datePickerId}
              disabled={disabled}
              className="w-full justify-between font-normal"
            >
              {selectedDate ? format(selectedDate, "MMM dd") : placeholder}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        {label && (
          <Label htmlFor={timePickerId} className="px-1">
            Time
          </Label>
        )}
        <Input
          type="time"
          id={timePickerId}
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
        />
      </div>
    </div>
  );
}
