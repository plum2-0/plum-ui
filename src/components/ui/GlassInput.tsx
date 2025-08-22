"use client";

import {
  forwardRef,
  TextareaHTMLAttributes,
  InputHTMLAttributes,
  useEffect,
  useRef,
} from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { glassStyles, GlassVariant } from "@/lib/styles/glassMorphism";
import { liquidGradients } from "@/lib/styles/gradients";

interface BaseGlassInputProps {
  variant?: GlassVariant;
  shimmer?: boolean;
  autoResize?: boolean;
  className?: string;
}

type GlassTextareaProps = BaseGlassInputProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    keyof HTMLMotionProps<"textarea">
  > & {
    type?: "textarea";
  };

type GlassInputFieldProps = BaseGlassInputProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof HTMLMotionProps<"input">
  > & {
    type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
  };

export type GlassInputProps = GlassTextareaProps | GlassInputFieldProps;

export const GlassInput = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  GlassInputProps
>(
  (
    {
      variant = "ultra",
      shimmer = false,
      autoResize = true,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    const combinedRef = (ref || internalRef) as any;

    const baseStyles = glassStyles[variant];

    const inputStyles = {
      ...baseStyles,
      color: "rgba(255, 255, 255, 0.85)",
      borderRadius: "16px",
      transition: "all 0.3s ease",
    };

    const focusStyles = {
      background: liquidGradients.glassMedium,
      boxShadow:
        "inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(168, 85, 247, 0.2), 0 0 20px rgba(168, 85, 247, 0.15)",
      borderColor: "rgba(168, 85, 247, 0.3)",
    };

    // Auto-resize logic for textarea
    useEffect(() => {
      if (type === "textarea" && autoResize && combinedRef.current) {
        const textarea = combinedRef.current as HTMLTextAreaElement;
        const handleResize = () => {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        };

        textarea.addEventListener("input", handleResize);
        handleResize(); // Initial resize

        return () => textarea.removeEventListener("input", handleResize);
      }
    }, [type, autoResize, combinedRef]);

    const commonProps = {
      ref: combinedRef,
      className: cn(
        "w-full px-4 py-3 font-body text-sm resize-none focus:outline-none transition-all",
        className
      ),
      style: inputStyles,
      whileFocus: focusStyles,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    };

    if (type === "textarea") {
      const textareaProps = props as GlassTextareaProps;
      return (
        <div className="relative">
          <motion.textarea
            {...commonProps}
            {...textareaProps}
            rows={2}
            style={{
              ...inputStyles,
              minHeight: "80px",
              maxHeight: "300px",
              ...textareaProps.style,
            }}
          />
          {shimmer && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: liquidGradients.shimmer,
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          )}
        </div>
      );
    }

    const inputProps = props as GlassInputFieldProps;
    return (
      <div className="relative">
        <motion.input {...commonProps} {...inputProps} type={type} />
        {shimmer && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: liquidGradients.shimmer,
              }}
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
