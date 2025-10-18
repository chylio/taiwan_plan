import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();

/**
 * HTTPS Cloud Function: /notify
 * 
 * Verifies Firebase ID token from Authorization header and sends
 * Teams notification via the configured webhook URL.
 * 
 * Expected request body:
 * {
 *   "title": "Notification Title",
 *   "text": "Notification text/body",
 *   "color": "0078D4" (optional, hex color without #)
 * }
 * 
 * Authorization: Bearer <firebase-id-token>
 */
export const notify = onRequest(
  {
    cors: true, // Enable CORS for all origins (can be restricted in production)
    region: 'us-central1', // Deploy to us-central1 region
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      // 1. Verify Firebase ID Token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized. Missing or invalid Authorization header.' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      let decodedToken;
      
      try {
        decodedToken = await getAuth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: 'Unauthorized. Invalid Firebase ID token.' });
        return;
      }

      // 2. Check if user is in whitelist (retrieve from environment or Firestore)
      const allowedEmails = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
        'user4@example.com',
        'user5@example.com',
        'user6@example.com',
        'user7@example.com',
        'user8@example.com'
      ];

      if (!decodedToken.email_verified || !allowedEmails.includes(decodedToken.email)) {
        console.warn(`Unauthorized access attempt by ${decodedToken.email}`);
        res.status(403).json({ error: 'Forbidden. User not in whitelist.' });
        return;
      }

      // 3. Extract notification data from request body
      const { title, text, color = '0078D4' } = req.body;

      if (!title || !text) {
        res.status(400).json({ error: 'Bad request. Missing required fields: title and text.' });
        return;
      }

      // 4. Retrieve Teams webhook URL from Firestore
      const db = getFirestore();
      
      // Extract appId from request or use default
      const appId = req.body.appId || 'default-app-id';
      const settingsPath = `artifacts/${appId}/public/data/settings/teams`;
      
      const settingsDoc = await db.doc(settingsPath).get();
      
      if (!settingsDoc.exists) {
        console.warn('Teams webhook URL not configured in Firestore');
        res.status(500).json({ error: 'Teams webhook URL not configured.' });
        return;
      }

      const webhookUrl = settingsDoc.data().url;
      
      if (!webhookUrl) {
        console.warn('Teams webhook URL is empty');
        res.status(500).json({ error: 'Teams webhook URL is empty.' });
        return;
      }

      // 5. Send notification to Teams webhook
      const payload = {
        '@context': 'https://schema.org/extensions',
        '@type': 'MessageCard',
        themeColor: color,
        title: title,
        text: text,
      };

      const teamsResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!teamsResponse.ok) {
        const errorText = await teamsResponse.text();
        console.error('Teams API error:', teamsResponse.status, errorText);
        res.status(500).json({ 
          error: 'Failed to send Teams notification.',
          details: errorText 
        });
        return;
      }

      // 6. Success response
      console.log(`Notification sent successfully by ${decodedToken.email}: ${title}`);
      res.status(200).json({ 
        success: true,
        message: 'Notification sent to Teams successfully.' 
      });

    } catch (error) {
      console.error('Unexpected error in notify function:', error);
      res.status(500).json({ 
        error: 'Internal server error.',
        details: error.message 
      });
    }
  }
);
