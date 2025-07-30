import { ArrowLeft, Save, Play, Code, TriangleAlert, CircleCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { 
  componentServiceUpdateComponent,
  componentServiceValidateComponentCode
} from "@/lib/sdk";
import type { Component } from "@/lib/sdk";

interface CodeEditorProps {
  component: Component;
  onSave: (component: Component) => void;
  onCancel: () => void;
}

export default function CodeEditor({ component, onSave, onCancel }: CodeEditorProps) {
  const [name, setName] = useState(component.name || "");
  const [description, setDescription] = useState(component.description || "");
  const [category, setCategory] = useState(component.category || "custom");
  const [code, setCode] = useState(component.code || "");
  const [styles, setStyles] = useState(component.styles || "");
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const categories = [
    { value: "layout", label: "Layout" },
    { value: "content", label: "Content" },
    { value: "media", label: "Media" },
    { value: "form", label: "Form" },
    { value: "custom", label: "Custom" }
  ];

  useEffect(() => {
    const hasChanges = 
      name !== component.name ||
      description !== component.description ||
      category !== component.category ||
      code !== component.code ||
      styles !== component.styles;
    
    setHasUnsavedChanges(hasChanges);
  }, [name, description, category, code, styles, component]);

  const handleValidate = async () => {
    if (!code.trim()) {
      setValidation({
        valid: false,
        errors: ['Code cannot be empty'],
        warnings: []
      });
      return;
    }

    setValidating(true);
    try {
      const response = await componentServiceValidateComponentCode({
        body: { code }
      });
      
      if (response.data) {
        setValidation(response.data);
      }
    } catch (error) {
      console.error('Failed to validate code:', error);
      setValidation({
        valid: false,
        errors: ['Validation failed'],
        warnings: []
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!component.id) return;
    
    setSaving(true);
    try {
      const response = await componentServiceUpdateComponent({
        body: {
          component_id: component.id,
          name: name || null,
          description: description || null,
          code: code || null,
          styles: styles || null
        }
      });
      
      if (response.data) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Failed to save component:', error);
    } finally {
      setSaving(false);
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      'basic': `function MyComponent({ title = "Hello World", description = "" }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}

export default MyComponent;`,
      'card': `function CardComponent({ title = "Card Title", content = "Card content goes here", imageUrl = "" }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
}

export default CardComponent;`,
      'button': `function CustomButton({ text = "Click me", variant = "primary", size = "md", onClick }) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700"
  };
  
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button 
      className={\`\${variants[variant]} \${sizes[size]} rounded font-medium transition-colors\`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default CustomButton;`
    };
    
    setCode(templates[template as keyof typeof templates] || templates.basic);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Code Editor</h1>
                <p className="text-gray-600">Edit {component.name}</p>
              </div>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-amber-600">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={validating || !code.trim()}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {validating ? 'Validating...' : 'Validate'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Component Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="component-name">Name</Label>
                  <Input
                    id="component-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="MyAwesomeComponent"
                  />
                </div>
                
                <div>
                  <Label htmlFor="component-category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="component-description">Description</Label>
                  <Textarea
                    id="component-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this component does"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate('basic')}
                  className="w-full justify-start"
                >
                  Basic Component
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate('card')}
                  className="w-full justify-start"
                >
                  Card Component
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate('button')}
                  className="w-full justify-start"
                >
                  Custom Button
                </Button>
              </CardContent>
            </Card>

            {/* Validation Results */}
            {validation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validation.valid ? (
                      <CircleCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <TriangleAlert className="h-4 w-4 text-red-600" />
                    )}
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {validation.errors && validation.errors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2">Errors:</h4>
                      {validation.errors.map((error: string, index: number) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription className="text-sm">{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  {validation.warnings && validation.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-600 mb-2">Warnings:</h4>
                      {validation.warnings.map((warning: string, index: number) => (
                        <Alert key={index}>
                          <TriangleAlert className="h-4 w-4" />
                          <AlertDescription className="text-sm">{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  {validation.valid && validation.errors.length === 0 && validation.warnings.length === 0 && (
                    <Alert>
                      <CircleCheck className="h-4 w-4" />
                      <AlertDescription className="text-sm text-green-600">
                        Code validation passed!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  React Component Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your React component code here..."
                    className="font-mono text-sm min-h-[400px] bg-gray-900 text-green-400 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Write a React functional component. Use props for customizable properties.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Styles (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={styles}
                  onChange={(e) => setStyles(e.target.value)}
                  placeholder="/* Custom CSS styles for your component */
.my-component {
  /* Your styles here */
}"
                  className="font-mono text-sm min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Add custom CSS styles that will be applied to your component.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
