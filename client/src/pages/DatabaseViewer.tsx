import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Database } from "lucide-react";
import Navigation from "@/components/Navigation";

const BACKEND_URL = "https://nucleus-atlas-backend-v2-xeihvetbja-ew.a.run.app";

export default function DatabaseViewer() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [dtiMetrics, setDtiMetrics] = useState<any[]>([]);
  const [fmriNetworks, setFmriNetworks] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [subjectsRes, scansRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/subjects`),
        fetch(`${BACKEND_URL}/api/scans`)
      ]);

      const subjectsData = await subjectsRes.json();
      const scansData = await scansRes.json();

      setSubjects(subjectsData || []);
      setScans(scansData || []);
      
      // TODO: Add endpoints for DTI metrics, fMRI networks, and decisions
      setDtiMetrics([]);
      setFmriNetworks([]);
      setDecisions([]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Database Viewer</h1>
            <p className="text-muted-foreground">
              View all tables in PostgreSQL database
            </p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subjects ({subjects.length})</TabsTrigger>
            <TabsTrigger value="scans">Scans ({scans.length})</TabsTrigger>
            <TabsTrigger value="dti">DTI Metrics ({dtiMetrics.length})</TabsTrigger>
            <TabsTrigger value="fmri">fMRI Networks ({fmriNetworks.length})</TabsTrigger>
            <TabsTrigger value="decisions">Decisions ({decisions.length})</TabsTrigger>
          </TabsList>

          {/* Subjects Table */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>metadata.subjects</CardTitle>
                <CardDescription>All registered subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject ID</TableHead>
                        <TableHead>Clinical Group</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Sex</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.subject_id}>
                          <TableCell className="font-medium">{subject.subject_id}</TableCell>
                          <TableCell>{subject.clinical_group}</TableCell>
                          <TableCell>{subject.age}</TableCell>
                          <TableCell>{subject.sex}</TableCell>
                          <TableCell>{subject.processing_status}</TableCell>
                          <TableCell>{new Date(subject.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {subjects.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No subjects found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scans Table */}
          <TabsContent value="scans">
            <Card>
              <CardHeader>
                <CardTitle>metadata.scans</CardTitle>
                <CardDescription>All MRI scans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject ID</TableHead>
                        <TableHead>Modality</TableHead>
                        <TableHead>Scan Date</TableHead>
                        <TableHead>NIFTI Path</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scans.map((scan, idx) => (
                        <TableRow key={`${scan.subject_id}-${scan.modality}-${idx}`}>
                          <TableCell className="font-medium">{scan.subject_id}</TableCell>
                          <TableCell>{scan.modality}</TableCell>
                          <TableCell>{scan.scan_date ? new Date(scan.scan_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{scan.nifti_path || 'N/A'}</TableCell>
                          <TableCell>{scan.processing_status}</TableCell>
                          <TableCell>{scan.updated_at ? new Date(scan.updated_at).toLocaleString() : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {scans.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      No scans found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DTI Metrics Table */}
          <TabsContent value="dti">
            <Card>
              <CardHeader>
                <CardTitle>results.dti_metrics</CardTitle>
                <CardDescription>DTI analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>DTI metrics endpoint not yet implemented</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* fMRI Networks Table */}
          <TabsContent value="fmri">
            <Card>
              <CardHeader>
                <CardTitle>results.fmri_networks</CardTitle>
                <CardDescription>fMRI connectivity results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>fMRI networks endpoint not yet implemented</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decisions Table */}
          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>results.explainability_ledger</CardTitle>
                <CardDescription>AI decision logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Decisions endpoint not yet implemented</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
