const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");
const crypto = require("crypto");

initializeApp();

const auth = getAuth();
const db = getFirestore();

setGlobalOptions({
  region: "asia-south1"
});

// মালিকের অনুমতি যাচাই
async function verifyOwner(request) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "প্রথমে লগইন করুন।"
    );
  }

  const ownerId = request.auth.uid;

  const userRef = db.collection("users").doc(ownerId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new HttpsError(
      "permission-denied",
      "ব্যবহারকারীর তথ্য পাওয়া যায়নি।"
    );
  }

  const user = userSnap.data();

  if (
    user.role !== "owner" ||
    user.active !== true ||
    user.pharmacyId !== ownerId
  ) {
    throw new HttpsError(
      "permission-denied",
      "শুধু সক্রিয় মালিক এই কাজ করতে পারবেন।"
    );
  }

  return {
    ownerId,
    user
  };
}

// কর্মচারীর অ্যাকাউন্ট তৈরি
exports.createEmployee = onCall(async (request) => {
  const { ownerId } = await verifyOwner(request);

  const data = request.data || {};

  const name = String(data.name || "").trim();
  const mobile = String(data.mobile || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const role = String(data.role || "").trim();

  if (!name || !mobile || !email || !role) {
    throw new HttpsError(
      "invalid-argument",
      "নাম, মোবাইল, ইমেইল ও পদ পূরণ করুন।"
    );
  }

  const allowedRoles = [
    "manager",
    "sales",
    "stock",
    "cashier"
  ];

  if (!allowedRoles.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      "নির্বাচিত কর্মচারীর পদ সঠিক নয়।"
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError(
      "invalid-argument",
      "সঠিক ইমেইল ঠিকানা দিন।"
    );
  }

  if (!/^[0-9+\-\s]{8,20}$/.test(mobile)) {
    throw new HttpsError(
      "invalid-argument",
      "সঠিক মোবাইল নম্বর দিন।"
    );
  }

  const pharmacyRef = db.collection("pharmacies").doc(ownerId);
  const pharmacySnap = await pharmacyRef.get();

  if (!pharmacySnap.exists) {
    throw new HttpsError(
      "failed-precondition",
      "ফার্মেসির তথ্য পাওয়া যায়নি।"
    );
  }

  const temporaryPassword =
    crypto.randomBytes(12).toString("base64url") + "A1!";

  let employeeUser;

  try {
    employeeUser = await auth.createUser({
      email,
      password: temporaryPassword,
      displayName: name,
      disabled: false
    });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      throw new HttpsError(
        "already-exists",
        "এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।"
      );
    }

    throw new HttpsError(
      "internal",
      "কর্মচারীর অ্যাকাউন্ট তৈরি করা যায়নি।"
    );
  }

  const employeeId = employeeUser.uid;

  const employeeRef = pharmacyRef
    .collection("employees")
    .doc(employeeId);

  const userRef = db.collection("users").doc(employeeId);

  try {
    const batch = db.batch();

    batch.set(employeeRef, {
      uid: employeeId,
      name,
      mobile,
      email,
      role,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: ownerId
    });

    batch.set(userRef, {
      uid: employeeId,
      name,
      mobile,
      email,
      role,
      active: true,
      pharmacyId: ownerId,
      createdAt: FieldValue.serverTimestamp()
    });

    await batch.commit();

  } catch (error) {
    await auth.deleteUser(employeeId).catch(() => {});

    throw new HttpsError(
      "internal",
      "কর্মচারীর তথ্য সংরক্ষণ করা যায়নি।"
    );
  }

  return {
    success: true,
    employeeId,
    email,
    temporaryPassword,
    message: "কর্মচারীর অ্যাকাউন্ট তৈরি হয়েছে।"
  };
});

// কর্মচারীকে নিষ্ক্রিয় করা
exports.deactivateEmployee = onCall(async (request) => {
  const { ownerId } = await verifyOwner(request);

  const employeeId = String(
    request.data?.employeeId || ""
  ).trim();

  if (!employeeId || employeeId === ownerId) {
    throw new HttpsError(
      "invalid-argument",
      "সঠিক কর্মচারী নির্বাচন করুন।"
    );
  }

  const pharmacyRef = db.collection("pharmacies").doc(ownerId);

  const employeeRef = pharmacyRef
    .collection("employees")
    .doc(employeeId);

  const employeeSnap = await employeeRef.get();

  if (!employeeSnap.exists) {
    throw new HttpsError(
      "not-found",
      "কর্মচারী পাওয়া যায়নি।"
    );
  }

  const employeeData = employeeSnap.data();

  if (employeeData.active === false) {
    throw new HttpsError(
      "failed-precondition",
      "কর্মচারী ইতিমধ্যে নিষ্ক্রিয়।"
    );
  }

  await auth.updateUser(employeeId, {
    disabled: true
  });

  const batch = db.batch();

  batch.update(employeeRef, {
    active: false,
    deactivatedAt: FieldValue.serverTimestamp(),
    deactivatedBy: ownerId
  });

  batch.update(
    db.collection("users").doc(employeeId),
    {
      active: false
    }
  );

  await batch.commit();

  return {
    success: true,
    message: "কর্মচারীকে নিষ্ক্রিয় করা হয়েছে।"
  };
});