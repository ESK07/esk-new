import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type User } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(message);
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    }
    return false;
  }
}

export interface QuoteDoc {
  id: string;
  ownerId: string;
  referenceCode: string;
  clientName: string;
  organization?: string;
  email: string;
  phone?: string;
  serviceIds: string[];
  slaTier: 'basic' | 'business' | 'enterprise';
  estimatedBaseline: number;
  notes: string;
  status: 'submitted' | 'reviewed';
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface TicketDoc {
  id: string;
  ownerId: string;
  referenceCode: string;
  subject: string;
  category: string;
  priority: 'standard' | 'priority' | 'critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface WorkspaceNoteDoc {
  id: string;
  ownerId: string;
  sourceType: 'transcription' | 'search' | 'chat';
  title: string;
  content: string;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export function createFirestoreId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function syncUserProfile(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(ref);
    const displayName = (user.displayName || user.email || 'ESK Client').slice(0, 120);
    const email = (user.email || '').slice(0, 180);
    const photoURL = user.photoURL ? user.photoURL.slice(0, 500) : undefined;

    if (snap.exists()) {
      const payload: Record<string, unknown> = {
        displayName,
        email,
        updatedAt: serverTimestamp(),
      };
      if (photoURL) payload.photoURL = photoURL;
      await updateDoc(ref, payload);
    } else {
      const payload: Record<string, unknown> = {
        uid: user.uid,
        displayName,
        email,
        role: 'client',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (photoURL) payload.photoURL = photoURL;
      await setDoc(ref, payload);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveQuoteToFirestore(input: {
  ownerId: string;
  referenceCode: string;
  clientName: string;
  organization?: string;
  email: string;
  phone?: string;
  serviceIds: string[];
  slaTier: 'basic' | 'business' | 'enterprise';
  estimatedBaseline: number;
  notes: string;
}): Promise<string> {
  const id = createFirestoreId('quote');
  const path = `quotes/${id}`;
  const cleanServiceIds =
    input.serviceIds.length > 0 ? input.serviceIds.slice(0, 10) : ['web-apps'];

  const payload: Record<string, unknown> = {
    id,
    ownerId: input.ownerId,
    referenceCode: input.referenceCode,
    clientName: input.clientName.trim().slice(0, 120),
    email: input.email.trim().slice(0, 180),
    serviceIds: cleanServiceIds,
    slaTier: input.slaTier,
    estimatedBaseline: Math.max(0, Math.min(1000000, Number(input.estimatedBaseline) || 0)),
    notes: input.notes.trim().slice(0, 2000),
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.organization && input.organization.trim()) {
    payload.organization = input.organization.trim().slice(0, 140);
  }
  if (input.phone && input.phone.trim()) {
    payload.phone = input.phone.trim().slice(0, 40);
  }

  try {
    await setDoc(doc(db, 'quotes', id), payload);
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function createTicketInFirestore(input: {
  ownerId: string;
  subject: string;
  category: string;
  priority: 'standard' | 'priority' | 'critical';
}): Promise<string> {
  const id = createFirestoreId('ticket');
  const path = `tickets/${id}`;
  const refNum = `ESK-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    await setDoc(doc(db, 'tickets', id), {
      id,
      ownerId: input.ownerId,
      referenceCode: refNum,
      subject: input.subject.trim().slice(0, 200),
      category: input.category.trim().slice(0, 80),
      priority: input.priority,
      status: 'Open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return refNum;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateTicketStatusInFirestore(
  ticketId: string,
  status: 'Open' | 'In Progress' | 'Resolved'
): Promise<void> {
  const path = `tickets/${ticketId}`;
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveNoteToFirestore(input: {
  ownerId: string;
  sourceType: 'transcription' | 'search' | 'chat';
  title: string;
  content: string;
}): Promise<string> {
  const id = createFirestoreId('note');
  const path = `notes/${id}`;
  try {
    await setDoc(doc(db, 'notes', id), {
      id,
      ownerId: input.ownerId,
      sourceType: input.sourceType,
      title: input.title.trim().slice(0, 160),
      content: input.content.trim().slice(0, 8000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteNoteInFirestore(noteId: string): Promise<void> {
  const path = `notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
