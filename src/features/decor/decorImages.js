import DECOR_IMAGES from "./decorImageData.js";

export function getDecorImage(id) {
  return DECOR_IMAGES[id] || null;
}

export function decorImageUrl(image, baseUrl = "/") {
  return `${baseUrl}images/decor/${image.file}`;
}
