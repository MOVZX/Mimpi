import { GalleryProvider } from "@/context/GalleryContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <GalleryProvider>{children}</GalleryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
