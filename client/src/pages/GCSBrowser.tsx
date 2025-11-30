import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, FileText, Download, RefreshCw, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";

const BACKEND_URL = "https://nucleus-atlas-backend-v2-xeihvetbja-ew.a.run.app";

interface GCSFile {
  name: string;
  path: string;
  size: number;
  updated: string;
  is_directory: boolean;
}

export default function GCSBrowser() {
  const [dicomFiles, setDicomFiles] = useState<GCSFile[]>([]);
  const [niftiFiles, setNiftiFiles] = useState<GCSFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dicomPrefix, setDicomPrefix] = useState("");
  const [niftiPrefix, setNiftiPrefix] = useState("");

  const fetchFiles = async (bucket: string, prefix: string, setter: (files: GCSFile[]) => void) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/gcs/list?bucket=${bucket}&prefix=${prefix}&max_results=100`
      );
      const data = await response.json();
      setter(data.files || []);
    } catch (error) {
      console.error(`Failed to fetch files from ${bucket}:`, error);
    }
  };

  const fetchDicomFiles = () => {
    setLoading(true);
    fetchFiles("nucleus-atlas-raw-prod", dicomPrefix, setDicomFiles).finally(() => setLoading(false));
  };

  const fetchNiftiFiles = () => {
    setLoading(true);
    fetchFiles("nucleus-atlas-processed-prod", niftiPrefix, setNiftiFiles).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDicomFiles();
    fetchNiftiFiles();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFolderClick = (path: string, bucket: "dicom" | "nifti") => {
    if (bucket === "dicom") {
      setDicomPrefix(path);
      fetchFiles("nucleus-atlas-raw-prod", path, setDicomFiles);
    } else {
      setNiftiPrefix(path);
      fetchFiles("nucleus-atlas-processed-prod", path, setNiftiFiles);
    }
  };

  const handleBackClick = (bucket: "dicom" | "nifti") => {
    const prefix = bucket === "dicom" ? dicomPrefix : niftiPrefix;
    const parts = prefix.split("/").filter(Boolean);
    parts.pop();
    const newPrefix = parts.length > 0 ? parts.join("/") + "/" : "";
    
    if (bucket === "dicom") {
      setDicomPrefix(newPrefix);
      fetchFiles("nucleus-atlas-raw-prod", newPrefix, setDicomFiles);
    } else {
      setNiftiPrefix(newPrefix);
      fetchFiles("nucleus-atlas-processed-prod", newPrefix, setNiftiFiles);
    }
  };

  const renderFileList = (files: GCSFile[], bucket: "dicom" | "nifti") => {
    const prefix = bucket === "dicom" ? dicomPrefix : niftiPrefix;
    
    return (
      <div className="space-y-1">
        {prefix && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBackClick(bucket)}
            className="mb-2"
          >
            ← Back
          </Button>
        )}
        
        {files.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No files found</p>
          </div>
        )}
        
        {files.map((file, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 border rounded-lg ${
              file.is_directory ? "hover:bg-accent cursor-pointer" : ""
            }`}
            onClick={() => file.is_directory && handleFolderClick(file.path, bucket)}
          >
            <div className="flex items-center gap-3">
              {file.is_directory ? (
                <Folder className="w-5 h-5 text-blue-500" />
              ) : (
                <FileText className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <div className="font-medium">{file.name}</div>
                {!file.is_directory && (
                  <div className="text-sm text-muted-foreground">
                    {formatSize(file.size)} • {new Date(file.updated).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            {file.is_directory && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">GCS Browser</h1>
          <p className="text-muted-foreground">
            Browse DICOM and NIFTI files in Google Cloud Storage
          </p>
        </div>

        <Tabs defaultValue="dicom" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dicom">DICOM (Raw)</TabsTrigger>
            <TabsTrigger value="nifti">NIFTI (Processed)</TabsTrigger>
          </TabsList>

          <TabsContent value="dicom" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>nucleus-atlas-raw-prod</CardTitle>
                    <CardDescription>
                      Raw DICOM files • Current path: /{dicomPrefix || "root"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchDicomFiles} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderFileList(dicomFiles, "dicom")}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nifti" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>nucleus-atlas-processed-prod</CardTitle>
                    <CardDescription>
                      Processed NIFTI files • Current path: /{niftiPrefix || "root"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchNiftiFiles} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderFileList(niftiFiles, "nifti")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
