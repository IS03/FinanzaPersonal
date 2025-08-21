"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { cn } from "@/lib/utils"

interface FilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: Array<{ value: string; label: string }>
  label?: string
  size?: "default" | "wide" | "category"
  className?: string
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  label,
  size = "default",
  className
}: FilterSelectProps) {
  const getTriggerClass = () => {
    switch (size) {
      case "wide":
        return "filter-select-trigger-wide"
      case "category":
        return "filter-select-trigger-category"
      default:
        return "filter-select-trigger"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={getTriggerClass()}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[100px] scrollbar-hidden">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
