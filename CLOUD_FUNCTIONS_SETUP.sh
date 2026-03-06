# CTF Platform — Cloud Functions & Storage Setup
# Run these commands in your terminal one by one

# ══════════════════════════════════════════════
# STEP 1 — Install Firebase CLI
# ══════════════════════════════════════════════
npm install -g firebase-tools

# ══════════════════════════════════════════════
# STEP 2 — Login to Firebase
# ══════════════════════════════════════════════
firebase login
# A browser window will open — sign in with your Google account

# ══════════════════════════════════════════════
# STEP 3 — Go to your project folder
# ══════════════════════════════════════════════
cd ~/Documents/ctf-web    # change this to wherever your files are

# ══════════════════════════════════════════════
# STEP 4 — Initialize Firebase in your project
# ══════════════════════════════════════════════
firebase init

# When prompted, select these options (use arrow keys + spacebar):
#   ✓ Functions
#   ✓ Storage   (for file uploads)
#
# Then answer the questions:
#   - Use an existing project? YES → select your ctf project
#   - Language? JAVASCRIPT
#   - Use ESLint? NO
#   - Install dependencies now? YES
#
# This creates: functions/ folder, .firebaserc, firebase.json

# ══════════════════════════════════════════════
# STEP 5 — Replace the generated functions/index.js
# ══════════════════════════════════════════════
# Copy the functions/index.js file provided with this project
# into the functions/ folder that was just created.
# (Replace the empty one Firebase generated)

# ══════════════════════════════════════════════
# STEP 6 — Enable Firebase Storage in Console
# ══════════════════════════════════════════════
# Go to Firebase Console → Build → Storage → Get started
# Choose your region (same as Firestore) → Done
#
# Then go to Storage Rules tab and paste this:
#
# rules_version = '2';
# service firebase.storage {
#   match /b/{bucket}/o {
#     match /challenges/{challengeId}/{fileName} {
#       allow read: if request.auth != null;
#       allow write: if request.auth != null
#         && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
#     }
#   }
# }
#
# Click Publish

# ══════════════════════════════════════════════
# STEP 7 — Deploy Cloud Functions
# ══════════════════════════════════════════════
firebase deploy --only functions

# Wait for deployment to finish.
# You should see:
#   ✔ functions[createStudent] Deployed
#   ✔ functions[resetStudentPassword] Deployed
#   ✔ functions[deleteStudent] Deployed

# ══════════════════════════════════════════════
# STEP 8 — Enable Billing (Required for Cloud Functions)
# ══════════════════════════════════════════════
# Firebase Cloud Functions requires a Blaze (pay-as-you-go) plan.
# BUT — the free quota is very generous:
#   - 2 million function calls/month FREE
#   - You will NOT be charged unless you exceed this
#
# To upgrade:
#   Firebase Console → bottom left → Upgrade → Blaze Plan
#   Add a credit card (you won't be charged unless you exceed free limits)

# ══════════════════════════════════════════════
# DONE! Test it:
# ══════════════════════════════════════════════
# 1. Open admin-students.html via live server
# 2. Login as admin
# 3. Create a student — you should stay logged in as admin!
# 4. The student should appear in the roster immediately
