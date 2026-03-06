const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ─────────────────────────────────────────────────────────────
//  createStudent
//  Called from admin-students.html to create a student account
//  without affecting the admin's current session.
// ─────────────────────────────────────────────────────────────
exports.createStudent = functions.https.onCall(async (data, context) => {

  // 1. Must be logged in
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in."
    );
  }

  // 2. Must be admin
  const callerDoc = await admin.firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();

  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can create students."
    );
  }

  const { name, studentClass, password } = data;

  // 3. Validate inputs
  if (!name || !password) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Name and password are required."
    );
  }
  if (password.length < 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Password must be at least 6 characters."
    );
  }

  // 4. Build pseudo-email from name
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}@ctf.student`;

  try {
    // 5. Create Firebase Auth user (server-side — doesn't affect admin session)
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // 6. Create Firestore document
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      name,
      class: studentClass || "",
      email,
      role: "student",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, uid: userRecord.uid, email };

  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError(
        "already-exists",
        "A student with this name already exists."
      );
    }
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ─────────────────────────────────────────────────────────────
//  resetStudentPassword
//  Resets a student's password from the admin panel.
// ─────────────────────────────────────────────────────────────
exports.resetStudentPassword = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Not logged in.");
  }

  const callerDoc = await admin.firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();

  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admins only.");
  }

  const { uid, newPassword } = data;

  if (!uid || !newPassword || newPassword.length < 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "UID and a password of at least 6 characters are required."
    );
  }

  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ─────────────────────────────────────────────────────────────
//  deleteStudent
//  Deletes a student from both Auth and Firestore.
// ─────────────────────────────────────────────────────────────
exports.deleteStudent = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Not logged in.");
  }

  const callerDoc = await admin.firestore()
    .collection("users")
    .doc(context.auth.uid)
    .get();

  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admins only.");
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "UID is required.");
  }

  try {
    // Delete from Auth
    await admin.auth().deleteUser(uid);
    // Delete from Firestore
    await admin.firestore().collection("users").doc(uid).delete();
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
