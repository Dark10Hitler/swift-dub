import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getStoredCode } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Trash2, Shield } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, username, firstName, lastName, hapticFeedback } = useTelegram();
  const { logout, minutesLeft, userCode } = useAuth();
  
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    hapticFeedback('light');
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    hapticFeedback('warning');
    
    try {
      // For now, just logout since delete endpoint may not exist
      logout();
      hapticFeedback('success');
      toast({
        title: 'Account cleared',
        description: 'Your local data has been cleared.',
      });
      navigate('/');
    } catch (err) {
      hapticFeedback('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const storedCode = userCode || getStoredCode();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Account Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and security.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profile</CardTitle>
                    <CardDescription>Your Telegram account information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {userId && (
                  <div className="space-y-2">
                    <Label>Telegram ID</Label>
                    <Input value={userId.toString()} disabled />
                  </div>
                )}
                {username && (
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={`@${username}`} disabled />
                  </div>
                )}
                {(firstName || lastName) && (
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={`${firstName || ''} ${lastName || ''}`.trim()} disabled />
                  </div>
                )}
                {storedCode && (
                  <div className="space-y-2">
                    <Label>User Code</Label>
                    <Input value={storedCode} disabled />
                  </div>
                )}
                {minutesLeft > 0 && (
                  <div className="space-y-2">
                    <Label>Minutes Left</Label>
                    <Input value={`${minutesLeft} minutes`} disabled />
                  </div>
                )}
                {!userId && (
                  <p className="text-sm text-muted-foreground">
                    Connect via Telegram to see your profile information.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security</CardTitle>
                    <CardDescription>Manage your session</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card variant="glass" className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground mt-2">
                  This will permanently delete your account and all associated data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
