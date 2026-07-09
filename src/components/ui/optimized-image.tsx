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
      loading = "lazy",
      decoding = "async",
      fallbackSrc,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
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

    // Check if image is already cached/loaded on mount or src change
    useEffect(() => {
      if (localRef.current && localRef.current.complete) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
      setHasError(false);
    }, [src]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true);
      if (onLoad) {
        onLoad(event);
      }
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      if (onError) {
        onError(event);
      }
    };

    const displaySrc = hasError && fallbackSrc ? fallbackSrc : src;

    return (
      <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
        {/* Shimmer Placeholder */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 animate-pulse bg-primary/5 dark:bg-primary/10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" 
                 style={{
                   animation: 'shimmer 1.5s infinite',
                   backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)'
                 }}
            />
          </div>
        )}

        {/* Fallback Placeholder (when image fails to load) */}
        {hasError && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground text-xs p-2 text-center">
            Failed to load image
          </div>
        )}

        {/* Actual Image */}
        {displaySrc && (
          <img
            ref={setRefs}
            src={displaySrc}
            alt={alt}
            loading={loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-all duration-500 ease-in-out",
              isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm",
              className
            )}
            {...props}
          />
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
