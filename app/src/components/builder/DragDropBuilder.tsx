"use client"

import type React from "react"

import { Trash2, Plus, Grip, Pencil, Zap } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { componentServiceGetBuiltInComponents, componentServiceGetUserComponents } from "@/lib/sdk"
import type { Component } from "@/lib/sdk"
import ComponentRenderer from "./ComponentRenderer"
import PropertyPanel from "./PropertyPanel"

interface DragDropBuilderProps {
  content: any
  onChange: (content: any) => void
  websiteId: string
}

interface ComponentInstance {
  id: string
  componentId: string
  type: "built-in" | "custom"
  props: Record<string, any>
}

export default function DragDropBuilder({ content, onChange, websiteId }: DragDropBuilderProps) {
  const [components, setComponents] = useState<Component[]>([])
  const [builtInComponents, setBuiltInComponents] = useState<Component[]>([])
  const [userComponents, setUserComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<ComponentInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadComponents()
  }, [])

  const loadComponents = async () => {
    try {
      const [builtInResponse, userResponse] = await Promise.all([
        componentServiceGetBuiltInComponents(),
        componentServiceGetUserComponents({ body: {} }),
      ])

      if (builtInResponse.data) {
        setBuiltInComponents(builtInResponse.data)
      }

      if (userResponse.data) {
        setUserComponents(userResponse.data)
      }
    } catch (error) {
      console.error("Failed to load components:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId === "component-library" || source.droppableId === "component-library-custom") {
      // Adding a new component from the library
      const componentId = result.draggableId
      const component = [...builtInComponents, ...userComponents].find((c) => c.id === componentId)

      if (component) {
        const defaultProps = component.props_schema
          ? Object.keys(component.props_schema).reduce(
              (acc, key) => {
                const schema = component.props_schema![key]
                acc[key] = schema.default || ""
                return acc
              },
              {} as Record<string, any>,
            )
          : {}

        const newInstance: ComponentInstance = {
          id: `${componentId}-${Date.now()}`,
          componentId: component.id!,
          type: component.component_type as "built-in" | "custom",
          props: defaultProps,
        }

        const newComponents = [...(content.components || [])]
        newComponents.splice(destination.index, 0, newInstance)

        onChange({
          ...content,
          components: newComponents,
        })
      }
    } else if (source.droppableId === "canvas" && destination.droppableId === "canvas") {
      // Reordering components within the canvas
      const newComponents = [...(content.components || [])]
      const [reorderedItem] = newComponents.splice(source.index, 1)
      newComponents.splice(destination.index, 0, reorderedItem)

      onChange({
        ...content,
        components: newComponents,
      })
    }
  }

  const removeComponent = (index: number) => {
    const newComponents = [...(content.components || [])]
    const removedComponent = newComponents[index]
    newComponents.splice(index, 1)

    onChange({
      ...content,
      components: newComponents,
    })

    // Clear selection if the removed component was selected
    if (selectedComponent?.id === removedComponent.id) {
      setSelectedComponent(null)
    }
  }

  const updateComponentProps = (instanceId: string, newProps: Record<string, any>) => {
    const newComponents = (content.components || []).map((comp: ComponentInstance) =>
      comp.id === instanceId ? { ...comp, props: newProps } : comp,
    )

    onChange({
      ...content,
      components: newComponents,
    })

    // Update selected component if it's the one being edited
    if (selectedComponent?.id === instanceId) {
      setSelectedComponent({ ...selectedComponent, props: newProps })
    }
  }

  const selectComponent = (instance: ComponentInstance, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedComponent(instance)
  }

  const renderComponentLibrary = () => (
    <div className="h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Components</h3>
      </div>

      <Tabs defaultValue="builtin" className="h-full">
        <div className="px-4 py-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builtin">Built-in</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="funnels">Funnels</TabsTrigger>
            <TabsTrigger value="exit-intent">Exit Intent</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="builtin" className="px-4 pb-4 space-y-2">
          <Droppable droppableId="component-library" isDropDisabled={true}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {builtInComponents
                  .filter((comp) => comp.category !== "Exit Intent")
                  .map((component, index) => (
                    <Draggable key={component.id} draggableId={component.id!} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Grip className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{component.name}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2">{component.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {component.category}
                          </Badge>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </TabsContent>

        <TabsContent value="custom" className="px-4 pb-4 space-y-2">
          <Droppable droppableId="component-library-custom" isDropDisabled={true}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {userComponents.map((component, index) => (
                  <Draggable key={component.id} draggableId={component.id!} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow ${
                          snapshot.isDragging ? "shadow-lg" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Grip className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{component.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{component.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {component.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </TabsContent>

        <TabsContent value="funnels" className="px-4 pb-4 space-y-2">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Complete Conversion Funnels</h4>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => createConversionFunnel("trust-based-funnel")}
            >
              🛡️ Trust-Based Funnel
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => createConversionFunnel("urgency-driven-funnel")}
            >
              ⚡ Urgency-Driven Funnel
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => createConversionFunnel("benefit-focused-funnel")}
            >
              💰 Benefit-Focused Funnel
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => createConversionFunnel("story-driven-funnel")}
            >
              📖 Story-Driven Funnel
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
              onClick={() => createConversionFunnel("feature-rich-funnel")}
            >
              🚀 Feature-Rich Funnel
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="exit-intent" className="px-4 pb-4 space-y-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-orange-500" />
              <h4 className="text-sm font-medium text-gray-700">Exit Intent Components</h4>
            </div>

            <Droppable droppableId="exit-intent-library" isDropDisabled={true}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {builtInComponents
                    .filter((comp) => comp.category === "Exit Intent")
                    .map((component, index) => (
                      <Draggable key={component.id} draggableId={component.id!} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border border-orange-200 rounded-lg cursor-move hover:shadow-md transition-shadow bg-orange-50 ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Grip className="h-4 w-4 text-orange-400" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-orange-800">{component.name}</h4>
                                <p className="text-xs text-orange-600 line-clamp-2">{component.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                Exit Intent
                              </Badge>
                              <Zap className="h-3 w-3 text-orange-500" />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className="border-t pt-3 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Exit Intent Funnels</h4>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent mb-2"
                onClick={() => createExitIntentFunnel("ecommerce-exit-funnel")}
              >
                🛒 E-commerce Exit Funnel
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent mb-2"
                onClick={() => createExitIntentFunnel("saas-exit-funnel")}
              >
                💻 SaaS Exit Funnel
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => createExitIntentFunnel("leadgen-exit-funnel")}
              >
                📧 Lead Gen Exit Funnel
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderCanvas = () => (
    <div className="flex-1 bg-gray-50 p-4 overflow-auto" onClick={() => setSelectedComponent(null)}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm min-h-[600px]">
          <Droppable droppableId="canvas">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-6 min-h-[600px] ${snapshot.isDraggingOver ? "bg-blue-50" : ""}`}
              >
                {content.components && content.components.length > 0 ? (
                  content.components.map((instance: ComponentInstance, index: number) => {
                    const component = [...builtInComponents, ...userComponents].find(
                      (c) => c.id === instance.componentId,
                    )

                    return (
                      <Draggable key={instance.id} draggableId={instance.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-4 group relative cursor-pointer ${snapshot.isDragging ? "opacity-50" : ""} ${
                              selectedComponent?.id === instance.id
                                ? "ring-2 ring-blue-500 ring-offset-2"
                                : "hover:ring-1 hover:ring-gray-300"
                            }`}
                            onClick={(e) => selectComponent(instance, e)}
                          >
                            {/* Component Controls */}
                            <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow-sm">
                                <div {...provided.dragHandleProps} className="p-1 hover:bg-gray-100 cursor-move">
                                  <Grip className="h-3 w-3 text-gray-500" />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => selectComponent(instance, e)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeComponent(index)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Component Content */}
                            {component && <ComponentRenderer component={component} props={instance.props} />}
                          </div>
                        )}
                      </Draggable>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Start building your conversion funnel</p>
                      <p className="text-sm">Choose a complete funnel template or drag individual components</p>
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <p className="text-sm font-medium text-orange-800">Pro Tip: Exit Intent</p>
                        </div>
                        <p className="text-xs text-orange-600">
                          Add exit intent components to capture visitors before they leave!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </div>
  )

  const renderPropertyPanel = () => {
    if (!selectedComponent) {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="text-center text-gray-500">
            <Pencil className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Select a component to edit its properties</p>
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-medium text-orange-800">Exit Intent Tips</p>
              </div>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>• Use 3-5 second delays for best results</li>
                <li>• Test different offers for your audience</li>
                <li>• Set appropriate cookie expiration</li>
                <li>• Monitor conversion rates closely</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    const component = [...builtInComponents, ...userComponents].find((c) => c.id === selectedComponent.componentId)

    if (!component) {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="text-center text-gray-500">
            <p className="text-sm">Component not found</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-80 bg-white border-l border-gray-200">
        <PropertyPanel
          component={component}
          instance={selectedComponent}
          onPropsChange={(newProps) => updateComponentProps(selectedComponent.id, newProps)}
          websiteId={websiteId}
        />
      </div>
    )
  }

  const createConversionFunnel = (funnelType: string) => {
    // Keep existing funnel creation logic
    let funnelComponents: ComponentInstance[] = []

    switch (funnelType) {
      case "trust-based-funnel":
        funnelComponents = [
          // Trust-Focused Hero
          {
            id: `hero-trust-${Date.now()}`,
            componentId: "hero-trust",
            type: "built-in",
            props: {
              title: "Trusted by 50,000+ Businesses Worldwide",
              subtitle: "Join industry leaders who rely on our proven platform to drive results",
              trustIndicators:
                "⭐ 4.9/5 Rating (2,847 reviews)\n🏆 #1 Industry Leader 2024\n🔒 SOC 2 Type II Certified\n📈 99.9% Uptime SLA",
              testimonialQuote:
                "This platform transformed our business operations completely. ROI was visible within the first month.",
              testimonialAuthor: "Sarah Johnson, CEO at TechCorp",
              buttonText: "Join Thousands of Happy Customers",
              buttonLink: "#signup",
              backgroundColor: "#ffffff",
              textColor: "#1f2937",
            },
          },
          // Social Proof Bar
          {
            id: `social-proof-${Date.now() + 1}`,
            componentId: "social-proof-bar",
            type: "built-in",
            props: {
              type: "stats",
              title: "Proven Results Across Industries",
              stats: "50,000+|Happy Customers\n99.9%|Uptime Guarantee\n24/7|Expert Support\n150+|Countries Served",
              backgroundColor: "#f9fafb",
              textColor: "#374151",
            },
          },
          // Value Proposition Grid
          {
            id: `value-prop-${Date.now() + 2}`,
            componentId: "value-prop-grid",
            type: "built-in",
            props: {
              title: "Why Industry Leaders Choose Us",
              subtitle: "Proven benefits that drive real business results",
              valueProps:
                "🛡️ Enterprise Security|Bank-level security with SOC 2 compliance and 256-bit encryption\n📊 Proven ROI|Average 300% ROI within 6 months, backed by independent studies\n🏆 Award-Winning Support|24/7 expert support with 99% satisfaction rating\n⚡ Reliable Performance|99.9% uptime SLA with global infrastructure",
              layout: "2x2",
              backgroundColor: "#ffffff",
            },
          },
          // Feature Showcase
          {
            id: `feature-showcase-${Date.now() + 3}`,
            componentId: "feature-showcase",
            type: "built-in",
            props: {
              title: "Enterprise-Grade Features You Can Trust",
              features:
                "Advanced Analytics|Get actionable insights with AI-powered analytics trusted by Fortune 500 companies\nTeam Collaboration|Work seamlessly with enterprise-grade collaboration tools used by 50,000+ teams\nAutomated Workflows|Save time with intelligent automation that's processed over 10 million tasks\nCompliance & Security|Meet regulatory requirements with SOC 2, GDPR, and HIPAA compliance",
              layout: "alternating",
              showImages: true,
              backgroundColor: "#f9fafb",
            },
          },
          // Testimonials Section
          {
            id: `testimonial-${Date.now() + 4}`,
            componentId: "testimonial",
            type: "built-in",
            props: {
              quote:
                "We evaluated 12 different solutions. This platform was the clear winner in terms of reliability, features, and support. Our productivity increased by 40% in the first quarter.",
              author: "Michael Chen",
              title: "CTO, Global Manufacturing Corp",
              style: "quote",
              textAlign: "center",
            },
          },
          // Risk-Reversal CTA
          {
            id: `cta-${Date.now() + 5}`,
            componentId: "cta-section",
            type: "built-in",
            props: {
              style: "risk-reversal",
              title: "Start Your Risk-Free Trial Today",
              subtitle: "Join thousands of successful businesses already using our trusted platform",
              primaryButtonText: "Start 30-Day Free Trial",
              primaryButtonLink: "#trial",
              secondaryButtonText: "Schedule Demo",
              secondaryButtonLink: "#demo",
              riskReversal: "30-day money-back guarantee • No setup fees • Cancel anytime • Free migration support",
              backgroundColor: "#1f2937",
              textColor: "#ffffff",
            },
          },
          // Conversion Form
          {
            id: `form-${Date.now() + 6}`,
            componentId: "conversion-form",
            type: "built-in",
            props: {
              formType: "trial",
              title: "Start Your Free Trial",
              subtitle: "No credit card required • Setup in under 5 minutes • Full access to all features",
              fields:
                "Full Name|text|required\nWork Email|email|required\nCompany Name|text|required\nPhone Number|tel|",
              submitText: "Start Free Trial",
              privacyText: "We respect your privacy. Your information is secure and will never be shared.",
              backgroundColor: "#ffffff",
            },
          },
        ]
        break

      case "urgency-driven-funnel":
        funnelComponents = [
          // Urgency Hero
          {
            id: `hero-urgency-${Date.now()}`,
            componentId: "hero-urgency",
            type: "built-in",
            props: {
              urgencyText: "🔥 Limited Time: 50% Off Everything",
              title: "Don't Miss Out - This Deal Expires Soon!",
              subtitle:
                "Get premium features at half the price. This exclusive offer won't last long - secure your spot now!",
              countdown: "⏰ Offer expires in 2 days, 14 hours, 23 minutes",
              scarcityText: "⚠️ Only 47 spots remaining at this price",
              buttonText: "Claim Your 50% Discount Now",
              buttonLink: "#claim",
              backgroundColor: "#dc2626",
              textColor: "#ffffff",
              accentColor: "#fbbf24",
            },
          },
          // Urgency Social Proof
          {
            id: `social-proof-${Date.now() + 1}`,
            componentId: "social-proof-bar",
            type: "built-in",
            props: {
              type: "testimonials",
              title: "Others Are Already Taking Action",
              testimonials:
                '"Grabbed this deal immediately - best decision ever!"|John D., Marketing Director\n"The discount made it a no-brainer. Amazing value!"|Sarah M., Startup Founder\n"Wish I had found this offer sooner!"|Mike R., Agency Owner',
              backgroundColor: "#fef2f2",
              textColor: "#991b1b",
            },
          },
          // Value Props with Urgency
          {
            id: `value-prop-${Date.now() + 2}`,
            componentId: "value-prop-grid",
            type: "built-in",
            props: {
              title: "Why You Need to Act Now",
              subtitle: "This limited-time offer includes everything you need to succeed",
              valueProps:
                "💰 Save $2,400/Year|Get premium features at 50% off - that's $200 saved every month\n⚡ Instant Access|Start using all features immediately after signup - no waiting period\n🎁 Bonus Included|Free setup, training, and priority support (normally $500 value)\n🔒 Price Lock|Lock in this rate forever - prices increase 30% next month",
              layout: "2x2",
              backgroundColor: "#fef2f2",
            },
          },
          // Urgency CTA
          {
            id: `cta-${Date.now() + 3}`,
            componentId: "cta-section",
            type: "built-in",
            props: {
              style: "urgency",
              title: "Last Chance - Don't Let This Slip Away!",
              subtitle: "This 50% discount expires in hours. Secure your spot before it's too late.",
              urgencyText: "⚠️ FINAL HOURS - Offer expires at midnight!",
              primaryButtonText: "Claim 50% Discount Now",
              primaryButtonLink: "#claim",
              secondaryButtonText: "See What You'll Miss",
              secondaryButtonLink: "#features",
              backgroundColor: "#dc2626",
              textColor: "#ffffff",
            },
          },
          // Quick Conversion Form
          {
            id: `form-${Date.now() + 4}`,
            componentId: "conversion-form",
            type: "built-in",
            props: {
              formType: "signup",
              title: "Claim Your 50% Discount",
              subtitle: "⏰ Hurry! Only minutes left at this price",
              fields: "Email Address|email|required\nFirst Name|text|required",
              submitText: "Get 50% Off Now",
              privacyText: "Secure checkout • Cancel anytime • 30-day guarantee",
              backgroundColor: "#ffffff",
            },
          },
        ]
        break

      case "benefit-focused-funnel":
        funnelComponents = [
          // Benefit Hero
          {
            id: `hero-benefit-${Date.now()}`,
            componentId: "hero-benefit",
            type: "built-in",
            props: {
              benefit: "Save 15+ Hours Per Week",
              title: "Automate Your Workflow & Reclaim Your Time",
              description:
                "Join 8,000+ professionals who've eliminated busy work and focus on what matters most. See results in your first week.",
              proof:
                '"I got 18 hours back in my first week and increased my productivity by 200%!" - Sarah K., Marketing Director',
              buttonText: "Start Saving Time Today",
              buttonLink: "#start",
              backgroundColor: "#059669",
              textColor: "#ffffff",
            },
          },
          // Benefit-Focused Value Props
          {
            id: `value-prop-${Date.now() + 1}`,
            componentId: "value-prop-grid",
            type: "built-in",
            props: {
              title: "Transform Your Productivity",
              subtitle: "Real benefits that make a measurable difference in your daily work",
              valueProps:
                "⏰ Save 15+ Hours Weekly|Automate repetitive tasks and focus on high-value work that drives results\n💰 Increase Revenue 40%|Spend more time on revenue-generating activities instead of admin work\n😌 Reduce Stress 60%|Eliminate overwhelm with organized workflows and automated reminders\n🚀 Boost Team Efficiency|Help your entire team work smarter with collaborative automation tools",
              layout: "2x2",
              backgroundColor: "#f0fdf4",
            },
          },
          // Feature Benefits
          {
            id: `feature-showcase-${Date.now() + 2}`,
            componentId: "feature-showcase",
            type: "built-in",
            props: {
              title: "Features That Deliver Real Results",
              features:
                "Smart Task Automation|Eliminate 80% of repetitive work with AI-powered automation that learns your patterns\nTime Tracking & Analytics|See exactly where your time goes and identify opportunities to save 5+ hours weekly\nTeam Collaboration Hub|Reduce meeting time by 50% with async collaboration and automated status updates\nGoal Achievement System|Stay focused on what matters with automated progress tracking and milestone alerts",
              layout: "alternating",
              showImages: true,
              backgroundColor: "#ffffff",
            },
          },
          // Benefit Testimonial
          {
            id: `testimonial-${Date.now() + 3}`,
            componentId: "testimonial",
            type: "built-in",
            props: {
              quote:
                "This platform gave me my life back. I was working 70-hour weeks and constantly stressed. Now I work 45 hours and accomplish twice as much. My work-life balance has never been better.",
              author: "David Park",
              title: "Founder, Digital Agency",
              style: "card",
              textAlign: "center",
            },
          },
          // Benefit-Focused CTA
          {
            id: `cta-${Date.now() + 4}`,
            componentId: "cta-section",
            type: "built-in",
            props: {
              style: "benefit",
              title: "Ready to Reclaim 15+ Hours Per Week?",
              subtitle: "Start your transformation today and see results in your first week",
              primaryButtonText: "Start Saving Time Now",
              primaryButtonLink: "#start",
              secondaryButtonText: "See How It Works",
              secondaryButtonLink: "#demo",
              backgroundColor: "#059669",
              textColor: "#ffffff",
            },
          },
          // Results-Focused Form
          {
            id: `form-${Date.now() + 5}`,
            componentId: "conversion-form",
            type: "built-in",
            props: {
              formType: "trial",
              title: "Start Your Productivity Transformation",
              subtitle: "See results in your first week • No credit card required",
              fields: "Full Name|text|required\nWork Email|email|required\nCurrent Weekly Hours Worked|text|",
              submitText: "Start Saving Time",
              privacyText: "Join 8,000+ professionals already saving 15+ hours per week",
              backgroundColor: "#ffffff",
            },
          },
        ]
        break

      case "story-driven-funnel":
        funnelComponents = [
          // Story Hero
          {
            id: `hero-story-${Date.now()}`,
            componentId: "hero-story",
            type: "built-in",
            props: {
              storyHook:
                "Three years ago, our founder was drowning in spreadsheets, working 80-hour weeks, and missing his daughter's bedtime stories...",
              transformation:
                "Today, we help thousands of entrepreneurs reclaim their time and build the business of their dreams",
              emotionalBenefit:
                "Stop feeling overwhelmed by endless tasks. Start feeling empowered to focus on what truly matters - growing your business and living your life.",
              callToAction: "Your transformation story starts here",
              buttonText: "Begin Your Journey",
              buttonLink: "#journey",
              backgroundColor: "#4f46e5",
              textColor: "#ffffff",
            },
          },
          // Story-Based Social Proof
          {
            id: `social-proof-${Date.now() + 1}`,
            componentId: "social-proof-bar",
            type: "built-in",
            props: {
              type: "testimonials",
              title: "Real Stories from Real People",
              testimonials:
                '"Went from chaos to clarity in 30 days"|Emma R., E-commerce Owner\n"Finally have time for my family again"|Carlos M., Consultant\n"My business doubled while working less"|Lisa T., Coach',
              backgroundColor: "#faf5ff",
              textColor: "#581c87",
            },
          },
          // Emotional Value Props
          {
            id: `value-prop-${Date.now() + 2}`,
            componentId: "value-prop-grid",
            type: "built-in",
            props: {
              title: "What Your Success Story Could Look Like",
              subtitle: "Imagine having the freedom to focus on what you love most about your business",
              valueProps:
                "🏠 Work-Life Balance|Come home energized instead of exhausted - be present for the moments that matter\n💡 Creative Freedom|Stop drowning in admin work and rediscover your passion for innovation\n📈 Sustainable Growth|Build a business that grows without burning you out or sacrificing your health\n😊 Peace of Mind|Sleep better knowing your business runs smoothly even when you're not working",
              layout: "2x2",
              backgroundColor: "#faf5ff",
            },
          },
          // Story-Based Features
          {
            id: `feature-showcase-${Date.now() + 3}`,
            componentId: "feature-showcase",
            type: "built-in",
            props: {
              title: "The Tools That Changed Everything",
              features:
                "Workflow Automation|The same system our founder used to go from 80-hour weeks to 40-hour weeks while doubling revenue\nSmart Prioritization|Never wonder what to work on next - our AI helps you focus on tasks that move the needle\nTeam Harmony|Transform chaotic communication into smooth collaboration that everyone actually enjoys\nGrowth Tracking|Watch your progress unfold with visual dashboards that celebrate every milestone",
              layout: "vertical",
              showImages: true,
              backgroundColor: "#ffffff",
            },
          },
          // Emotional Testimonial
          {
            id: `testimonial-${Date.now() + 4}`,
            componentId: "testimonial",
            type: "built-in",
            props: {
              quote:
                "I was skeptical at first, but this platform literally saved my marriage. I was so stressed and working all the time. Now I have my evenings back, my business is thriving, and my family is happy. It's not just a business tool - it's a life changer.",
              author: "Jennifer Walsh",
              title: "Marketing Agency Owner & Mom of Two",
              style: "quote",
              textAlign: "center",
            },
          },
          // Story-Driven CTA
          {
            id: `cta-${Date.now() + 5}`,
            componentId: "cta-section",
            type: "built-in",
            props: {
              style: "simple",
              title: "Your Success Story Starts Today",
              subtitle: "Join thousands who've transformed their business and reclaimed their life",
              primaryButtonText: "Start My Transformation",
              primaryButtonLink: "#transform",
              secondaryButtonText: "Read More Stories",
              secondaryButtonLink: "#stories",
              backgroundColor: "#4f46e5",
              textColor: "#ffffff",
            },
          },
          // Personal Connection Form
          {
            id: `form-${Date.now() + 6}`,
            componentId: "conversion-form",
            type: "built-in",
            props: {
              formType: "demo",
              title: "Let's Write Your Success Story",
              subtitle: "Tell us about your goals and we'll show you exactly how to achieve them",
              fields:
                "Your Name|text|required\nEmail Address|email|required\nWhat's your biggest business challenge?|textarea|required\nWhat would success look like for you?|textarea|",
              submitText: "Start My Journey",
              privacyText: "Your story matters to us. We'll never share your information.",
              backgroundColor: "#ffffff",
            },
          },
        ]
        break

      case "feature-rich-funnel":
        funnelComponents = [
          // Classic Comprehensive Hero
          {
            id: `hero-classic-${Date.now()}`,
            componentId: "hero-classic",
            type: "built-in",
            props: {
              title: "The Complete Business Automation Platform",
              subtitle:
                "Everything you need to streamline operations, boost productivity, and scale your business - all in one powerful platform trusted by 25,000+ companies worldwide.",
              buttonText: "Start Free Trial",
              buttonLink: "#trial",
              secondaryButtonText: "Watch Demo",
              secondaryButtonLink: "#demo",
              backgroundColor: "#1f2937",
              textColor: "#ffffff",
              textAlign: "center",
            },
          },
          // Comprehensive Stats
          {
            id: `social-proof-${Date.now() + 1}`,
            componentId: "social-proof-bar",
            type: "built-in",
            props: {
              type: "stats",
              title: "Trusted by Industry Leaders Worldwide",
              stats: "25,000+|Active Companies\n500M+|Tasks Automated\n99.9%|Uptime SLA\n150+|Countries",
              backgroundColor: "#f9fafb",
              textColor: "#374151",
            },
          },
          // Comprehensive Value Props
          {
            id: `value-prop-${Date.now() + 2}`,
            componentId: "value-prop-grid",
            type: "built-in",
            props: {
              title: "Everything You Need in One Platform",
              subtitle: "Stop juggling multiple tools. Get everything you need to run your business efficiently.",
              valueProps:
                "🔧 Complete Toolkit|CRM, project management, automation, analytics, and communication tools in one platform\n🔗 Seamless Integration|Connect with 500+ apps including Salesforce, Slack, Google Workspace, and more\n📊 Advanced Analytics|Real-time dashboards, custom reports, and AI-powered insights to drive decisions\n🛡️ Enterprise Security|SOC 2 compliance, SSO, advanced permissions, and 99.9% uptime guarantee",
              layout: "2x2",
              backgroundColor: "#ffffff",
            },
          },
          // Detailed Feature Showcase
          {
            id: `feature-showcase-${Date.now() + 3}`,
            componentId: "feature-showcase",
            type: "built-in",
            props: {
              title: "Powerful Features for Every Business Need",
              features:
                "Advanced CRM System|Manage leads, track deals, and nurture relationships with AI-powered insights and automation\nProject Management Suite|Plan, execute, and deliver projects on time with Gantt charts, resource management, and team collaboration\nWorkflow Automation Engine|Automate complex business processes with our visual workflow builder and 500+ integrations\nBusiness Intelligence Dashboard|Make data-driven decisions with real-time analytics, custom reports, and predictive insights\nTeam Collaboration Hub|Streamline communication with integrated chat, video calls, file sharing, and knowledge management\nCustomer Support Platform|Deliver exceptional service with ticketing, live chat, knowledge base, and satisfaction tracking",
              layout: "alternating",
              showImages: true,
              backgroundColor: "#f9fafb",
            },
          },
          // Multiple Testimonials
          {
            id: `testimonial-${Date.now() + 4}`,
            componentId: "testimonial",
            type: "built-in",
            props: {
              quote:
                "We evaluated 15 different solutions over 6 months. This platform was the only one that could handle all our complex requirements. It replaced 8 different tools and saved us $50,000 annually while improving our efficiency by 300%.",
              author: "Robert Chen",
              title: "VP of Operations, Global Manufacturing Inc.",
              style: "card",
              textAlign: "center",
            },
          },
          // Comprehensive CTA
          {
            id: `cta-${Date.now() + 5}`,
            componentId: "cta-section",
            type: "built-in",
            props: {
              style: "risk-reversal",
              title: "Ready to Transform Your Entire Business?",
              subtitle: "Get access to all features with our comprehensive free trial",
              primaryButtonText: "Start 30-Day Free Trial",
              primaryButtonLink: "#trial",
              secondaryButtonText: "Schedule Personal Demo",
              secondaryButtonLink: "#demo",
              riskReversal:
                "30-day free trial • No credit card required • Full feature access • Free migration support • Cancel anytime",
              backgroundColor: "#1f2937",
              textColor: "#ffffff",
            },
          },
          // Detailed Form
          {
            id: `form-${Date.now() + 6}`,
            componentId: "conversion-form",
            type: "built-in",
            props: {
              formType: "trial",
              title: "Start Your Complete Business Transformation",
              subtitle: "Full access to all features • No credit card required • Setup assistance included",
              fields:
                "Full Name|text|required\nWork Email|email|required\nCompany Name|text|required\nPhone Number|tel|\nCompany Size|text|\nPrimary Use Case|textarea|",
              submitText: "Start Free Trial",
              privacyText: "Your information is secure. We provide free setup assistance and migration support.",
              backgroundColor: "#ffffff",
            },
          },
        ]
        break

      case "ab-trust-vs-urgency":
        funnelComponents = [
          // Trust Hero (Version A)
          {
            id: `hero-trust-a-${Date.now()}`,
            componentId: "hero-trust",
            type: "built-in",
            props: {
              title: "Trusted by 50,000+ Businesses Worldwide",
              subtitle: "Join industry leaders who rely on our proven platform to drive results",
              trustIndicators:
                "⭐ 4.9/5 Rating (2,847 reviews)\n🏆 #1 Industry Leader 2024\n🔒 SOC 2 Type II Certified\n📈 99.9% Uptime SLA",
              testimonialQuote: "This platform transformed our business operations completely.",
              testimonialAuthor: "Sarah Johnson, CEO at TechCorp",
              buttonText: "Join Thousands of Happy Customers",
              buttonLink: "#signup-a",
              backgroundColor: "#ffffff",
              textColor: "#1f2937",
            },
          },
          // Divider
          {
            id: `heading-divider-${Date.now() + 1}`,
            componentId: "heading",
            type: "built-in",
            props: {
              text: "--- A/B TEST COMPARISON ---",
              level: "h3",
              color: "#6b7280",
              textAlign: "center",
            },
          },
          // Urgency Hero (Version B)
          {
            id: `hero-urgency-b-${Date.now() + 2}`,
            componentId: "hero-urgency",
            type: "built-in",
            props: {
              urgencyText: "🔥 Limited Time: 50% Off Everything",
              title: "Don't Miss Out - This Deal Expires Soon!",
              subtitle: "Get premium features at half the price. Only 47 spots remaining!",
              countdown: "⏰ Offer expires in 2 days, 14 hours",
              scarcityText: "⚠️ Only 47 spots remaining at this price",
              buttonText: "Claim Your 50% Discount Now",
              buttonLink: "#signup-b",
              backgroundColor: "#dc2626",
              textColor: "#ffffff",
              accentColor: "#fbbf24",
            },
          },
          // A/B Test Analysis
          {
            id: `text-analysis-${Date.now() + 3}`,
            componentId: "text-block",
            type: "built-in",
            props: {
              text: "A/B Test Analysis: Version A (Trust-Based) builds credibility through social proof, ratings, and testimonials. Version B (Urgency-Driven) creates immediate action through scarcity and time pressure. Test which approach converts better for your specific audience and offer type.",
              fontSize: "base",
              color: "#374151",
              textAlign: "left",
            },
          },
        ]
        break

      case "ab-benefit-vs-story":
        funnelComponents = [
          // Benefit Hero (Version A)
          {
            id: `hero-benefit-a-${Date.now()}`,
            componentId: "hero-benefit",
            type: "built-in",
            props: {
              benefit: "Save 15+ Hours Per Week",
              title: "Automate Your Workflow & Reclaim Your Time",
              description: "Join 8,000+ professionals who've eliminated busy work and focus on what matters most.",
              proof: '"I got 18 hours back in my first week!" - Sarah K., Marketing Director',
              buttonText: "Start Saving Time Today",
              buttonLink: "#signup-a",
              backgroundColor: "#059669",
              textColor: "#ffffff",
            },
          },
          // Comparison Text
          {
            id: `text-vs-${Date.now() + 1}`,
            componentId: "text-block",
            type: "built-in",
            props: {
              text: "--- VERSUS ---",
              fontSize: "lg",
              color: "#6b7280",
              textAlign: "center",
            },
          },
          // Story Hero (Version B)
          {
            id: `hero-story-b-${Date.now() + 2}`,
            componentId: "hero-story",
            type: "built-in",
            props: {
              storyHook: "Three years ago, our founder was drowning in spreadsheets, working 80-hour weeks...",
              transformation:
                "Today, we help thousands of entrepreneurs reclaim their time and build the business of their dreams",
              emotionalBenefit: "Stop feeling overwhelmed. Start feeling empowered to focus on what truly matters.",
              callToAction: "Your transformation story starts here",
              buttonText: "Begin Your Journey",
              buttonLink: "#signup-b",
              backgroundColor: "#4f46e5",
              textColor: "#ffffff",
            },
          },
          // Comparison Analysis
          {
            id: `text-analysis-${Date.now() + 3}`,
            componentId: "text-block",
            type: "built-in",
            props: {
              text: "A/B Test Analysis: Version A (Benefit-Focused) appeals to logical decision-making with concrete outcomes and proof. Version B (Story-Driven) connects emotionally through narrative and transformation. Test which resonates more with your target audience's decision-making style.",
              fontSize: "base",
              color: "#374151",
              textAlign: "left",
            },
          },
        ]
        break

      default:
        return
    }

    onChange({
      ...content,
      components: funnelComponents,
    })
  }

  const createExitIntentFunnel = (funnelType: string) => {
    let exitFunnelComponents: ComponentInstance[] = []

    switch (funnelType) {
      case "ecommerce-exit-funnel":
        exitFunnelComponents = [
          // Main page content
          {
            id: `hero-classic-${Date.now()}`,
            componentId: "hero-classic",
            type: "built-in",
            props: {
              title: "Premium Products at Unbeatable Prices",
              subtitle: "Discover our curated collection of high-quality products",
              buttonText: "Shop Now",
              buttonLink: "#shop",
              backgroundColor: "#1f2937",
              textColor: "#ffffff",
            },
          },
          // Exit intent discount offer
          {
            id: `exit-discount-${Date.now() + 1}`,
            componentId: "exit-intent-discount",
            type: "built-in",
            props: {
              enabled: true,
              delay: 3000,
              threshold: 20,
              aggressive: false,
              urgencyText: "🔥 WAIT! Don't Leave Empty-Handed",
              discount: "15% OFF",
              subtitle: "Get 15% off your first order before you go!",
              terms: "Valid for 24 hours. Minimum order $50. One-time use only.",
              cookieExpire: 1,
            },
          },
          // Backup exit intent - free shipping
          {
            id: `exit-freebie-${Date.now() + 2}`,
            componentId: "exit-intent-freebie",
            type: "built-in",
            props: {
              enabled: true,
              delay: 10000,
              threshold: 20,
              title: "Free Shipping Guide",
              subtitle: "Get our complete guide to free shipping worldwide!",
              benefits:
                "Free shipping to 150+ countries\nBest shipping methods revealed\nMoney-saving tips included\nExclusive discount codes",
              cookieExpire: 7,
            },
          },
        ]
        break

      case "saas-exit-funnel":
        exitFunnelComponents = [
          // Main SaaS landing
          {
            id: `hero-classic-${Date.now()}`,
            componentId: "hero-classic",
            type: "built-in",
            props: {
              title: "Streamline Your Workflow Today",
              subtitle: "The all-in-one platform that saves teams 10+ hours per week",
              buttonText: "Start Free Trial",
              buttonLink: "#trial",
              backgroundColor: "#4f46e5",
              textColor: "#ffffff",
            },
          },
          // Exit intent extended trial
          {
            id: `exit-demo-${Date.now() + 1}`,
            componentId: "exit-intent-demo",
            type: "built-in",
            props: {
              enabled: true,
              delay: 5000,
              threshold: 20,
              title: "Quick 5-Minute Demo?",
              subtitle: "See exactly how we can save your team 10+ hours per week",
              demoPoints:
                "Live product walkthrough\nPersonalized use case examples\nROI calculation for your team\nQ&A with product expert",
              cookieExpire: 3,
            },
          },
          // Backup exit intent - newsletter
          {
            id: `exit-newsletter-${Date.now() + 2}`,
            componentId: "exit-intent-newsletter",
            type: "built-in",
            props: {
              enabled: true,
              delay: 15000,
              threshold: 20,
              title: "Stay Updated",
              subtitle: "Get weekly productivity tips and product updates",
              description: "Join 15,000+ professionals who get actionable insights every week",
              cookieExpire: 30,
            },
          },
        ]
        break

      case "leadgen-exit-funnel":
        exitFunnelComponents = [
          // Main lead gen page
          {
            id: `hero-classic-${Date.now()}`,
            componentId: "hero-classic",
            type: "built-in",
            props: {
              title: "Master Digital Marketing in 2024",
              subtitle: "Learn the strategies that top marketers use to drive results",
              buttonText: "Get Free Guide",
              buttonLink: "#guide",
              backgroundColor: "#059669",
              textColor: "#ffffff",
            },
          },
          // Exit intent lead magnet
          {
            id: `exit-freebie-${Date.now() + 1}`,
            componentId: "exit-intent-freebie",
            type: "built-in",
            props: {
              enabled: true,
              delay: 4000,
              threshold: 20,
              title: "Ultimate Marketing Toolkit",
              subtitle: "Don't leave without your free marketing resources!",
              benefits:
                "50+ proven marketing templates\nStep-by-step campaign guides\nROI tracking spreadsheets\nExclusive video tutorials\nBonus: 1-hour strategy session",
              cookieExpire: 7,
            },
          },
          // Exit intent survey for feedback
          {
            id: `exit-survey-${Date.now() + 2}`,
            componentId: "exit-intent-survey",
            type: "built-in",
            props: {
              enabled: true,
              delay: 8000,
              threshold: 20,
              title: "Quick Feedback",
              subtitle: "Help us improve - what are you looking for?",
              options:
                "More advanced strategies\nBeginner-friendly content\nSpecific industry examples\nVideo tutorials\nLive training sessions\nJust browsing today",
              cookieExpire: 14,
            },
          },
        ]
        break

      default:
        return
    }

    onChange({
      ...content,
      components: exitFunnelComponents,
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading builder...</p>
        </div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex">
        <div className="w-80">{renderComponentLibrary()}</div>
        {renderCanvas()}
        {renderPropertyPanel()}
      </div>
    </DragDropContext>
  )
}
