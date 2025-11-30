import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Activity, Brain, Database, MessageSquare, ArrowRight } from "lucide-react";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";

const BACKEND_URL = "https://nucleus-atlas-backend-v2-xeihvetbja-ew.a.run.app";

export default function Home() {
  const [stats, setStats] = useState({
    subjects: 0,
    scans: 0,
    completed: 0,
    processing: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subjectsRes, scansRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/subjects`),
          fetch(`${BACKEND_URL}/api/scans`)
        ]);

        const subjectsData = await subjectsRes.json();
        const scansData = await scansRes.json();

        const subjects = Array.isArray(subjectsData) ? subjectsData : [];
        const scans = Array.isArray(scansData) ? scansData : [];

        setStats({
          subjects: subjects.length,
          scans: scans.length,
          completed: subjects.filter((s: any) => s.processing_status === 'completed').length,
          processing: subjects.filter((s: any) => s.processing_status === 'processing').length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "GCS Browser",
      description: "Browse DICOM and NIFTI files in cloud storage",
      icon: FolderOpen,
      href: "/gcs",
      color: "text-blue-500"
    },
    {
      title: "Engine 1 Monitor",
      description: "Track DICOM to NIFTI conversion jobs",
      icon: Activity,
      href: "/engine1",
      color: "text-green-500"
    },
    {
      title: "Engine 2 Monitor",
      description: "Monitor DTI and fMRI processing",
      icon: Brain,
      href: "/engine2",
      color: "text-purple-500"
    },
    {
      title: "Database Viewer",
      description: "View and manage all database tables",
      icon: Database,
      href: "/database",
      color: "text-orange-500"
    },
    {
      title: "NUCLEUS Chat",
      description: "Chat with the autonomous orchestrator",
      icon: MessageSquare,
      href: "/chat",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">{APP_TITLE}</h1>
          <p className="text-xl text-muted-foreground">
            Medical Imaging Pipeline Monitoring Dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.subjects}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.scans}</div>
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
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
