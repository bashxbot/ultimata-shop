// Mega cloud storage integration for file uploads
import { Storage } from 'megajs';

let storage: any = null;
let initPromise: Promise<any> | null = null;

export async function initializeMega() {
  try {
    const email = process.env.MEGA_EMAIL;
    const password = process.env.MEGA_PASSWORD;

    if (!email || !password) {
      console.warn('❌ Mega credentials not configured');
      console.warn('Required: MEGA_EMAIL, MEGA_PASSWORD');
      return null;
    }

    console.log('Initializing Mega storage...');
    
    storage = await new Storage({
      email,
      password,
      autoExpand: true,
    }).ready;

    console.log('✓ Mega storage initialized successfully');
    return storage;
  } catch (error) {
    console.error('Failed to initialize Mega:', error);
    return null;
  }
}

async function getStorage(): Promise<any> {
  if (storage) {
    return storage;
  }

  if (!initPromise) {
    initPromise = initializeMega();
  }

  return await initPromise;
}

export async function uploadFileToMega(
  fileName: string,
  fileBuffer: Buffer,
  _mimeType: string = 'application/octet-stream'
): Promise<{ fileId: string; name: string; size: number } | null> {
  try {
    const store = await getStorage();
    if (!store) {
      console.error('❌ Mega storage not available');
      return null;
    }

    console.log(`\n=== Mega File Upload ===`);
    console.log(`File: ${fileName}, Size: ${fileBuffer.length} bytes`);

    // Find the ultimata-shop folder
    let targetFolder = store.root;
    for (const file of Object.values(store.files)) {
      if ((file as any).name === 'ultimata-shop' && (file as any).directory) {
        targetFolder = file;
        console.log('Found ultimata-shop folder');
        break;
      }
    }

    // Upload file to Mega in the target folder
    const file = await store.upload({
      name: fileName,
      size: fileBuffer.length,
      target: targetFolder,
    }, fileBuffer).complete;

    if (!file) {
      console.error('❌ Upload failed - no file object returned');
      return null;
    }

    // Log available properties
    console.log('File properties available:', Object.keys(file).filter((k: any) => !k.startsWith('_')));
    
    // Use downloadId, key, or nodeId for the file reference
    const fileId = (file as any).downloadId || (file as any).key || (file as any).nodeId;
    
    if (!fileId) {
      console.error('❌ Upload failed - no file ID found');
      console.error('File object keys:', Object.keys(file));
      return null;
    }

    console.log(`✓ File uploaded successfully to Mega`);
    console.log(`File ID: ${fileId}`);
    console.log('=== End Upload ===\n');

    return {
      fileId: fileId,
      name: fileName,
      size: fileBuffer.length,
    };
  } catch (error: any) {
    console.error('Error uploading file to Mega:', error.message || error);
    console.error('Full error:', error);
    return null;
  }
}

export async function getFileDownloadLink(fileId: string): Promise<string | null> {
  try {
    // Mega download link format: https://mega.nz/file/{fileId}
    // To get a public link, you can use: https://mega.nz/file/{fileId}#key
    // But since we only have the downloadId, we can construct the basic link
    return `https://mega.nz/file/${fileId}`;
  } catch (error) {
    console.error('Error generating Mega download link:', error);
    return null;
  }
}

export async function deleteFileFromMega(fileId: string): Promise<boolean> {
  try {
    const store = await getStorage();
    if (!store) {
      return false;
    }

    // Find the file in storage by downloadId and delete it
    const files = store.files;
    for (const file of Object.values(files)) {
      const currentFileId = (file as any).downloadId || (file as any).key || (file as any).nodeId;
      if (currentFileId === fileId) {
        await (file as any).delete();
        console.log(`✓ File deleted from Mega: ${fileId}`);
        return true;
      }
    }

    console.error('File not found in Mega storage');
    return false;
  } catch (error) {
    console.error('Error deleting file from Mega:', error);
    return false;
  }
}
