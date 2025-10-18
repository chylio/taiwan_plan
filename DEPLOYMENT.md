# Deployment Checklist

Before deploying to production, complete the following steps:

## Configuration

### 1. Update User Whitelist
- [ ] Edit `firestore.rules` (lines 8-17) and replace placeholder emails with actual user emails
- [ ] Edit `functions/index.js` (lines 57-66) and replace placeholder emails with actual user emails
- [ ] Ensure all emails are verified in Firebase Authentication

### 2. Update Firebase Project ID
- [ ] Edit `index.html` (around line 272) and replace `<YOUR-PROJECT-ID>` with your actual Firebase project ID:
  ```javascript
  const functionUrl = 'https://us-central1-<YOUR-PROJECT-ID>.cloudfunctions.net/notify';
  ```

### 3. Configure Firebase CLI
- [ ] Run `firebase login` to authenticate
- [ ] Run `firebase use --add` to select your Firebase project
- [ ] Verify project ID with `firebase use`

## Installation

### 4. Install Dependencies
- [ ] Navigate to `functions/` directory
- [ ] Run `npm install`
- [ ] Verify installation completed without errors

## Deployment

### 5. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```
- [ ] Verify deployment successful
- [ ] Test access with whitelisted user
- [ ] Test that non-whitelisted users are denied

### 6. Deploy Cloud Functions
```bash
firebase deploy --only functions
```
- [ ] Verify function deployed successfully
- [ ] Note the function URL from deployment output
- [ ] Update `index.html` with correct function URL if different

### 7. Deploy Hosting (Web App)
```bash
firebase deploy --only hosting
```
- [ ] Verify hosting deployment successful
- [ ] Test access to the web app
- [ ] Verify CSP headers are applied (check browser console)

### 8. Full Deployment (Alternative)
```bash
firebase deploy
```
This deploys everything at once.

## Post-Deployment Verification

### 9. Test Authentication
- [ ] Attempt to access with whitelisted user - should succeed
- [ ] Attempt to access with non-whitelisted user - should fail
- [ ] Verify custom token authentication works
- [ ] Verify anonymous authentication is blocked

### 10. Test Security Rules
- [ ] Create a project with whitelisted user - should succeed
- [ ] Try to create project with invalid schema - should fail
- [ ] Try to delete another user's project - should fail
- [ ] Verify all CRUD operations follow rules

### 11. Test Calendar Feature
- [ ] Create a calendar event
- [ ] Verify event appears in calendar view
- [ ] Verify event links to correct project
- [ ] Test date filtering

### 12. Test Budget Breakdown
- [ ] Create project with budget breakdown
- [ ] Verify total budget is computed correctly
- [ ] Update budget fields and verify total updates
- [ ] Check that negative values are rejected by security rules

### 13. Test Teams Notifications
- [ ] Configure Teams webhook URL in Settings
- [ ] Create a project - verify notification sent
- [ ] Create a task - verify notification sent
- [ ] Verify notifications contain correct information
- [ ] Test that backend function requires authentication

### 14. Test XSS Protection
- [ ] Try to create project/task with HTML/script tags in name
- [ ] Verify content is escaped and not executed
- [ ] Check browser console for any errors

### 15. Performance Check
- [ ] Monitor Firestore read/write operations
- [ ] Check Cloud Function execution time
- [ ] Verify real-time listeners are working
- [ ] Test with multiple concurrent users

## Security Verification

### 16. Security Headers
- [ ] Open browser DevTools > Network
- [ ] Load the app
- [ ] Check response headers for:
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection

### 17. Log Level
- [ ] Verify Firestore log level is set to 'error'
- [ ] Check browser console for minimal logging
- [ ] Ensure no sensitive data in logs

### 18. Firestore Rules Testing
Use Firebase Console > Firestore > Rules > Rules Playground to test:
- [ ] Read access with whitelisted user
- [ ] Write access with whitelisted user
- [ ] Denied access without authentication
- [ ] Schema validation for invalid data

## Monitoring Setup

### 19. Firebase Console Monitoring
- [ ] Set up error alerting in Firebase Console
- [ ] Enable Performance Monitoring
- [ ] Set up budget alerts for Firestore usage
- [ ] Configure Cloud Function monitoring

### 20. Documentation
- [ ] Update team documentation with:
  - Deployed URLs
  - Whitelisted user emails
  - Teams webhook configuration
  - Support contact information

## Rollback Plan

### 21. Backup Current State
- [ ] Export current Firestore data
- [ ] Save current security rules
- [ ] Document current configuration

### 22. Rollback Procedure
If deployment fails:
```bash
# Deploy previous rules
firebase deploy --only firestore:rules --version <previous-version>

# Revert functions
firebase functions:delete notify
firebase deploy --only functions --version <previous-version>

# Revert hosting
firebase hosting:rollback --site <site-name>
```

## Maintenance

### 23. Regular Tasks
- [ ] Review Firestore usage weekly
- [ ] Check Cloud Function logs for errors
- [ ] Update dependencies monthly
- [ ] Review and update whitelist as needed
- [ ] Backup Firestore data regularly

## Support

### 24. User Support
- [ ] Provide users with login instructions
- [ ] Document common issues and solutions
- [ ] Set up support channel (email/Teams)
- [ ] Create user guide for calendar feature

## Completion

### 25. Sign-off
- [ ] Development team approval
- [ ] Security review completed
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] All stakeholders notified

**Deployment Date:** _____________

**Deployed By:** _____________

**Verified By:** _____________

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
