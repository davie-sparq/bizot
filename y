rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read a public 'items' collection, but not write
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow write: if false; // No one can write here
    }

    // Keep the rest locked down by default if no other rules match
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
