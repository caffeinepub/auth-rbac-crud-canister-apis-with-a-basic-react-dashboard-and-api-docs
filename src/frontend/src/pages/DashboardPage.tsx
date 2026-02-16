import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import TasksPanel from '../features/tasks/TasksPanel';
import TasksInsights from '../features/tasks/TasksInsights';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage your tasks and account</p>
        </div>

        {userProfile && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg font-semibold">{userProfile.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <CardTitle>Role</CardTitle>
                  <CardDescription>Your access level</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Role</p>
                    <p className="text-lg font-semibold capitalize">{userProfile.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <TasksInsights />

        <TasksPanel />
      </div>

      {showProfileSetup && <ProfileSetupModal onComplete={() => setShowProfileSetup(false)} />}
    </>
  );
}
