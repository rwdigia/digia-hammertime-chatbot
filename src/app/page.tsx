import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <form
        action={async () => {
          'use server';
          await signIn('MicrosoftEntraID', { redirectTo: '/chat' });
        }}
      >
        <Button variant="outline" type="submit">
          Sign in
        </Button>
      </form>
    </div>
  );
}
