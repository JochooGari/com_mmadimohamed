 

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  progress?: number;
  error?: string;
  output?: any;
  agent?: {
    name: string;
    provider: string;
    model: string;
  };
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  onStepClick?: (stepId: string, index: number) => void;
  onPauseResume?: (stepId: string) => void;
  showDetails?: boolean;
  className?: string;
}

const stepStatusIcons = {
  pending: <Clock className="w-4 h-4 text-gray-400" />,
  running: <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  paused: <Pause className="w-4 h-4 text-orange-500" />
};

const stepStatusColors = {
  pending: 'border-gray-200 bg-gray-50',
  running: 'border-blue-200 bg-blue-50 shadow-md',
  completed: 'border-green-200 bg-green-50',
  failed: 'border-red-200 bg-red-50',
  paused: 'border-orange-200 bg-orange-50'
};

export function WorkflowTimeline({
  steps,
  currentStepIndex,
  onStepClick,
  onPauseResume,
  showDetails = false,
  className
}: WorkflowTimelineProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const handleScrollLeft = () => {
    const timeline = document.querySelector('.workflow-timeline-container');
    if (timeline) {
      timeline.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    const timeline = document.querySelector('.workflow-timeline-container');
    if (timeline) {
      timeline.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={cn("workflow-timeline-wrapper relative", className)}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Progression du Workflow</h3>
          <p className="text-sm text-muted-foreground">
            Étape {currentStepIndex + 1} sur {steps.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {steps.length > 5 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleScrollLeft}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleScrollRight}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="workflow-timeline-container overflow-x-auto pb-4">
        <div className="workflow-timeline flex items-start gap-4 min-w-max p-4">
          {steps.map((step, index) => (
            <div key={step.id} className="timeline-step flex items-center">
              {/* Step Card */}
              <Card
                className={cn(
                  "step-card cursor-pointer transition-all duration-300 min-w-[200px] max-w-[280px]",
                  stepStatusColors[step.status],
                  currentStepIndex === index && "ring-2 ring-blue-500",
                  onStepClick && "hover:shadow-lg"
                )}
                onClick={() => onStepClick?.(step.id, index)}
              >
                <CardContent className="p-4">
                  {/* Step Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {stepStatusIcons[step.status]}
                      <span className="text-sm font-medium">
                        Étape {index + 1}
                      </span>
                    </div>
                    <Badge
                      variant={step.status === 'running' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {step.status}
                    </Badge>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm line-clamp-2">
                      {step.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>

                    {/* Agent Info */}
                    {step.agent && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">{step.agent.name}</span>
                        <br />
                        <span>{step.agent.provider}/{step.agent.model}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {step.status === 'running' && step.progress !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Timing Info */}
                    <div className="text-xs text-muted-foreground">
                      {step.duration && (
                        <span>⏱️ {formatDuration(step.duration)}</span>
                      )}
                      {step.startTime && !step.endTime && (
                        <span>🕐 Démarré à {step.startTime.toLocaleTimeString()}</span>
                      )}
                      {step.endTime && (
                        <span>✅ Terminé à {step.endTime.toLocaleTimeString()}</span>
                      )}
                    </div>

                    {/* Controls */}
                    {step.status === 'running' && onPauseResume && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPauseResume(step.id);
                        }}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    )}

                    {step.status === 'paused' && onPauseResume && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPauseResume(step.id);
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Reprendre
                      </Button>
                    )}

                    {/* Error Display */}
                    {step.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {step.error}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Connector */}
              {index < steps.length - 1 && (
                <div className="timeline-connector flex items-center mx-2">
                  <div
                    className={cn(
                      "h-0.5 w-8 transition-colors duration-300",
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full border-2 transition-colors duration-300",
                      index < currentStepIndex
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-300"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        {Object.entries(
          steps.reduce((acc, step) => {
            acc[step.status] = (acc[step.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([status, count]) => (
          <div key={status} className="flex items-center gap-1">
            {stepStatusIcons[status as keyof typeof stepStatusIcons]}
            <span className="capitalize">{status}:</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkflowTimeline;