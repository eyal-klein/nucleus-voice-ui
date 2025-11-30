import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle, XCircle, Clock, Brain, Activity } from "lucide-react";
import Navigation from "@/components/Navigation";

const BACKEND_URL = "https://nucleus-atlas-backend-v2-xeihvetbja-ew.a.run.app";

export default function Engine2Monitor() {
  const [dtiJobs, setDtiJobs] = useState<any[]>([]);
  const [fmriJobs, setFmriJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch scans from backend
      const response = await fetch(`${BACKEND_URL}/api/scans`);
      const data = await response.json();
      
      const scans = Array.isArray(data) ? data : [];
      
      // Filter DTI and fMRI scans
      const dti = scans.filter((s: any) => s.modality === 'DTI');
      const fmri = scans.filter((s: any) => s.modality === 'fMRI');
      
      setDtiJobs(dti);
      setFmriJobs(fmri);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    if (status?.includes('completed') || status?.includes('engine2')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status?.includes('failed')) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (status?.includes('queued') || status?.includes('processing')) {
      return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
    }
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status?.includes('completed') || status?.includes('engine2')) {
      return <Badge variant="default">{status}</Badge>;
    }
    if (status?.includes('failed')) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    if (status?.includes('queued') || status?.includes('processing')) {
      return <Badge variant="secondary">{status}</Badge>;
    }
    return <Badge variant="outline">{status || 'pending'}</Badge>;
  };

  const renderJobsList = (jobs: any[], type: string) => (
    <div className="space-y-2">
      {jobs.slice(0, 20).map((job) => (
        <div
          key={`${job.subject_id}-${job.modality}`}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-4">
            {getStatusIcon(job.processing_status)}
            <div>
              <div className="font-medium">{job.subject_id}</div>
              <div className="text-sm text-muted-foreground">
                {type} • {job.scan_date ? new Date(job.scan_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {job.updated_at ? new Date(job.updated_at).toLocaleString() : 'N/A'}
            </div>
            {getStatusBadge(job.processing_status)}
          </div>
        </div>
      ))}
      
      {jobs.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          No {type} jobs found
        </div>
      )}
      
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
          Loading jobs...
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Engine 2 Monitor</h1>
            <p className="text-muted-foreground">
              DTI tractography and fMRI connectivity analysis
            </p>
          </div>
          <Button onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Brain className="w-4 h-4" />
                DTI Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dtiJobs.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {dtiJobs.filter(j => j.processing_status?.includes('engine2')).length} completed
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                fMRI Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{fmriJobs.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {fmriJobs.filter(j => j.processing_status?.includes('engine2')).length} completed
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Tabs */}
        <Tabs defaultValue="dti" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dti">DTI (Engine 2a)</TabsTrigger>
            <TabsTrigger value="fmri">fMRI (Engine 2b)</TabsTrigger>
          </TabsList>

          <TabsContent value="dti">
            <Card>
              <CardHeader>
                <CardTitle>DTI Processing Jobs</CardTitle>
                <CardDescription>Diffusion tensor imaging tractography</CardDescription>
              </CardHeader>
              <CardContent>
                {renderJobsList(dtiJobs, 'DTI')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fmri">
            <Card>
              <CardHeader>
                <CardTitle>fMRI Processing Jobs</CardTitle>
                <CardDescription>Functional connectivity analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {renderJobsList(fmriJobs, 'fMRI')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
