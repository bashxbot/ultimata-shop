// MediaFire integration for file uploads
import FormData from 'form-data';

let authToken: string | null = null;
let tokenExpiry: number = 0;

export async function initializeMediaFire() {
  try {
    const email = process.env.MEDIAFIRE_EMAIL;
    const password = process.env.MEDIAFIRE_PASSWORD;

    if (!email || !password) {
      console.warn('❌ MediaFire credentials not configured');
      console.warn('Required: MEDIAFIRE_EMAIL, MEDIAFIRE_PASSWORD');
      return null;
    }

    console.log('✓ MediaFire credentials found, integration ready');
    return true;
  } catch (error) {
    console.error('Failed to initialize MediaFire:', error);
    return null;
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    // Check if token is still valid
    if (authToken && tokenExpiry > Date.now()) {
      console.log('Using cached MediaFire token');
      return authToken;
    }

    const email = process.env.MEDIAFIRE_EMAIL;
    const password = process.env.MEDIAFIRE_PASSWORD;

    if (!email || !password) {
      console.error('MediaFire credentials not found in environment');
      return null;
    }

    console.log('\n=== MediaFire Authentication ===');
    console.log('Email:', email);
    console.log('Endpoint: https://www.mediafire.com/api/user/get_session_token.php');

    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('application_id', '42511');

    const bodyString = params.toString();
    console.log('Body string:', bodyString.substring(0, 100) + '...');
    console.log('Body length:', bodyString.length);

    const response = await fetch('https://www.mediafire.com/api/user/get_session_token.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/xml',
      },
      body: bodyString,
    });

    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const data = await response.text();
    console.log('Response body:', data);
    
    // Parse XML response
    const tokenMatch = data.match(/<session_token>(.*?)<\/session_token>/);
    const errorMatch = data.match(/<error>(.*?)<\/error>/);
    const messageMatch = data.match(/<message>(.*?)<\/message>/);
    
    if (messageMatch && messageMatch[1]) {
      console.error('Message:', messageMatch[1]);
    }
    if (errorMatch && errorMatch[1]) {
      console.error('Error code:', errorMatch[1]);
    }

    if (tokenMatch && tokenMatch[1]) {
      authToken = tokenMatch[1];
      tokenExpiry = Date.now() + 12 * 60 * 60 * 1000;
      console.log('✓ Authentication successful, token:', authToken.substring(0, 20) + '...');
      console.log('=== End Authentication ===\n');
      return authToken;
    }

    console.error('❌ No session token found in response');
    console.error('=== End Authentication ===\n');
    return null;
  } catch (error) {
    console.error('Error getting MediaFire auth token:', error);
    return null;
  }
}

export async function uploadFileToMediaFire(
  fileName: string,
  fileBuffer: Buffer,
  _mimeType: string = 'application/octet-stream'
): Promise<{ fileId: string; name: string; size: number } | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('❌ Could not authenticate with MediaFire');
      return null;
    }

    console.log(`\n=== MediaFire File Upload ===`);
    console.log(`File: ${fileName}, Size: ${fileBuffer.length} bytes`);
    console.log('Endpoint: https://www.mediafire.com/api/upload/upload.php');

    const form = new FormData();
    form.append('session_token', token);
    form.append('file', fileBuffer, { filename: fileName });

    const response = await fetch('https://www.mediafire.com/api/upload/upload.php', {
      method: 'POST',
      body: form,
    });

    console.log('Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    // Parse XML response
    const fileKeyMatch = responseText.match(/<quick_key>(.*?)<\/quick_key>/);
    const fileSizeMatch = responseText.match(/<size>(.*?)<\/size>/);
    const errorMatch = responseText.match(/<error>(.*?)<\/error>/);
    const messageMatch = responseText.match(/<message>(.*?)<\/message>/);
    
    if (messageMatch && messageMatch[1]) {
      console.log('Message:', messageMatch[1]);
    }
    if (errorMatch && errorMatch[1]) {
      console.error('Error code:', errorMatch[1]);
    }
    
    if (fileKeyMatch && fileKeyMatch[1]) {
      const fileKey = fileKeyMatch[1];
      const fileSize = fileSizeMatch ? parseInt(fileSizeMatch[1]) : fileBuffer.length;
      console.log(`✓ Upload successful! File key: ${fileKey}`);
      console.log('=== End Upload ===\n');
      
      return {
        fileId: fileKey,
        name: fileName,
        size: fileSize,
      };
    }

    console.error('❌ Upload failed - no quick_key in response');
    console.log('=== End Upload ===\n');
    return null;
  } catch (error: any) {
    console.error('Upload error:', error.message);
    console.error(error);
    return null;
  }
}

export async function getFileDownloadLink(fileKey: string): Promise<string | null> {
  try {
    return `https://www.mediafire.com/?${fileKey}`;
  } catch (error) {
    console.error('Error generating download link:', error);
    return null;
  }
}

export async function deleteFileFromMediaFire(fileKey: string): Promise<boolean> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return false;
    }

    const params = new URLSearchParams();
    params.append('session_token', token);
    params.append('quick_key', fileKey);

    const response = await fetch('https://www.mediafire.com/api/file/delete.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    
    if (responseText.includes('<result>0</result>')) {
      console.log(`✓ File deleted: ${fileKey}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
