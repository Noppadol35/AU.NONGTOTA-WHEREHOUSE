"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any)
        }
        return child
      })}
    </div>
  )
}

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600",
      className
    )}>
      {children}
    </div>
  )
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className, onClick }) => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs")
  }

  const isActive = context.value === value

  const handleClick = () => {
    context.onValueChange(value)
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
          : "hover:bg-gray-200 text-gray-700",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("TabsContent must be used within Tabs")
  }

  if (context.value !== value) {
    return null
  }

  return (
    <div className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      className
    )}>
      {children}
    </div>
  )
}

// Context for tabs
const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

// Wrapper component to provide context
const TabsWrapper: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <Tabs value={value} onValueChange={onValueChange} className={className}>
        {children}
      </Tabs>
    </TabsContext.Provider>
  )
}

export { TabsWrapper as Tabs, TabsList, TabsTrigger, TabsContent }
