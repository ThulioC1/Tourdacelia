import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from "firebase/firestore";
import { db } from "../firebase.ts";

export interface EventRegistrationField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface CyclingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  distance: string;
  description: string;
  imageUrl: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  registrationFields: EventRegistrationField[];
  sponsors?: string[]; // Added sponsors
  googleFormsUrl?: string; // Added Google Forms integration link
}

export interface Registration {
  id: string;
  eventId: string;
  participantData: Record<string, string>;
  registeredAt: string;
}

export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'poster';
  name: string;
}

const EVENTS_COLLECTION = "events";
const REGS_COLLECTION = "registrations";
const USERS_COLLECTION = "users";

export const dbService = {
  // Events
  async getEvents(): Promise<CyclingEvent[]> {
    const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CyclingEvent));
  },

  async getEventById(id: string): Promise<CyclingEvent | null> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CyclingEvent;
    }
    return null;
  },

  async addEvent(event: Omit<CyclingEvent, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), event);
    return docRef.id;
  },

  async updateEvent(id: string, event: Partial<CyclingEvent>): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await updateDoc(docRef, event);
  },

  async deleteEvent(id: string): Promise<void> {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Registrations
  async getRegistrations(eventId: string): Promise<Registration[]> {
    const q = query(collection(db, REGS_COLLECTION), where("eventId", "==", eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
  },

  async saveRegistration(reg: Omit<Registration, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, REGS_COLLECTION), {
      ...reg,
      registeredAt: new Date().toISOString()
    });
    return docRef.id;
  },

  // Users & Roles
  async getUserProfile(uid: string): Promise<AppUser | null> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppUser;
    }
    return null;
  },

  async createUserProfile(user: AppUser): Promise<void> {
    await updateDoc(doc(db, USERS_COLLECTION, user.uid), user as any);
  }
};
