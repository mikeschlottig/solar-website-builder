import { ArrowLeft, Plus, Eye, Globe, Settings, Trash2, FileText, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  websiteServiceGetWebsite, 
  websiteServiceUpdateWebsite,
  pageServiceGetWebsitePages,
  pageServiceCreatePage,
  pageServiceDeletePage
} from "@/lib/sdk";
import type { Website, Page } from "@/lib/sdk";

export default function WebsiteEditor() {
  const { websiteId } = useParams<{ websiteId: string }>();
  const navigate = useNavigate();
  const [website, setWebsite] = useState<Website | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPageDialogOpen, setCreatePageDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "", metaDescription: "" });
  const [websiteSettings, setWebsiteSettings] = useState({ name: "", description: "", domain: "" });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (websiteId) {
      loadWebsiteData();
    }
  }, [websiteId]);

  const loadWebsiteData = async () => {
    if (!websiteId) return;
    
    try {
      const [websiteResponse, pagesResponse] = await Promise.all([
        websiteServiceGetWebsite({ body: { website_id: websiteId } }),
        pageServiceGetWebsitePages({ body: { website_id: websiteId } })
      ]);
      
      if (websiteResponse.data) {
        setWebsite(websiteResponse.data);
        setWebsiteSettings({
          name: websiteResponse.data.name || "",
          description: websiteResponse.data.description || "",
          domain: websiteResponse.data.domain || ""
        });
      }
      
      if (pagesResponse.data) {
        setPages(pagesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load website data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!websiteId || !newPage.title.trim() || !newPage.slug.trim()) return;
    
    setCreating(true);
    try {
      const response = await pageServiceCreatePage({
        body: {
          website_id: websiteId,
          title: newPage.title,
          slug: newPage.slug,
          meta_description: newPage.metaDescription || null
        }
      });
      
      if (response.data) {
        setPages(prev => [...prev, response.data]);
        setCreatePageDialogOpen(false);
        setNewPage({ title: "", slug: "", metaDescription: "" });
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateWebsite = async () => {
    if (!websiteId) return;
    
    setSaving(true);
    try {
      const response = await websiteServiceUpdateWebsite({
        body: {
          website_id: websiteId,
          name: websiteSettings.name || null,
          description: websiteSettings.description || null,
          domain: websiteSettings.domain || null
        }
      });
      
      if (response.data) {
        setWebsite(response.data);
        setSettingsDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update website:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await pageServiceDeletePage({ body: { page_id: pageId } });
      setPages(prev => prev.filter(p => p.id !== pageId));
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setNewPage(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Website not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
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
                <h1 className="text-2xl font-bold text-gray-900">{website.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={website.is_published ? "default" : "secondary"}>
                    {website.is_published ? "Published" : "Draft"}
                  </Badge>
                  {website.domain && (
                    <span className="text-sm text-gray-600">• {website.domain}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Website Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="website-name">Website Name</Label>
                      <Input
                        id="website-name"
                        value={websiteSettings.name}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website-description">Description</Label>
                      <Textarea
                        id="website-description"
                        value={websiteSettings.description}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website-domain">Domain</Label>
                      <Input
                        id="website-domain"
                        value={websiteSettings.domain}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, domain: e.target.value }))}
                        placeholder="example.com"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleUpdateWebsite}
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSettingsDialogOpen(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Website Pages</h2>
              <Dialog open={createPageDialogOpen} onOpenChange={setCreatePageDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Page
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Page</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="page-title">Page Title</Label>
                      <Input
                        id="page-title"
                        value={newPage.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="About Us"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-slug">URL Slug</Label>
                      <Input
                        id="page-slug"
                        value={newPage.slug}
                        onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="about-us"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be the URL path for your page
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="page-meta">Meta Description (Optional)</Label>
                      <Textarea
                        id="page-meta"
                        value={newPage.metaDescription}
                        onChange={(e) => setNewPage(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Brief description for search engines"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreatePage}
                        disabled={!newPage.title.trim() || !newPage.slug.trim() || creating}
                        className="flex-1"
                      >
                        {creating ? 'Creating...' : 'Create Page'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCreatePageDialogOpen(false)}
                        disabled={creating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {pages.map((page) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{page.title}</CardTitle>
                          {page.is_home_page && (
                            <Badge variant="secondary">Home</Badge>
                          )}
                          <Badge variant={page.is_published ? "default" : "secondary"}>
                            {page.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          /{page.slug === '/' ? '' : page.slug}
                          {page.meta_description && (
                            <span className="ml-2 text-gray-500">• {page.meta_description}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/website/${websiteId}/page/${page.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        {!page.is_home_page && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePage(page.id!)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle>Design Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Theme and design customization coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your website for search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">SEO configuration coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
