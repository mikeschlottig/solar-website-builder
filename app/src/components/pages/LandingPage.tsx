import { useAuthContext } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Palette, Zap, Globe, Smartphone, Settings } from "lucide-react";

export default function LandingPage() {
  const { login } = useAuthContext();

  const features = [
    {
      icon: <Palette className="h-8 w-8 text-blue-600" />,
      title: "Drag & Drop Builder",
      description: "Create beautiful pages with our intuitive visual editor"
    },
    {
      icon: <Code className="h-8 w-8 text-green-600" />,
      title: "Code Editor",
      description: "Build custom React components with our built-in editor"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Next.js Export",
      description: "Generate production-ready Next.js websites"
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "Multi-Page Sites",
      description: "Create complex websites with unlimited pages"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-red-600" />,
      title: "Responsive Design",
      description: "Every site looks perfect on all devices"
    },
    {
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      title: "SEO Optimized",
      description: "Built-in SEO tools for better search rankings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Build Websites
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Visually
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create stunning, professional websites with our drag-and-drop builder and powerful code editor. 
            Export to Next.js when you're ready to go live.
          </p>
          <Button 
            onClick={login}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Build Amazing Websites
          </h2>
          <p className="text-lg text-gray-600">
            Professional tools that scale from simple landing pages to complex applications
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Building?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of creators building beautiful websites with our platform
          </p>
          <Button 
            onClick={login}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Create Your First Website
          </Button>
        </div>
      </div>
    </div>
  );
}
