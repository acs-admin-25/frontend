import { db } from './firebase';
import { collection, addDoc, getDocs, query, doc, deleteDoc } from 'firebase/firestore';

// Save an event
export async function saveCalendarEvent(event: any) {
  console.log('Saving event to Firestore:', event);
  const docRef = await addDoc(collection(db, 'calendarEvents'), event);
  console.log('Saved event with ID:', docRef.id);
  return docRef.id;
}

// Fetch all events
export async function fetchCalendarEvents() {
  const q = query(collection(db, 'calendarEvents'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Delete an event
export async function deleteCalendarEvent(eventId: string) {
  console.log('Deleting event from Firestore:', eventId);
  const docRef = doc(db, 'calendarEvents', eventId);
  await deleteDoc(docRef);
  console.log('Deleted event with ID:', eventId);
} 