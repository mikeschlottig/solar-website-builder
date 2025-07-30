"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageIcon } from "lucide-react"
import { mediaServiceGetUserMedia } from "@/lib/sdk"
import type { Component, MediaAsset } from "@/lib/sdk"

interface PropertyPanelProps {
  component: Component
  instance: {
    id: string
    componentId: string
    type: "built-in" | "custom"
    props: Record<string, any>
  }
  onPropsChange: (newProps: Record<string, any>) => void
  websiteId: string
}

export default function PropertyPanel({ component, instance, onPropsChange, websiteId }: PropertyPanelProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [showMediaSelector, setShowMediaSelector] = useState<string | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)

  useEffect(() => {
    // Load media assets for image properties
    loadMediaAssets()
  }, [websiteId])

  const loadMediaAssets = async () => {
    if (!websiteId) return

    setLoadingMedia(true)
    try {
      const response = await mediaServiceGetUserMedia({
        body: {
          website_id: websiteId,
          mime_type_filter: "image",
        },
      })
      if (response.data) {
        setMediaAssets(response.data)
      }
    } catch (error) {
      console.error("Failed to load media assets:", error)
    } finally {
      setLoadingMedia(false)
    }
  }

  const updateProp = (key: string, value: any) => {
    const newProps = {
      ...instance.props,
      [key]: value,
    }
    onPropsChange(newProps)
  }

  const renderPropertyInput = (key: string, schema: any) => {
    const value = instance.props[key] ?? schema.default ?? ""

    switch (schema.type) {
      case "string":
        if (schema.multiline) {
          return (
            <Textarea
              value={value}
              onChange={(e) => updateProp(key, e.target.value)}
              placeholder={schema.placeholder || `Enter ${key}`}
              rows={3}
            />
          )
        }
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateProp(key, e.target.value)}
            placeholder={schema.placeholder || `Enter ${key}`}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(newValue) => updateProp(key, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {schema.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={Boolean(value)} onCheckedChange={(checked) => updateProp(key, checked)} />
            <Label>{value ? "Enabled" : "Disabled"}</Label>
          </div>
        )

      case "color":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={value || "#000000"}
              onChange={(e) => updateProp(key, e.target.value)}
              className="w-12 h-8 p-1 border rounded"
            />
            <Input
              type="text"
              value={value || "#000000"}
              onChange={(e) => updateProp(key, e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        )

      case "image":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={value}
                onChange={(e) => updateProp(key, e.target.value)}
                placeholder="Image URL or path"
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={() => setShowMediaSelector(key)} disabled={loadingMedia}>
                <ImageIcon className="h-3 w-3" />
              </Button>
            </div>

            {showMediaSelector === key && (
              <Card className="p-3">
                <div className="space-y-2 max-h-40 overflow-auto">
                  <p className="text-xs font-medium text-gray-700">Select from media library:</p>
                  {loadingMedia ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : mediaAssets.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {mediaAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="cursor-pointer border rounded overflow-hidden hover:ring-2 hover:ring-blue-500"
                          onClick={() => {
                            updateProp(key, asset.file_path)
                            setShowMediaSelector(null)
                          }}
                        >
                          <img
                            src={asset.file_path || "/placeholder.svg"}
                            alt={asset.name}
                            className="w-full h-12 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">No images found</p>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setShowMediaSelector(null)} className="w-full">
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {value && (
              <div className="mt-2">
                <img
                  src={value || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-20 object-cover border rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=80&width=200&text=Image+Not+Found"
                  }}
                />
              </div>
            )}
          </div>
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateProp(key, Number.parseInt(e.target.value) || 0)}
            placeholder={`Enter ${key}`}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateProp(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        )
    }
  }

  const propsSchema = component.props_schema || {}
  const propsKeys = Object.keys(propsSchema)

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900">{component.name}</h3>
          <Badge variant={component.component_type === "built-in" ? "default" : "secondary"}>
            {component.component_type === "built-in" ? "Built-in" : "Custom"}
          </Badge>
        </div>
        {component.description && <p className="text-xs text-gray-600">{component.description}</p>}
      </div>

      <div className="p-4 space-y-6">
        {propsKeys.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No configurable properties</p>
          </div>
        ) : (
          propsKeys.map((key) => {
            const schema = propsSchema[key]
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`prop-${key}`} className="text-sm font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                  {schema.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderPropertyInput(key, schema)}
                {schema.description && <p className="text-xs text-gray-500">{schema.description}</p>}
              </div>
            )
          })
        )}

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Component Info</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="font-mono text-xs">{instance.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{component.component_type}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span>{component.category}</span>
            </div>
            {component.version && (
              <div className="flex justify-between">
                <span>Version:</span>
                <span>{component.version}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
