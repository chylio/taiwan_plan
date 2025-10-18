# Taiwan Plan - 深耕計畫專案管理儀表板

A secure project management dashboard for the Taiwan Deep Plowing Plan with Firebase integration, real-time collaboration, and Microsoft Teams notifications.

## Features

### Security Enhancements
- **Whitelisted User Access**: Only 8 pre-approved users (email-verified) can access the system
- **No Anonymous Access**: Removed anonymous authentication fallback for enhanced security
- **Content Security Policy (CSP)**: Added security headers to prevent XSS attacks
- **Firestore Security Rules**: Comprehensive validation and authorization rules
- **Backend Teams Notifications**: Webhook URL secured in backend, not exposed in frontend
- **Input Sanitization**: HTML escaping for user-generated content

### Data Model Improvements
- **Budget Breakdown**: Projects now include three budget categories:
  - Personnel Budget (人事費)
  - Operating Budget (業務費)
  - Equipment Budget (設備費)
  - Total Budget (automatically computed)

### New Features
- **Calendar View**: Full calendar interface showing project-related events
  - Monthly view with event visualization
  - Create events directly from calendar
  - Link events to projects and team members
  - Event filtering by date range

### Technical Stack
- Firebase Firestore for real-time database
- Firebase Authentication with custom tokens
- Firebase Cloud Functions (Node 20, ESM)
- Tailwind CSS for responsive UI
- Lucide Icons for iconography

## Project Structure

```
taiwan_plan/
├── index.html              # Main application file (SPA)
├── firebase.json           # Firebase configuration with hosting and security headers
├── firestore.rules         # Security rules with user whitelist and schema validation
├── firestore.indexes.json  # Firestore indexes configuration
└── functions/              # Firebase Cloud Functions
    ├── index.js            # Backend function for Teams notifications
    └── package.json        # Function dependencies
```

## Setup Instructions

### Prerequisites
- Node.js 20 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore and Authentication enabled
- Microsoft Teams incoming webhook (optional, for notifications)

### Configuration Steps

1. **Update Firestore Rules with Actual User Emails**
   
   Edit `firestore.rules` and replace placeholder emails:
   ```javascript
   function allowedEmails() {
     return [
       'user1@example.com',  // Replace with actual email
       'user2@example.com',  // Replace with actual email
       'user3@example.com',  // Replace with actual email
       'user4@example.com',  // Replace with actual email
       'user5@example.com',  // Replace with actual email
       'user6@example.com',  // Replace with actual email
       'user7@example.com',  // Replace with actual email
       'user8@example.com'   // Replace with actual email
     ];
   }
   ```

2. **Update Cloud Function Whitelist**
   
   Edit `functions/index.js` and replace placeholder emails:
   ```javascript
   const allowedEmails = [
     'user1@example.com',  // Replace with actual email
     // ... etc
   ];
   ```

3. **Update Teams Notification Function URL**
   
   Edit `index.html` and update the function URL with your Firebase project ID:
   ```javascript
   const functionUrl = 'https://us-central1-<YOUR-PROJECT-ID>.cloudfunctions.net/notify';
   ```
   Replace `<YOUR-PROJECT-ID>` with your actual Firebase project ID.

4. **Initialize Firebase**
   
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   ```

5. **Install Function Dependencies**
   
   ```bash
   cd functions
   npm install
   cd ..
   ```

6. **Deploy to Firebase**
   
   Deploy everything:
   ```bash
   firebase deploy
   ```
   
   Or deploy individually:
   ```bash
   firebase deploy --only firestore:rules  # Deploy security rules
   firebase deploy --only functions         # Deploy Cloud Functions
   firebase deploy --only hosting          # Deploy web app
   ```

## Security Considerations

### User Authentication
- Users must be authenticated with Firebase Authentication using custom tokens
- Email verification is required (`email_verified: true`)
- Only whitelisted emails can access any data in Firestore

### Firestore Security Rules
The rules validate:
- User authentication and email verification
- Project schema (including budget breakdown fields)
- Task schema (project association, assignee, due date)
- Calendar event schema (project association, date ranges)
- Creator permissions for deletions

### Content Security Policy
The `firebase.json` includes security headers:
- CSP to restrict script sources
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- X-XSS-Protection for older browsers

### Input Sanitization
All user-generated content rendered in HTML is sanitized using the `escapeHtml()` function to prevent XSS attacks.

## Data Collections

### Projects Collection
Path: `/artifacts/{appId}/public/data/project_metadata/{projectId}`

Fields:
- `id`: Project identifier
- `title`: Project title
- `manager`: Project manager name
- `personnelBudget`: Personnel costs (number, ≥0)
- `operatingBudget`: Operating costs (number, ≥0)
- `equipmentBudget`: Equipment costs (number, ≥0)
- `budget`: Total budget (computed, number, ≥0)
- `progress`: Completion percentage (0-100)
- `status`: Current status description
- `proposer`: Proposing organization
- `manpower`: Required personnel count
- `type`: Project type
- `reporterId`: Creator's user ID
- `createdAt`: Creation timestamp

### Tasks Collection
Path: `/artifacts/{appId}/public/data/project_tasks/{taskId}`

Fields:
- `projectId`: Associated project ID
- `taskName`: Task name
- `assignee`: Person responsible
- `dueDate`: Deadline (YYYY-MM-DD)
- `status`: Task status
- `reporterId`: Creator's user ID
- `createdAt`: Creation timestamp

### Calendar Events Collection
Path: `/artifacts/{appId}/public/data/calendar_events/{eventId}`

Fields:
- `projectId`: Associated project ID
- `title`: Event title
- `assignee`: Person responsible
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `description`: Optional description (max 1000 chars)
- `reporterId`: Creator's user ID
- `createdAt`: Creation timestamp

### Settings Collection
Path: `/artifacts/{appId}/public/data/settings/teams`

Fields:
- `url`: Teams incoming webhook URL
- `updatedAt`: Last update timestamp
- `updatedBy`: User who last updated

## Teams Notification Integration

### Backend Function Endpoint
```
POST https://us-central1-<YOUR-PROJECT-ID>.cloudfunctions.net/notify
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "Notification Title",
  "text": "Notification content",
  "color": "0078D4",
  "appId": "your-app-id"
}
```

The function:
1. Verifies the Firebase ID token
2. Checks if the user is in the whitelist
3. Retrieves the Teams webhook URL from Firestore
4. Sends the notification to Teams

### Configure Teams Webhook
1. In Microsoft Teams, add an Incoming Webhook connector to your channel
2. Copy the webhook URL
3. In the application, go to "系統設定" (Settings)
4. Paste the webhook URL and save

## Development

### Local Testing
For local development with Firebase emulators:
```bash
firebase emulators:start
```

### Logging
Firestore logging is set to 'error' level for production security. Change in `index.html`:
```javascript
setLogLevel('error');  // Options: 'debug', 'error', 'silent'
```

## Maintenance

### Adding/Removing Whitelisted Users
1. Update `firestore.rules` with new emails
2. Update `functions/index.js` with new emails
3. Deploy changes:
   ```bash
   firebase deploy --only firestore:rules,functions
   ```

### Monitoring
- Check Firebase Console for usage and errors
- Review Cloud Function logs: `firebase functions:log`
- Monitor Firestore usage in Firebase Console

## Support
For issues or questions, contact the system administrator or maintainer.

## License
Proprietary - Taiwan Deep Plowing Plan Project Management System
