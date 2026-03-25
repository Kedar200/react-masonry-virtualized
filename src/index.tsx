export { MasonryGrid } from "./MasonryGrid";
export type { MasonryGridProps, MasonryGridRef } from "./MasonryGrid";

// Helper function for loading image dimensions
export async function getImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}
