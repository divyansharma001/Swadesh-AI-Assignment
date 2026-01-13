import type { StorageShape, Contact, Opportunity, Task } from '../types/schema';

export const exportAsJSON = (data: StorageShape) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadFile(blob, `close-data-${Date.now()}.json`);
};

export const exportAsCSV = (data: StorageShape) => {
  let csv = '';

  // Contacts CSV
  if (Object.keys(data.contacts).length > 0) {
    csv += 'CONTACTS\n';
    csv += 'ID,Name,Lead,Emails,Phones\n';
    Object.values(data.contacts).forEach((c: Contact) => {
      const emails = (c.emails || []).join(';');
      const phones = (c.phones || []).join(';');
      csv += `"${c.id}","${c.name}","${c.lead}","${emails}","${phones}"\n`;
    });
    csv += '\n\n';
  }

  // Opportunities CSV
  if (Object.keys(data.opportunities).length > 0) {
    csv += 'OPPORTUNITIES\n';
    csv += 'ID,Name,Value,Status,Close Date\n';
    Object.values(data.opportunities).forEach((o: Opportunity) => {
      csv += `"${o.id}","${o.name}","${o.value}","${o.status}","${o.closeDate}"\n`;
    });
    csv += '\n\n';
  }

  // Tasks CSV
  if (Object.keys(data.tasks).length > 0) {
    csv += 'TASKS\n';
    csv += 'ID,Description,Due Date,Assignee,Complete\n';
    Object.values(data.tasks).forEach((t: Task) => {
      csv += `"${t.id}","${t.description}","${t.dueDate}","${t.assignee}",${t.isComplete ? 'Yes' : 'No'}\n`;
    });
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  downloadFile(blob, `close-data-${Date.now()}.csv`);
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
