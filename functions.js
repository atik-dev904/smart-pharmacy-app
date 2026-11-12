import { app } from "./firebase.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js";

const functions = getFunctions(app, "asia-south1");

// কর্মচারীর অ্যাকাউন্ট তৈরি
const createEmployeeFunction = httpsCallable(
  functions,
  "createEmployee"
);

export async function createEmployee(data) {
  try {
    const result = await createEmployeeFunction(data);
    return result.data;
  } catch (error) {
    console.error("Create employee error:", error);
    throw new Error(
      error.message || "কর্মচারীর অ্যাকাউন্ট তৈরি করা যায়নি।"
    );
  }
}

// কর্মচারী নিষ্ক্রিয় করা
const deactivateEmployeeFunction = httpsCallable(
  functions,
  "deactivateEmployee"
);

export async function deactivateEmployee(employeeId) {
  try {
    const result = await deactivateEmployeeFunction({
      employeeId
    });

    return result.data;
  } catch (error) {
    console.error("Deactivate employee error:", error);
    throw new Error(
      error.message || "কর্মচারী নিষ্ক্রিয় করা যায়নি।"
    );
  }
}