import type { StorageSchema, Contact } from "../types/schema";

export const saveContacts = async (newContacts: Contact[]) => {
 
  const result = await chrome.storage.local.get("close_data");
  const currentStore = result.close_data as StorageSchema || { contacts: {}, opportunities: {}, tasks: {} };

  
  const updatedContacts = { ...currentStore.contacts };
  
  newContacts.forEach(contact => {
    updatedContacts[contact.id] = contact;
  });

  await chrome.storage.local.set({
    close_data: {
      ...currentStore,
      contacts: updatedContacts,
      lastSync: Date.now()
    }
  });
};