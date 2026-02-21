import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  
  // Map our theme names to sonner's theme options
  const sonnerTheme = theme === "dark" || theme === "highcontrast-dark" ? "dark" : "light";

  return (
    <Sonner
      theme={sonnerTheme}
      position="top-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
      className="toaster group"
      toastOptions={{
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
