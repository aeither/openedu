import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProtocolBadgeProps {
  name: string;
  className?: string;
}

const ProtocolBadge: React.FC<ProtocolBadgeProps> = ({ name, className }) => {
  return (
    <Badge variant="outline" className={cn("inline-flex items-center gap-1.5 bg-secondary/50 text-foreground", className)}>
      <span className="w-2 h-2 rounded-full bg-primary"></span>
      {name}
    </Badge>
  );
};

export default ProtocolBadge;
