import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { 
  INITIAL_ASSETS, 
  INITIAL_EMPLOYEES, 
  INITIAL_VENDORS, 
  INITIAL_TICKETS, 
  INITIAL_QUOTATIONS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_APPROVAL_CONFIG
} from "../data/initialData";
import { USER_PROFILES } from "../data/users";

export const seedFirestore = async () => {
  try {
    console.log("Seeding started...");

    const users = Object.values(USER_PROFILES);
    for (const user of users) {
      await setDoc(doc(db, "users", user.id), user);
      console.log(`Seeded user: ${user.name}`);
    }

    for (const asset of INITIAL_ASSETS) {
      await setDoc(doc(db, "assets", asset.id), asset);
      console.log(`Seeded asset: ${asset.name}`);
    }

    for (const emp of INITIAL_EMPLOYEES) {
      await setDoc(doc(db, "employees", emp.id), emp);
      console.log(`Seeded employee: ${emp.name}`);
    }

    for (const v of INITIAL_VENDORS) {
      await setDoc(doc(db, "vendors", v.id), v);
      console.log(`Seeded vendor: ${v.name}`);
    }

    for (const t of INITIAL_TICKETS) {
      await setDoc(doc(db, "tickets", t.id), t);
      console.log(`Seeded ticket: ${t.id}`);
    }

    for (const q of INITIAL_QUOTATIONS) {
      await setDoc(doc(db, "quotations", q.id), q);
      console.log(`Seeded quotation: ${q.id}`);
    }

    for (const w of INITIAL_WORK_ORDERS) {
      await setDoc(doc(db, "workOrders", w.id), w);
      console.log(`Seeded workOrder: ${w.id}`);
    }

    for (const a of INITIAL_AUDIT_LOGS) {
      await setDoc(doc(db, "auditLogs", a.id), a);
      console.log(`Seeded auditLog: ${a.id}`);
    }

    await setDoc(doc(db, "settings", "approvalConfig"), INITIAL_APPROVAL_CONFIG);
    console.log("Seeded approvalConfig");

    console.log("Seeding complete! Check your Firestore database.");
    alert("Database successfully seeded! Check your Firebase Console.");
  } catch (error) {
    console.error("Error seeding database: ", error);
    alert("Error seeding database. Check console for details.");
  }
};
