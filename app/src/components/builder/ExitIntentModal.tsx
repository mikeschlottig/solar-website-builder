"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Gift, Clock, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExitIntentModalProps {
  isOpen: boolean
  onClose: () => void
  type: "discount" | "freebie" | "newsletter" | "demo" | "survey" | "social"
  config: Record<string, any>
}

export default function ExitIntentModal({ isOpen, onClose, type, config }: ExitIntentModalProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail("")
      setIsSubmitting(false)
      setIsSubmitted(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)

    // Auto-close after success
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const renderDiscountModal = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-red-50 relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <div className="mb-2">
          <Badge variant="destructive" className="animate-pulse">
            {config.urgencyText || "WAIT! Don't Leave Yet"}
          </Badge>
        </div>
        <CardTitle className="text-2xl text-red-600">{config.discount || "20% OFF"}</CardTitle>
        <p className="text-sm text-gray-600">{config.subtitle || "Get an exclusive discount before you go!"}</p>
      </CardHeader>
      <CardContent className="pt-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for the discount"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : `Claim ${config.discount || "20% OFF"}`}
            </Button>
            <p className="text-xs text-center text-gray-500">
              {config.terms || "Valid for 24 hours. One-time use only."}
            </p>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">
              <Gift className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold text-green-600">Discount Sent!</h3>
            <p className="text-sm text-gray-600">Check your email for the discount code</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderFreebieModal = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-blue-50 relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <div className="mb-2">
          <Download className="h-8 w-8 mx-auto text-blue-600" />
        </div>
        <CardTitle className="text-xl text-blue-600">{config.title || "Free Resource"}</CardTitle>
        <p className="text-sm text-gray-600">{config.subtitle || "Download our exclusive guide before you leave!"}</p>
      </CardHeader>
      <CardContent className="pt-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {(
                  config.benefits || [
                    "Comprehensive guide (PDF)",
                    "Actionable tips and strategies",
                    "Bonus templates included",
                  ]
                ).map((benefit: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for instant download"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Download Free Guide"}
            </Button>
            <p className="text-xs text-center text-gray-500">No spam. Unsubscribe anytime.</p>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">
              <Download className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold text-green-600">Download Sent!</h3>
            <p className="text-sm text-gray-600">Check your email for the download link</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderNewsletterModal = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-purple-50 relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <div className="mb-2">
          <Mail className="h-8 w-8 mx-auto text-purple-600" />
        </div>
        <CardTitle className="text-xl text-purple-600">{config.title || "Stay Connected"}</CardTitle>
        <p className="text-sm text-gray-600">
          {config.subtitle || "Get weekly tips and insights delivered to your inbox"}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {config.description || "Join 10,000+ subscribers who get actionable insights every week"}
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe Now"}
            </Button>
            <p className="text-xs text-center text-gray-500">Weekly insights. No spam. Unsubscribe anytime.</p>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">
              <Mail className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold text-green-600">Welcome Aboard!</h3>
            <p className="text-sm text-gray-600">You'll receive your first newsletter soon</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderDemoModal = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-green-50 relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <div className="mb-2">
          <Clock className="h-8 w-8 mx-auto text-green-600" />
        </div>
        <CardTitle className="text-xl text-green-600">{config.title || "Quick Demo?"}</CardTitle>
        <p className="text-sm text-gray-600">{config.subtitle || "See how it works in just 5 minutes"}</p>
      </CardHeader>
      <CardContent className="pt-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What you'll see:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {(
                  config.demoPoints || [
                    "Live product walkthrough",
                    "Key features demonstration",
                    "Q&A with product expert",
                  ]
                ).map((point: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule 5-Min Demo"}
            </Button>
            <p className="text-xs text-center text-gray-500">No commitment required. Cancel anytime.</p>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">
              <Clock className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="font-semibold text-green-600">Demo Scheduled!</h3>
            <p className="text-sm text-gray-600">Check your email for calendar invite</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderSurveyModal = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-yellow-50 relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl text-yellow-600">{config.title || "Quick Question"}</CardTitle>
        <p className="text-sm text-gray-600">{config.subtitle || "Help us improve - what made you want to leave?"}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {(
            config.options || [
              "Too expensive",
              "Not what I was looking for",
              "Need to think about it",
              "Found a better alternative",
              "Just browsing",
            ]
          ).map((option: string, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left bg-transparent"
              onClick={() => {
                // Handle survey response
                console.log("Survey response:", option)
                onClose()
              }}
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="ghost" className="w-full text-gray-500" onClick={onClose}>
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSocialModal = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center bg-indigo-50 relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl text-indigo-600">{config.title || "Follow Us"}</CardTitle>
        <p className="text-sm text-gray-600">{config.subtitle || "Stay updated with our latest content and offers"}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open(config.facebookUrl || "#", "_blank")}
          >
            Follow on Facebook
          </Button>
          <Button
            className="w-full bg-blue-400 hover:bg-blue-500"
            onClick={() => window.open(config.twitterUrl || "#", "_blank")}
          >
            Follow on Twitter
          </Button>
          <Button
            className="w-full bg-blue-700 hover:bg-blue-800"
            onClick={() => window.open(config.linkedinUrl || "#", "_blank")}
          >
            Follow on LinkedIn
          </Button>
          <Button
            className="w-full bg-pink-600 hover:bg-pink-700"
            onClick={() => window.open(config.instagramUrl || "#", "_blank")}
          >
            Follow on Instagram
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="ghost" className="w-full text-gray-500" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderModalContent = () => {
    switch (type) {
      case "discount":
        return renderDiscountModal()
      case "freebie":
        return renderFreebieModal()
      case "newsletter":
        return renderNewsletterModal()
      case "demo":
        return renderDemoModal()
      case "survey":
        return renderSurveyModal()
      case "social":
        return renderSocialModal()
      default:
        return renderDiscountModal()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="animate-in slide-in-from-top-4 duration-300">{renderModalContent()}</div>
    </div>
  )
}
