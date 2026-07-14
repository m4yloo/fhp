import { Logo } from "@/components/Logo";
import { AuthPanel } from "@/components/AuthPanel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

type AuthGateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onAuthenticated?: () => void;
};

export function AuthGateDialog({
  open,
  onOpenChange,
  title,
  description,
  onAuthenticated,
}: AuthGateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/70 bg-card p-0 overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <div className="relative p-6 md:p-7">
          <div className="relative z-10">
            <div className="flex items-center gap-3 py-1 mb-5">
              <div className="relative">
                <Logo size={38} className="relative shrink-0" />
              </div>
              <div className="text-left leading-none">
                <div className="font-extrabold text-base tracking-tight text-foreground">
                  FHP
                </div>
                <div className="text-[9px] font-mono text-muted-foreground mt-0.5">Herné Poklady</div>
              </div>
            </div>

            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>

            <AuthPanel embedded onAuthenticated={onAuthenticated} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
