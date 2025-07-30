import { ArrowLeft, Upload, Search, FolderPlus, Trash2, Image as ImageIcon, File, Video, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { 
  mediaServiceGetUserMedia,
  mediaServiceUploadMedia,
  mediaServiceDeleteMediaAsset,
  mediaServiceOrganizeMedia
} from "@/lib/sdk";
import type { MediaAsset } from "@/lib/sdk";

export default function MediaLibrary() {
  const navigate = useNavigate();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMediaAssets();
  }, [filterType, currentFolder]);

  const loadMediaAssets = async () => {
    try {
      const mimeTypeFilter = filterType === "all" ? null : filterType;
      const response = await mediaServiceGetUserMedia({
        body: {
          folder: currentFolder,
          mime_type_filter: mimeTypeFilter
        }
      });
      
      if (response.data) {
        setMediaAssets(response.data);
      }
    } catch (error) {
      console.error('Failed to load media assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const response = await mediaServiceUploadMedia({
          body: {
            file,
            name: file.name,
            folder: currentFolder
          }
        });
        return response.data;
      });

      const uploadedAssets = await Promise.all(uploadPromises);
      const validAssets = uploadedAssets.filter((asset): asset is MediaAsset => asset !== undefined);
      
      setMediaAssets(prev => [...validAssets, ...prev]);
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    
    try {
      await mediaServiceDeleteMediaAsset({ body: { asset_id: assetId } });
      setMediaAssets(prev => prev.filter(asset => asset.id !== assetId));
      setSelectedAssets(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleBulkMove = async (targetFolder: string | null) => {
    if (selectedAssets.size === 0) return;
    
    try {
      const assetIds = Array.from(selectedAssets);
      await mediaServiceOrganizeMedia({
        body: {
          asset_ids: assetIds,
          target_folder: targetFolder
        }
      });
      
      // Reload assets to reflect changes
      loadMediaAssets();
      setSelectedAssets(new Set());
    } catch (error) {
      console.error('Failed to organize media:', error);
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (mimeType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAssets = mediaAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.alt_text && asset.alt_text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const uniqueFolders = Array.from(new Set(mediaAssets.map(asset => asset.folder).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media library...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                <p className="text-gray-600">Manage your images, videos, and documents</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedAssets.size > 0 && (
                <Select onValueChange={handleBulkMove}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={`Move ${selectedAssets.size} items to...`} />
                  </SelectTrigger>
                  <SelectContent>
                                        {uniqueFolders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Media Files</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="file-upload">Select Files</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: Images, Videos, PDFs, Documents
                      </p>
                    </div>
                    {uploading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading files...</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="application">Documents</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currentFolder || ""} onValueChange={(value) => setCurrentFolder(value || null)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All folders" />
              </SelectTrigger>
              <SelectContent>
                                {uniqueFolders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredAssets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {mediaAssets.length === 0 ? 'No media files yet' : 'No files match your search'}
              </h3>
              <p className="text-gray-600 mb-6">
                {mediaAssets.length === 0 
                  ? 'Upload your first media files to get started'
                  : 'Try adjusting your search or filters'}
              </p>
              {mediaAssets.length === 0 && (
                <Button onClick={() => setUploadDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                  <Upload className="h-4 w-4" />
                  Upload Your First Files
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => (
              <Card 
                key={asset.id} 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  selectedAssets.has(asset.id!) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => toggleAssetSelection(asset.id!)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {asset.mime_type.startsWith('image/') ? (
                      <img 
                        src={asset.file_path} 
                        alt={asset.alt_text || asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(asset.mime_type)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm truncate" title={asset.name}>
                      {asset.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(asset.file_size)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id!);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {asset.folder && (
                      <Badge variant="outline" className="text-xs">
                        {asset.folder}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
