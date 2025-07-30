import { Plus, Globe, Code, Image as ImageIcon, Settings, Eye, Trash2, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { websiteServiceGetUserWebsites, websiteServiceCreateWebsite, websiteServiceDeleteWebsite } from "@/lib/sdk";
import type { Website } from "@/lib/sdk";

export default function Dashboard() {
  const navigate = useNavigate();
  const { userDetails, logout } = useAuthContext();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const response = await websiteServiceGetUserWebsites();
      setWebsites(response.data || []);
    } catch (error) {
      console.error('Failed to load websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebsite = async () => {
    if (!newWebsite.name.trim()) return;
    
    setCreating(true);
    try {
      const response = await websiteServiceCreateWebsite({
        body: {
          name: newWebsite.name,
          description: newWebsite.description || null
        }
      });
      
      if (response.data) {
        setWebsites(prev => [response.data, ...prev]);
        setCreateDialogOpen(false);
        setNewWebsite({ name: "", description: "" });
      }
    } catch (error) {
      console.error('Failed to create website:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return;
    }

    try {
      await websiteServiceDeleteWebsite({
        body: { website_id: websiteId }
      });
      setWebsites(prev => prev.filter(w => w.id !== websiteId));
    } catch (error) {
      console.error('Failed to delete website:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userDetails?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/components')}
                className="flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                Components
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/media')}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Media Library
              </Button>
              <Button
                variant="outline"
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Websites</h2>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Website
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Website</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name">Website Name</Label>
                    <Input
                      id="name"
                      value={newWebsite.name}
                      onChange={(e) => setNewWebsite(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Awesome Website"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newWebsite.description}
                      onChange={(e) => setNewWebsite(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your website"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateWebsite}
                      disabled={!newWebsite.name.trim() || creating}
                      className="flex-1"
                    >
                      {creating ? 'Creating...' : 'Create Website'}
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

          {/* Websites Grid */}
          {websites.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No websites yet</h3>
                <p className="text-gray-600 mb-6">Create your first website to get started</p>
                <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create Your First Website
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <Card key={website.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold truncate">{website.name}</CardTitle>
                        {website.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {website.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Badge variant={website.is_published ? "default" : "secondary"}>
                          {website.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {website.domain || 'No domain set'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/website/${website.id}`);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWebsite(website.id!);
                          }}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
