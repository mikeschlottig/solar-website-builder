import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Globe, Eye } from "lucide-react";
import { 
  pageServiceUpdatePageMetadata,
  pageServicePublishPage
} from "@/lib/sdk";
import type { Page } from "@/lib/sdk";

interface PageSettingsProps {
  page: Page;
  websiteId: string;
  onPageUpdate: (page: Page) => void;
}

export default function PageSettings({ page, websiteId, onPageUpdate }: PageSettingsProps) {
  const [title, setTitle] = useState(page.title || "");
  const [slug, setSlug] = useState(page.slug || "");
  const [metaDescription, setMetaDescription] = useState(page.meta_description || "");
  const [metaKeywords, setMetaKeywords] = useState(page.meta_keywords || "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const hasUnsavedChanges = 
    title !== page.title ||
    slug !== page.slug ||
    metaDescription !== page.meta_description ||
    metaKeywords !== page.meta_keywords;

  const handleSaveMetadata = async () => {
    if (!page.id) return;
    
    setSaving(true);
    try {
      const response = await pageServiceUpdatePageMetadata({
        body: {
          page_id: page.id,
          title: title || null,
          slug: slug || null,
          meta_description: metaDescription || null,
          meta_keywords: metaKeywords || null
        }
      });
      
      if (response.data) {
        onPageUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to save page metadata:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page.id) return;
    
    setPublishing(true);
    try {
      const response = await pageServicePublishPage({
        body: { page_id: page.id }
      });
      
      if (response.data) {
        onPageUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to publish page:', error);
    } finally {
      setPublishing(false);
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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug from title if slug is empty
    if (!slug || slug === generateSlug(page.title || "")) {
      setSlug(generateSlug(newTitle));
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Page Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Page Information</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={page.is_published ? "default" : "secondary"}>
                {page.is_published ? "Published" : "Draft"}
              </Badge>
              {page.is_home_page && (
                <Badge variant="outline">Home Page</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="page-title">Page Title</Label>
            <Input
              id="page-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter page title"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This appears in the browser tab and search results
            </p>
          </div>
          
          <div>
            <Label htmlFor="page-slug">URL Slug</Label>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 bg-gray-50 px-3 py-2 border border-r-0 rounded-l-md">
                /
              </span>
              <Input
                id="page-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="page-url"
                className="rounded-l-none"
                disabled={page.is_home_page}
              />
            </div>
            {page.is_home_page ? (
              <p className="text-xs text-gray-500 mt-1">
                Home page URL cannot be changed
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                This will be the URL path for your page
              </p>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSaveMetadata}
              disabled={!hasUnsavedChanges || saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {!page.is_published && (
              <Button
                variant="outline"
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {publishing ? 'Publishing...' : 'Publish Page'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief description of the page content for search engines"
              className="mt-1"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 150-160 characters. This appears in search results.
            </p>
          </div>
          
          <div>
            <Label htmlFor="meta-keywords">Meta Keywords</Label>
            <Input
              id="meta-keywords"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated keywords related to this page
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Page Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Page Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span>{new Date(page.created_at!).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Modified:</span>
              <span>{new Date(page.updated_at!).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Components:</span>
              <span>{page.content_structure?.components?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant={page.is_published ? "default" : "secondary"}>
                {page.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Page Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Page
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              View Live Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
