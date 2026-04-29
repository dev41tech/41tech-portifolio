import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Public Pages
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Team from "@/pages/Team";
import CaseDetail from "@/pages/CaseDetail";
import AboutUs from "@/pages/AboutUs";

// Admin Pages
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminTeam from "@/pages/admin/Team";
import AdminCases from "@/pages/admin/Cases";
import AdminTechnologies from "@/pages/admin/Technologies";
import AdminSettings from "@/pages/admin/Settings";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401/403
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin-41tech/login" component={AdminLogin} />
      
      <Route path="/admin-41tech/settings">
        <AdminLayout><AdminSettings /></AdminLayout>
      </Route>
      <Route path="/admin-41tech/dashboard">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin-41tech/projects">
        <AdminLayout><AdminProjects /></AdminLayout>
      </Route>
      <Route path="/admin-41tech/team">
        <AdminLayout><AdminTeam /></AdminLayout>
      </Route>
      <Route path="/admin-41tech/cases">
        <AdminLayout><AdminCases /></AdminLayout>
      </Route>
      <Route path="/admin-41tech/technologies">
        <AdminLayout><AdminTechnologies /></AdminLayout>
      </Route>

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/projetos">
        <PublicLayout><Projects /></PublicLayout>
      </Route>
      <Route path="/projetos/:slug">
        <PublicLayout><ProjectDetail /></PublicLayout>
      </Route>
      <Route path="/equipe">
        <PublicLayout><Team /></PublicLayout>
      </Route>
      <Route path="/sobre-nos">
        <PublicLayout><AboutUs /></PublicLayout>
      </Route>
      <Route path="/cases/:slug">
        <PublicLayout><CaseDetail /></PublicLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
