
"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, X, ChevronsUpDown, Trash2 } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  selected: string[]
  onChange: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
  name?: string
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      selected,
      onChange,
      variant,
      className,
      placeholder = "Select options",
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    const handleUnselect = (item: string) => {
      onChange(selected.filter((i) => i !== item))
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between min-h-10 h-auto", className)}
            onClick={() => setOpen(!open)}
            {...props}
          >
            <div className="flex flex-wrap gap-1">
              {selected.length > 0 ? (
                options
                  .filter((option) => selected.includes(option.value))
                  .map((option) => (
                    <Badge
                      key={option.value}
                      className={cn(
                        "rounded-sm px-2 py-1",
                        multiSelectVariants({ variant })
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnselect(option.value)
                      }}
                    >
                      {option.label}
                      <X className="ml-2 h-4 w-4 cursor-pointer" />
                    </Badge>
                  ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isSelected) {
                          handleUnselect(option.value)
                        } else {
                          onChange([...selected, option.value])
                        }
                      }}
                      style={{
                        pointerEvents: "auto",
                        opacity: 1,
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {selected.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onChange([])}
                      className="justify-center text-center cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear all
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
         {/* Hidden inputs to send data to the form */}
        {selected.map((value) => (
          <input key={value} type="hidden" name={props.name} value={value} />
        ))}
      </Popover>
    )
  }
)

MultiSelect.displayName = "MultiSelect"
