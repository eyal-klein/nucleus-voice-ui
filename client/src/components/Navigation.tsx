import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  FolderOpen, 
  Activity, 
  Brain, 
  Database, 
  MessageSquare,
  Home
} from "lucide-react";
import { APP_TITLE } from "@/const";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "GCS Browser", href: "/gcs", icon: FolderOpen },
  { name: "Engine 1", href: "/engine1", icon: Activity },
  { name: "Engine 2", href: "/engine2", icon: Brain },
  { name: "Database", href: "/database", icon: Database },
  { name: "Chat", href: "/chat", icon: MessageSquare },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="text-xl font-bold">{APP_TITLE}</a>
            </Link>
            
            <div className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
