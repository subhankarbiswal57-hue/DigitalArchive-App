import { FILE_TYPES } from '../utils/constants';

const DOC_EXT = ['doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'md'];
const IMG_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic'];

export function getExtension(name = '') {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

/** Classify a file as image / pdf / document / other using mime type first, then extension. */
export function detectFileType(name, mime) {
  const ext = getExtension(name);
  if ((mime && mime.startsWith('image/')) || IMG_EXT.includes(ext)) return FILE_TYPES.IMAGE;
  if (mime === 'application/pdf' || ext === 'pdf') return FILE_TYPES.PDF;
  if ((mime && (mime.startsWith('text/') || mime.includes('word') || mime.includes('officedocument'))) || DOC_EXT.includes(ext)) {
    return FILE_TYPES.DOCUMENT;
  }
  return FILE_TYPES.OTHER;
}

/** Builds the metadata object stored in the DB for a successfully copied file. */
export function buildMetadata({ id, asset, destUri, destInfo }) {
  const name = asset.name || 'unnamed';
  const lastModified = asset.lastModified
    ? new Date(asset.lastModified).toISOString()
    : destInfo?.modificationTime
    ? new Date(destInfo.modificationTime * 1000).toISOString()
    : null;

  return {
    id,
    fileName: name,
    originalName: name,
    fileType: detectFileType(name, asset.mimeType),
    mimeType: asset.mimeType || null,
    fileSize: destInfo?.size ?? asset.size ?? null,
    importDate: new Date().toISOString(),
    lastModifiedDate: lastModified,
    fileUri: destUri,
    availabilityStatus: 'available',
  };
}
