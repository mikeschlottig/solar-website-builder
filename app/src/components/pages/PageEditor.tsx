import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Settings, Code, Palette } from "lucide-react";
import { pageServiceGetPage, pageServiceUpdatePageContent } from "@/lib/sdk";
import type { Page } from "@/lib/sdk";
import DragDropBuilder from "../builder/DragDropBuilder";
import PageSettings from "../builder/PageSettings";

export default function PageEditor() {
  const { websiteId, pageId } = useParams<{ websiteId: string; pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentStructure, setContentStructure] = useState<any>({ components: [] });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    if (!pageId) return;
    
    try {
      const response = await pageServiceGetPage({ body: { page_id: pageId } });
      if (response.data) {
        setPage(response.data);
        setContentStructure(response.data.content_structure || { components: [] });
      }
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pageId || saving) return;
    
    setSaving(true);
    try {
      const response = await pageServiceUpdatePageContent({
        body: {
          page_id: pageId,
          content_structure: contentStructure
        }
      });
      
      if (response.data) {
        setPage(response.data);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent: any) => {
    setContentStructure(newContent);
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h1>
          <Button onClick={() => navigate(`/website/${websiteId}`)}>Back to Website</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/website/${websiteId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{page.title}</h1>
                <p className="text-sm text-gray-600">/{page.slug === '/' ? '' : page.slug}</p>
              </div>
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 font-medium">• Unsaved changes</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="h-[calc(100vh-80px)]">
        <Tabs defaultValue="builder" className="h-full">
          <div className="bg-white border-b border-gray-200 px-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Visual Builder
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code View
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder" className="h-full m-0 p-0">
            <DragDropBuilder
              content={contentStructure}
              onChange={handleContentChange}
              websiteId={websiteId!}
            />
          </TabsContent>

          <TabsContent value="code" className="h-full m-0 p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Page Content Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(contentStructure, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 p-4">
            <PageSettings
              page={page}
              websiteId={websiteId!}
              onPageUpdate={setPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
