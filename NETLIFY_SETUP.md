## CTF Platform - Netlify Serverless Function Setup Guide

### Overview
The `submitFlag` serverless function has been added to validate flag submissions server-side. It requires Firebase Admin SDK credentials to be configured as environment variables in Netlify.

### Steps to Complete Setup

#### 1. Generate Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **ctf-smk**
3. Navigate to: **Project Settings** (gear icon) → **Service Accounts** tab
4. Click **Generate New Private Key**
5. A JSON file will be downloaded - keep this secure
6. Open the downloaded JSON file and locate these three values:
   - `project_id` (e.g., "ctf-smk")
   - `client_email` (e.g., "firebase-adminsdk-xxxxx@ctf-smk.iam.gserviceaccount.com")
   - `private_key` (begins with "-----BEGIN PRIVATE KEY-----")

#### 2. Configure Netlify Environment Variables
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your CTF site
3. Navigate to: **Site Settings** → **Environment**
4. Click **Add a variable** and add these three environment variables:

| Variable Name | Value |
|---|---|
| `FIREBASE_PROJECT_ID` | `ctf-smk` |
| `FIREBASE_CLIENT_EMAIL` | From your service account JSON: `client_email` field |
| `FIREBASE_PRIVATE_KEY` | From your service account JSON: `private_key` field (include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) |

**Important:** When copying the `private_key`, make sure to include the entire key including the BEGIN/END lines. Netlify will handle the escaping automatically.

#### 3. Deploy to Netlify
1. Push your changes to your repository:
   ```bash
   git add .
   git commit -m "Add submitFlag serverless function"
   git push
   ```

2. Netlify will automatically detect the `netlify.toml` and deploy the functions

3. Verify deployment in Netlify Dashboard → **Functions** tab - you should see `submitFlag` listed

### How It Works

**Before (Client-side):**
- Flag verification: browser compares input with stored flag
- Database write: browser writes directly to Firestore
- Security issue: flag visible in browser, no server-side validation

**After (Server-side with Netlify Function):**
- Client sends: `idToken`, `challengeId`, `flagInput`
- Server verifies: idToken authentic, user is student
- Server checks: challenge exists and is active
- Server enforces: rate limiting (max 10 wrong attempts), already solved check
- Server writes: attendance record to Firestore
- Server returns: `{ correct: true/false, attempts: totalAttempts }`

### Verification Checklist

- [ ] Service account JSON file downloaded from Firebase
- [ ] Three environment variables set in Netlify
- [ ] Changes committed and pushed to repository
- [ ] Netlify build completed successfully
- [ ] `submitFlag` function appears in Functions dashboard
- [ ] Test flag submission from challenge.html
- [ ] Verify attendance records appear in Firestore

### Error Troubleshooting

**"Invalid or expired token"** → User needs to refresh/reauthenticate
**"MAX ATTEMPTS REACHED"** → User has 10+ incorrect attempts (server-enforced limit)
**"ALREADY SOLVED"** → User already submitted correct flag for this challenge
**"Challenge not active"** → Challenge must have `active: true` in Firestore
**"Only students can submit flags"** → User role must be "student" in Firestore

### Files Modified/Created

- ✅ Created: `netlify/functions/submitFlag.js` - Server-side flag validation
- ✅ Created: `netlify/functions/package.json` - Firebase Admin SDK dependency
- ✅ Created: `netlify.toml` - Netlify Functions configuration
- ✅ Updated: `challenge.html` - Client now calls serverless function with idToken
