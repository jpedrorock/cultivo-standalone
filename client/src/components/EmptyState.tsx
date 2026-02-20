import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="p-8 md:p-12 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
