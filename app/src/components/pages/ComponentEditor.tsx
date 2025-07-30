import { ArrowLeft, Plus, Code, Trash2, Eye, Upload, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  componentServiceGetUserComponents,
  componentServiceGetBuiltInComponents,
  componentServiceCreateCustomComponent,
  componentServiceDeleteComponent
} from "@/lib/sdk";
import type { Component } from "@/lib/sdk";
import CodeEditor from "../builder/CodeEditor";

export default function ComponentEditor() {
  const navigate = useNavigate();
  const [userComponents, setUserComponents] = useState<Component[]>([]);
  const [builtInComponents, setBuiltInComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [newComponent, setNewComponent] = useState({
    name: "",
    description: "",
    category: "custom",
    code: `function MyComponent({ text = "Hello World" }) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{text}</h2>
    </div>
  );
}

export default MyComponent;`
  });
  const [creating, setCreating] = useState(false);

  const categories = [
    { value: "layout", label: "Layout" },
    { value: "content", label: "Content" },
    { value: "media", label: "Media" },
    { value: "form", label: "Form" },
    { value: "custom", label: "Custom" }
  ];

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const [userResponse, builtInResponse] = await Promise.all([
        componentServiceGetUserComponents({ body: {} }),
        componentServiceGetBuiltInComponents()
      ]);
      
      if (userResponse.data) {
        setUserComponents(userResponse.data);
      }
      
      if (builtInResponse.data) {
        setBuiltInComponents(builtInResponse.data);
      }
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComponent = async () => {
    if (!newComponent.name.trim() || !newComponent.code.trim()) return;
    
    setCreating(true);
    try {
      const response = await componentServiceCreateCustomComponent({
        body: {
          name: newComponent.name,
          description: newComponent.description || null,
          category: newComponent.category,
          code: newComponent.code
        }
      });
      
      if (response.data) {
        setUserComponents(prev => [response.data, ...prev]);
        setCreateDialogOpen(false);
        setNewComponent({
          name: "",
          description: "",
          category: "custom",
          code: `function MyComponent({ text = "Hello World" }) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{text}</h2>
    </div>
  );
}

export default MyComponent;`
        });
      }
    } catch (error) {
      console.error('Failed to create component:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return;
    
    try {
      await componentServiceDeleteComponent({ body: { component_id: componentId } });
      setUserComponents(prev => prev.filter(c => c.id !== componentId));
    } catch (error) {
      console.error('Failed to delete component:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  if (editingComponent) {
    return (
      <CodeEditor
        component={editingComponent}
        onSave={(updatedComponent) => {
          setUserComponents(prev => prev.map(c => c.id === updatedComponent.id ? updatedComponent : c));
          setEditingComponent(null);
        }}
        onCancel={() => setEditingComponent(null)}
      />
    );
  }

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
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Component Library</h1>
                <p className="text-gray-600">Manage and create custom React components</p>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Component
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Create Custom Component</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="component-name">Component Name</Label>
                      <Input
                        id="component-name"
                        value={newComponent.name}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="MyAwesomeComponent"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="component-category">Category</Label>
                      <Select
                        value={newComponent.category}
                        onValueChange={(value) => setNewComponent(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1">
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
                  </div>
                  <div>
                    <Label htmlFor="component-description">Description</Label>
                    <Textarea
                      id="component-description"
                      value={newComponent.description}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what this component does"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Component Code</Label>
                    <div className="mt-1 border rounded-lg overflow-hidden">
                      <textarea
                        value={newComponent.code}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none"
                        placeholder="Enter your React component code here..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateComponent}
                      disabled={!newComponent.name.trim() || !newComponent.code.trim() || creating}
                      className="flex-1"
                    >
                      {creating ? 'Creating...' : 'Create Component'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="user" className="space-y-6">
          <TabsList>
            <TabsTrigger value="user">My Components ({userComponents.length})</TabsTrigger>
            <TabsTrigger value="builtin">Built-in Components ({builtInComponents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4">
            {userComponents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No custom components yet</h3>
                  <p className="text-gray-600 mb-6">Create your first custom React component</p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Create Your First Component
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userComponents.map((component) => (
                  <Card key={component.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold truncate">{component.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{component.category}</Badge>
                            <Badge variant="secondary">{component.version}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {component.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {component.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingComponent(component)}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteComponent(component.id!)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="builtin" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builtInComponents.map((component) => (
                <Card key={component.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold truncate">{component.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{component.category}</Badge>
                          <Badge>Built-in</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {component.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {component.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Code className="h-3 w-3" />
                        View Props
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
