const ASSET_BASE_URL = process.env.REACT_APP_ASSET_URL || 'http://localhost:8000';

export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${ASSET_BASE_URL}${path}`;
};

export const getProductImageUrl = (path: string | null | undefined): string => {
  if (!path) return 'https://via.placeholder.com/100?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${ASSET_BASE_URL}${path}`;
};