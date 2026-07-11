import dimensions from "../media-dimensions.js";

export function webpDimensions(assetPath) {
  return dimensions.webpDimensions(`public${assetPath}`);
}
