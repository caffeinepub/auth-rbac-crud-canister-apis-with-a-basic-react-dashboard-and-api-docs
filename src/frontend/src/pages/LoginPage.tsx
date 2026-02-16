import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, identity, isLoggingIn, isLoginError, loginError } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in with Internet Identity to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoginError && loginError && (
            <Alert variant="destructive">
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full h-12 text-base font-medium" size="lg">
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          <div className="pt-4 text-center text-sm text-muted-foreground">
            <p>Secure authentication powered by the Internet Computer</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
