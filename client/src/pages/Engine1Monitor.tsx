import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, Clock, Activity } from "lucide-react";
import Navigation from "@/components/Navigation";

const BACKEND_URL = "https://nucleus-atlas-backend-v2-xeihvetbja-ew.a.run.app";

export default function Engine1Monitor() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, processing: 0 });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch subjects from backend
      const response = await fetch(`${BACKEND_URL}/api/subjects`);
      const data = await response.json();
      
      const subjects = Array.isArray(data) ? data : [];
      setJobs(subjects);
      
      // Calculate stats
      const completed = subjects.filter((s: any) => s.processing_status === 'completed').length;
      const failed = subjects.filter((s: any) => s.processing_status === 'failed').length;
      const processing = subjects.filter((s: any) => s.processing_status === 'processing').length;
      
      setStats({
        total: subjects.length,
        completed,
        failed,
        processing
      });
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
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Engine 1 Monitor</h1>
            <p className="text-muted-foreground">
              DICOM → NIFTI conversion and QC
            </p>
          </div>
          <Button onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.processing}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest Engine 1 processing jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.slice(0, 20).map((job) => (
                <div
                  key={job.subject_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(job.processing_status)}
                    <div>
                      <div className="font-medium">{job.subject_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.clinical_group} • Age {job.age} • {job.sex}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </div>
                    {getStatusBadge(job.processing_status)}
                  </div>
                </div>
              ))}
              
              {jobs.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  No jobs found
                </div>
              )}
              
              {loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                  Loading jobs...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
