import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface HeaderProps {
  onSignOut: () => void;
  isSigningOut: boolean;
  userName: string;
}

export function Header({ onSignOut, isSigningOut, userName }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-primary">Gym Hustle</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{userName}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Sign out
        </Button>
      </div>
    </header>
  );
} 