// Google Drive integration for file uploads using OAuth 2.0
import { google } from 'googleapis';
import { Readable } from 'stream';

let driveClient: any = null;

export async function initializeGoogleDrive() {
  try {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      console.warn('Google Drive OAuth credentials not configured');
      console.warn('Required: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN');
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    driveClient = google.drive({ 
      version: 'v3', 
      auth: oauth2Client 
    });

    console.log('Google Drive OAuth initialized successfully');
    return driveClient;
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error);
    return null;
  }
}

export async function uploadFileToDrive(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string = 'application/octet-stream'
): Promise<{ fileId: string; name: string; size: number } | null> {
  try {
    if (!driveClient) {
      await initializeGoogleDrive();
    }

    if (!driveClient) {
      console.error('Google Drive client not available');
      return null;
    }

    console.log(`Starting upload: ${fileName} (${fileBuffer.length} bytes)`);

    const response = await driveClient.files.create({
      requestBody: {
        name: fileName,
      },
      media: {
        mimeType: mimeType,
        body: Readable.from([fileBuffer]),
      },
      fields: 'id, name, size',
    });

    console.log(`File uploaded successfully: ${response.data.id}`);
    
    return {
      fileId: response.data.id,
      name: response.data.name,
      size: response.data.size || fileBuffer.length,
    };
  } catch (error: any) {
    console.error('Error uploading file to Google Drive:', error.message || error);
    if (error.response?.data) {
      console.error('Google Drive error details:', error.response.data);
    }
    return null;
  }
}

export async function getFileDownloadLink(fileId: string): Promise<string | null> {
  try {
    if (!driveClient) {
      await initializeGoogleDrive();
    }

    if (!driveClient) {
      console.error('Google Drive client not available');
      return null;
    }

    // Return download link using export parameter for direct download
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  } catch (error) {
    console.error('Error getting download link:', error);
    return null;
  }
}

export async function deleteFileFromDrive(fileId: string): Promise<boolean> {
  try {
    if (!driveClient) {
      await initializeGoogleDrive();
    }

    if (!driveClient) {
      console.error('Google Drive client not available');
      return false;
    }

    await driveClient.files.delete({
      fileId: fileId,
    });

    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return false;
  }
}
