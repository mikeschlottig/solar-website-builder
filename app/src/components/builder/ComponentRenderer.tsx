"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Component } from "@/lib/sdk"
import { Fragment } from "react"
import type { JSX } from "react/jsx-runtime"
import { useExitIntent } from "@/hooks/use-exit-intent"
import ExitIntentModal from "./ExitIntentModal"

interface ComponentRendererProps {
  component: Component
  props: Record<string, any>
}

export default function ComponentRenderer({ component, props }: ComponentRendererProps) {
  const [showExitModal, setShowExitModal] = useState(false)

  // Exit intent hook for exit intent components
  useExitIntent({
    threshold: props.threshold || 20,
    delay: props.delay || 3000,
    cookieExpire: props.cookieExpire || 1,
    aggressive: props.aggressive || false,
    onExitIntent: () => {
      if (props.enabled !== false && component.category === "Exit Intent") {
        setShowExitModal(true)
      }
    },
  })

  // Common style classes
  const heroAlignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  }

  if (component.component_type === "built-in") {
    switch (component.name) {
      // Exit Intent Components
      case "Exit Intent - Discount Offer":
      case "exit-intent-discount":
        return (
          <>
            <div className="p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
              <div className="text-center">
                <h3 className="font-semibold text-orange-800 mb-2">Exit Intent: Discount Offer</h3>
                <p className="text-sm text-orange-600 mb-2">
                  Triggers when users try to leave: {props.discount || "20% OFF"}
                </p>
                <p className="text-xs text-orange-500">
                  Delay: {props.delay || 3000}ms | Threshold: {props.threshold || 20}px
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowExitModal(true)}>
                  Preview Modal
                </Button>
              </div>
            </div>
            <ExitIntentModal
              isOpen={showExitModal}
              onClose={() => setShowExitModal(false)}
              type="discount"
              config={{
                urgencyText: props.urgencyText,
                discount: props.discount,
                subtitle: props.subtitle,
                terms: props.terms,
              }}
            />
          </>
        )

      case "Exit Intent - Free Resource":
      case "exit-intent-freebie":
        return (
          <>
            <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <div className="text-center">
                <h3 className="font-semibold text-blue-800 mb-2">Exit Intent: Free Resource</h3>
                <p className="text-sm text-blue-600 mb-2">
                  Triggers when users try to leave: {props.title || "Free Resource"}
                </p>
                <p className="text-xs text-blue-500">
                  Delay: {props.delay || 5000}ms | Cookie: {props.cookieExpire || 7} days
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowExitModal(true)}>
                  Preview Modal
                </Button>
              </div>
            </div>
            <ExitIntentModal
              isOpen={showExitModal}
              onClose={() => setShowExitModal(false)}
              type="freebie"
              config={{
                title: props.title,
                subtitle: props.subtitle,
                benefits: props.benefits?.split("\n") || [],
              }}
            />
          </>
        )

      case "Exit Intent - Newsletter Signup":
      case "exit-intent-newsletter":
        return (
          <>
            <div className="p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
              <div className="text-center">
                <h3 className="font-semibold text-purple-800 mb-2">Exit Intent: Newsletter</h3>
                <p className="text-sm text-purple-600 mb-2">
                  Triggers when users try to leave: {props.title || "Stay Connected"}
                </p>
                <p className="text-xs text-purple-500">
                  Delay: {props.delay || 10000}ms | Cookie: {props.cookieExpire || 30} days
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowExitModal(true)}>
                  Preview Modal
                </Button>
              </div>
            </div>
            <ExitIntentModal
              isOpen={showExitModal}
              onClose={() => setShowExitModal(false)}
              type="newsletter"
              config={{
                title: props.title,
                subtitle: props.subtitle,
                description: props.description,
              }}
            />
          </>
        )

      case "Exit Intent - Demo Request":
      case "exit-intent-demo":
        return (
          <>
            <div className="p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
              <div className="text-center">
                <h3 className="font-semibold text-green-800 mb-2">Exit Intent: Demo Request</h3>
                <p className="text-sm text-green-600 mb-2">
                  Triggers when users try to leave: {props.title || "Quick Demo?"}
                </p>
                <p className="text-xs text-green-500">
                  Delay: {props.delay || 7000}ms | Cookie: {props.cookieExpire || 3} days
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowExitModal(true)}>
                  Preview Modal
                </Button>
              </div>
            </div>
            <ExitIntentModal
              isOpen={showExitModal}
              onClose={() => setShowExitModal(false)}
              type="demo"
              config={{
                title: props.title,
                subtitle: props.subtitle,
                demoPoints: props.demoPoints?.split("\n") || [],
              }}
            />
          </>
        )

      case "Exit Intent - Feedback Survey":
      case "exit-intent-survey":
        return (
          <>
            <div className="p-4 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
              <div className="text-center">
                <h3 className="font-semibold text-yellow-800 mb-2">Exit Intent: Survey</h3>
                <p className="text-sm text-yellow-600 mb-2">
                  Triggers when users try to leave: {props.title || "Quick Question"}
                </p>
                <p className="text-xs text-yellow-500">
                  Delay: {props.delay || 2000}ms | Cookie: {props.cookieExpire || 7} days
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowExitModal(true)}>
                  Preview Modal
                </Button>
              </div>
            </div>
            <ExitIntentModal
              isOpen={showExitModal}
              onClose={() => setShowExitModal(false)}
              type="survey"
              config={{
                title: props.title,
                subtitle: props.subtitle,
                options: props.options?.split("\n") || [],
              }}
            />
          </>
        )

      case "Exit Intent - Social Follow":
      case "exit-intent-social":
        return (
          <>
            <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50">
              <div className="text-center">
                <h3 className="font-semibold text-indigo-800 mb-2">Exit Intent: Social Follow</h3>
                <p className="text-sm text-indigo-600 mb-2">
                  Triggers when users try to leave: {props.title || "Follow Us"}
                </p>
                <p className="text-xs text-indigo-500">
                  Delay: {props.delay || 15000}ms | Cookie: {props.cookieExpire || 14} days
                </p>
                <Button size="sm" className="mt-2" onClick={() => setShowExitModal(true)}>
                  Preview Modal
                </Button>
              </div>
            </div>
            <ExitIntentModal
              isOpen={showExitModal}
              onClose={() => setShowExitModal(false)}
              type="social"
              config={{
                title: props.title,
                subtitle: props.subtitle,
                facebookUrl: props.facebookUrl,
                twitterUrl: props.twitterUrl,
                linkedinUrl: props.linkedinUrl,
                instagramUrl: props.instagramUrl,
              }}
            />
          </>
        )

      // Exit Intent Funnel Templates
      case "Exit Intent - E-commerce Funnel":
      case "exit-intent-ecommerce-funnel":
        return (
          <div className="p-6 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
            <div className="text-center">
              <h3 className="font-bold text-red-800 mb-3">Exit Intent: E-commerce Funnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Primary Offer</h4>
                  <p className="text-xs text-gray-600">{props.primaryOffer || "discount"}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Discount</h4>
                  <p className="text-xs text-gray-600">{props.discountAmount || "15%"}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Minimum Order</h4>
                  <p className="text-xs text-gray-600">{props.minimumOrder || "$50"}</p>
                </div>
              </div>
              <p className="text-sm text-red-600 mb-2">
                Complete funnel: Cart abandonment → Discount offer → Social proof → Urgency
              </p>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setShowExitModal(true)}>
                Preview Funnel
              </Button>
            </div>
          </div>
        )

      case "Exit Intent - SaaS Funnel":
      case "exit-intent-saas-funnel":
        return (
          <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
            <div className="text-center">
              <h3 className="font-bold text-blue-800 mb-3">Exit Intent: SaaS Funnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Primary Offer</h4>
                  <p className="text-xs text-gray-600">{props.primaryOffer || "extended-trial"}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Trial Extension</h4>
                  <p className="text-xs text-gray-600">{props.trialExtension || "30 days"}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Demo Length</h4>
                  <p className="text-xs text-gray-600">{props.demoLength || "15 minutes"}</p>
                </div>
              </div>
              <p className="text-sm text-blue-600 mb-2">
                Complete funnel: Trial expiry → Extended trial → Demo booking → Risk reversal
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowExitModal(true)}>
                Preview Funnel
              </Button>
            </div>
          </div>
        )

      case "Exit Intent - Lead Generation Funnel":
      case "exit-intent-lead-gen-funnel":
        return (
          <div className="p-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
            <div className="text-center">
              <h3 className="font-bold text-green-800 mb-3">Exit Intent: Lead Generation Funnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Lead Magnet</h4>
                  <p className="text-xs text-gray-600">{props.primaryOffer || "ebook"}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-sm mb-1">Social Proof</h4>
                  <p className="text-xs text-gray-600">{props.socialProof || "Downloaded by 5,000+"}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded border mb-4">
                <h4 className="font-medium text-sm mb-2">Lead Magnet Title</h4>
                <p className="text-xs text-gray-600">{props.leadMagnetTitle || "Ultimate Guide to [Your Topic]"}</p>
              </div>
              <p className="text-sm text-green-600 mb-2">
                Complete funnel: Exit intent → Lead magnet → Benefits → Social proof → Email capture
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowExitModal(true)}>
                Preview Funnel
              </Button>
            </div>
          </div>
        )

      // Hero Sections (keeping existing ones)
      case "Hero Section - Classic":
      case "hero-classic":
        return (
          <section
            className={`py-20 px-6 ${heroAlignClasses[props.textAlign as keyof typeof heroAlignClasses] || "text-center"}`}
            style={{
              backgroundColor: props.backgroundColor || "#1f2937",
              backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: props.textColor || "#ffffff",
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{props.title || "Transform Your Business Today"}</h1>
              {props.subtitle && <p className="text-xl md:text-2xl mb-8 opacity-90">{props.subtitle}</p>}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {props.buttonText && (
                  <Button size="lg" asChild>
                    <a href={props.buttonLink || "#"}>{props.buttonText}</a>
                  </Button>
                )}
                {props.secondaryButtonText && (
                  <Button size="lg" variant="outline" asChild>
                    <a href={props.secondaryButtonLink || "#"}>{props.secondaryButtonText}</a>
                  </Button>
                )}
              </div>
            </div>
          </section>
        )

      // Basic Components
      case "Text Block":
        return (
          <div
            className={`${textSizeClasses[props.fontSize as keyof typeof textSizeClasses] || "text-base"} ${heroAlignClasses[props.textAlign as keyof typeof heroAlignClasses] || "text-left"}`}
            style={{ color: props.color || "#000000" }}
          >
            {props.text || "Your text here"}
          </div>
        )

      case "Heading":
        const HeadingTag = (props.level || "h2") as keyof JSX.IntrinsicElements

        return (
          <Fragment>
            <HeadingTag
              className={`font-bold ${heroAlignClasses[props.textAlign as keyof typeof heroAlignClasses] || "text-left"}`}
              style={{ color: props.color || "#000000" }}
            >
              {props.text || "Your heading here"}
            </HeadingTag>
          </Fragment>
        )

      default:
        return (
          <div className="p-4 border border-gray-300 rounded bg-gray-50">
            <p className="text-sm text-gray-600">Unknown component: {component.name}</p>
          </div>
        )
    }
  }

  // Handle custom components
  if (component.component_type === "custom" && component.code) {
    try {
      return (
        <div className="p-4 border border-blue-300 rounded bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-600 font-medium">{component.name}</p>
          </div>
          <p className="text-xs text-blue-500 mb-1">Custom Component</p>
          {component.description && <p className="text-xs text-gray-600">{component.description}</p>}
          <div className="mt-2 p-2 bg-white rounded text-xs font-mono text-gray-500">
            {component.code.slice(0, 50)}...
          </div>
        </div>
      )
    } catch (error) {
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <p className="text-sm text-red-600">Error rendering component: {component.name}</p>
          <p className="text-xs text-red-500 mt-1">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      )
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded bg-gray-50">
      <p className="text-sm text-gray-600">Component type not supported</p>
      <p className="text-xs text-gray-500 mt-1">Type: {component.component_type}</p>
    </div>
  )
}
