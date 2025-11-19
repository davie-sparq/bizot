import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Agent } from '../types';

const AGENTS_COLLECTION = 'agents';

export const createAgent = async (ownerId: string, agentData: Partial<Agent>) => {
    const newAgent: Omit<Agent, 'id'> = {
        ownerId,
        name: agentData.name || 'Untitled Agent',
        systemInstruction: agentData.systemInstruction || '',
        knowledgeBase: agentData.knowledgeBase || [],
        status: 'draft',
        createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, AGENTS_COLLECTION), newAgent);
    return { id: docRef.id, ...newAgent };
};

export const getUserAgents = async (ownerId: string): Promise<Agent[]> => {
    const q = query(collection(db, AGENTS_COLLECTION), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Agent));
};

export const getAgent = async (agentId: string): Promise<Agent | null> => {
    const docRef = doc(db, AGENTS_COLLECTION, agentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Agent;
    } else {
        return null;
    }
};

export const updateAgent = async (agentId: string, data: Partial<Agent>) => {
    const docRef = doc(db, AGENTS_COLLECTION, agentId);
    await updateDoc(docRef, data);
};

export const deleteAgent = async (agentId: string) => {
    const docRef = doc(db, AGENTS_COLLECTION, agentId);
    await deleteDoc(docRef);
};
