import DECOR_IMAGES from "./decorImageData.js";
import DECOR_THUMBNAILS from "./decorThumbnails.json" with { type: "json" };

export function getDecorImage(id) {
  return DECOR_IMAGES[id] || null;
}

export function decorImageUrl(image, baseUrl = "/") {
  return `${baseUrl}images/decor/${image.file}`;
}

export function getDecorThumbnail(image, baseUrl = "/") {
  const dimensions = DECOR_THUMBNAILS[image.file];
  if (!dimensions) return null;
  const filename = image.file.replace(/\.png$/, ".webp");
  return { src: `${baseUrl}images/decor/thumbnails/${filename}`, ...dimensions };
}
