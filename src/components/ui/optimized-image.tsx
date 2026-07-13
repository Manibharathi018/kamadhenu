import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallbackSrc?: string;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt = "",
      className,
      containerClassName,
      loading = "eager",
      decoding = "sync",
      fallbackSrc,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);
    const localRef = useRef<HTMLImageElement | null>(null);

    // Combine forwarded ref and local ref
    const setRefs = React.useCallback(
      (node: HTMLImageElement | null) => {
        localRef.current = node;
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [ref]
    );

    useEffect(() => {
      setHasError(false);
    }, [src]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (onLoad) onLoad(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      if (onError) onError(event);
    };

    const displaySrc = hasError && fallbackSrc ? fallbackSrc : src;

    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        {hasError && !fallbackSrc ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground text-xs p-2 text-center">
            Failed to load
          </div>
        ) : displaySrc ? (
          <img
            ref={setRefs}
            src={displaySrc}
            alt={alt}
            loading={loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            className={cn("w-full h-full", className)}
            {...props}
          />
        ) : null}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
