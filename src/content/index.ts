import type { Contact, Opportunity, Task, StorageShape } from '../types/schema';

console.log("Close Extractor: Content script loaded");


const showExtractionStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  const hostId = 'close-extractor-status-host';
  
 
  const existing = document.getElementById(hostId);
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = hostId;
  host.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  const shadow = host.attachShadow({ mode: 'open' });
  
  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    error: '#ef4444'
  };

  const style = document.createElement('style');
  style.textContent = `
    .indicator {
      background: ${colors[type]};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideIn 0.3s ease-out;
    }
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  shadow.appendChild(style);

  const indicator = document.createElement('div');
  indicator.className = 'indicator';
  
  if (type === 'info') {
    indicator.innerHTML = '<div class="spinner"></div>' + message;
  } else {
    indicator.textContent = message;
  }

  shadow.appendChild(indicator);
  document.body.appendChild(host);

 
  if (type !== 'info') {
    setTimeout(() => host.remove(), 3000);
  }
};

const hideExtractionStatus = () => {
  const host = document.getElementById('close-extractor-status-host');
  if (host) host.remove();
};


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));


let extractionInProgress = false;
const setupAutoExtract = () => {
  const observer = new MutationObserver((mutations) => {
    
    if (extractionInProgress || mutations.length === 0) return;

    const hasNewContent = mutations.some(m => {
      if (m.type === 'childList') {
        return m.addedNodes.length > 0 && Array.from(m.addedNodes).some(node => {
          const el = node as HTMLElement;
          return el.className?.includes?.('DataTable_row_') || 
                 el.className?.includes?.('OpportunityCard_card_') ||
                 el.className?.includes?.('CollapsedItemLayout_');
        });
      }
      return false;
    });

    if (hasNewContent) {
      console.log("[Extractor] DOM change detected, triggering extraction...");

      chrome.runtime.sendMessage({ type: 'EXTRACT_DATA' }).catch(() => {});
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  return observer;
};

setupAutoExtract();


const scrollToLoadAll = async () => {
  const scrollContainer = document.querySelector('[class*="Table"]') || document.body;
  let lastHeight = 0;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const container = scrollContainer as HTMLElement;
    const newHeight = container.scrollHeight;

    if (newHeight === lastHeight) break; 

    lastHeight = newHeight;
    container.scrollTop = newHeight;
    await sleep(300);
    attempts++;
  }

  console.log(`[Extractor] Pagination complete after ${attempts} scrolls`);
};
const getColumnIndices = () => {
  const headers = Array.from(document.querySelectorAll('thead th'));
  const indices: Record<string, number> = { leadName: 0, contactName: 3 }; 
  headers.forEach((th, index) => {
    const text = th.textContent?.trim().toLowerCase() || "";
    if (text === "name") indices.leadName = index;
    if (text === "contacts") indices.contactName = index;
    if (text === "status") indices.status = index;
  });
  return indices;
};


const scrapeContacts = (): Contact[] => {
  const contacts: Contact[] = [];
  const rows = document.querySelectorAll('tbody tr[class*="DataTable_row_"]');
  const colIndices = getColumnIndices();

  rows.forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    const cells = row.querySelectorAll('td');
    if (cells.length < 3) return;

    const leadCell = cells[colIndices.leadName];
    const leadName = leadCell?.querySelector('a')?.textContent?.trim() || leadCell?.textContent?.trim() || "Unknown Lead";
    const contactCell = cells[colIndices.contactName];
    const contactName = contactCell?.textContent?.trim() || "Unknown Contact";

    const emailLinks = Array.from(row.querySelectorAll('a[href^="mailto:"]'));
    const emails = emailLinks.map(a => a.getAttribute('href')?.replace('mailto:', '').trim()).filter((e): e is string => !!e);

    const phoneLinks = Array.from(row.querySelectorAll('a[href^="tel:"]'));
    const phones = phoneLinks.map(a => a.getAttribute('href')?.replace('tel:', '').trim()).filter((p): p is string => !!p);

    const id = emails.length > 0 ? emails[0] : btoa(`${leadName}-${contactName}`).replace(/=/g, '').substring(0, 16);

    if (leadName !== "Unknown Lead" || contactName !== "Unknown Contact") {
      contacts.push({ id, name: contactName, lead: leadName, emails, phones });
    }
  });
  return contacts;
};

const scrapeOpportunities = (): Opportunity[] => {
  const opps: Opportunity[] = [];
  const columns = document.querySelectorAll('[class*="Table_Column_list_"]');
  
  columns.forEach((col) => {
    if (!(col instanceof HTMLElement)) return;
    const statusHeader = col.parentElement?.querySelector('[class*="Table_ColumnHeader_header_"]');
    const statusText = statusHeader?.textContent?.trim() || "Pipeline Stage"; 
    const status = statusText.split('\n')[0].replace(/\d+ OPPORTUNITIES/i, '').trim();

    const cards = col.querySelectorAll('[class*="OpportunityCard_card_"]');
    cards.forEach((card) => {
      if (!(card instanceof HTMLElement)) return;
      const link = card.querySelector('a[class*="OpportunityCard_leadLink_"]');
      const name = link?.textContent?.trim() || "Unknown Opportunity";
      const valueSpan = card.querySelector('[class*="OpportunityCard_valueText_"]');
      const value = valueSpan?.textContent?.trim() || "$0";
      const closeSpan = card.querySelector('[class*="OpportunityCard_closeText_"]');
      const closeTextRaw = closeSpan?.textContent?.trim() || "";
      const closeDateParts = closeTextRaw.split(' on ');
      const closeDate = closeDateParts.length > 1 ? closeDateParts[1].trim() : closeTextRaw;
      const id = btoa(`${name}-${value}-${closeDate}`).replace(/=/g, '').substring(0, 16);

      opps.push({ id, name, value, status, closeDate });
    });
  });
  return opps;
};


const scrapeTasks = (): Task[] => {
  const tasks: Task[] = [];


  const rows = document.querySelectorAll('div[class*="CollapsedItemLayout_"][class*="afterCheckboxWrapper"]');
  console.log(`[Extractor] Scanning Tasks (Compact): Found ${rows.length} rows.`);

  rows.forEach((row) => {
    if (!(row instanceof HTMLElement)) return;

   
    const titleEl = row.querySelector('[class*="CollapsedItemLayout_compact_ellipsis"], [class*="_titleWrapper_"], [class*="_title_"]');
    const rawDesc = titleEl?.textContent?.trim() || "No Description";
    const description = rawDesc.split('\n')[0].trim();

    const leadLink = row.querySelector('a[href*="/lead/"]');
    const leadName = leadLink?.textContent?.trim() || "";

    const timeEl = row.querySelector('div[class*="DateAndAssignee_dateWrapper"] time, time');
    const dueDate = timeEl?.getAttribute('datetime')?.split('T')[0] || timeEl?.textContent?.trim() || "No Date";

  
    const fullDescription = leadName ? `${description} (${leadName})` : description;
    const id = btoa(fullDescription + dueDate).replace(/=/g, '').substring(0, 16);

    tasks.push({
      id,
      description: fullDescription,
      dueDate,
      assignee: "Me",
      isComplete: false
    });
  });

  return tasks;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(sender)
  if (message.type === 'EXTRACT_DATA') {
    const url = window.location.href;
    console.log("[Extractor] Triggered on:", url);
    
   
    if (extractionInProgress) {
      console.warn("[Extractor] Extraction already in progress, ignoring request");
      sendResponse({ 
        success: false, 
        message: "Extraction already in progress" 
      });
      return true;
    }
    
    showExtractionStatus('Extracting data...', 'info');
    
 
    chrome.runtime.sendMessage({ type: 'EXTRACTION_STARTED' }).catch(() => {});

    const performExtraction = async () => {
      let newContacts: Contact[] = [];
      let newOpps: Opportunity[] = [];
      let newTasks: Task[] = [];
      let attempt = 0;
      let totalCount = 0;

      extractionInProgress = true;

      try {
     
        await scrollToLoadAll();

    
        while (attempt < 5 && totalCount === 0) {
          if (attempt > 0) await sleep(500);

          if (url.includes('/leads') || url.includes('search')) {
             newContacts = scrapeContacts();
          } else if (url.includes('/opportunities')) {
             newOpps = scrapeOpportunities();
          } else if (url.includes('/tasks') || url.includes('/inbox')) {
             newTasks = scrapeTasks();
          } else {
             newContacts = scrapeContacts();
             if (document.querySelector('[class*="OpportunityCard_card_"]')) newOpps = scrapeOpportunities();
             if (document.querySelector('[class*="CollapsedItemLayout_"]')) newTasks = scrapeTasks();
          }

          totalCount = newContacts.length + newOpps.length + newTasks.length;
          attempt++;
        }

        // Save
        chrome.storage.local.get('close_data', (result) => {
          const raw = result.close_data;
          const currentData: StorageShape = (raw as StorageShape) || { 
            contacts: {}, opportunities: {}, tasks: {}, lastSync: 0 
          };

          newContacts.forEach(c => currentData.contacts[c.id] = c);
          newOpps.forEach(o => currentData.opportunities[o.id] = o);
          newTasks.forEach(t => currentData.tasks[t.id] = t);
          
          currentData.lastSync = Date.now();

          console.log("[Extractor] Saving data:", currentData);

          chrome.storage.local.set({ 'close_data': currentData }, () => {
            console.log(`[Extractor] Saved. Count: ${totalCount}`);
            
            if (totalCount > 0) {
              showExtractionStatus(`✓ Extracted ${totalCount} items`, 'success');
            } else {
              showExtractionStatus('No items found. Try scrolling?', 'error');
            }
            
            setTimeout(() => hideExtractionStatus(), 2000);
            
  
            chrome.runtime.sendMessage({ 
              type: 'EXTRACTION_COMPLETED', 
              count: totalCount 
            }).catch(() => {});
            
            sendResponse({ 
              success: true, 
              message: totalCount > 0 ? `Successfully extracted ${totalCount} items.` : "No items found. Try scrolling?",
              count: totalCount
            });

            extractionInProgress = false;
          });
        });
      } catch (error) {
        console.error("[Extractor] Extraction error:", error);
        showExtractionStatus('Extraction failed', 'error');
     
        chrome.runtime.sendMessage({ 
          type: 'EXTRACTION_COMPLETED', 
          count: 0 
        }).catch(() => {});
        
        extractionInProgress = false;
        sendResponse({ success: false, message: String(error) });
      }
    };

    performExtraction();
    return true; 
  }
});