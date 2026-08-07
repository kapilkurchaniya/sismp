import { CRMStore } from '../db';
import { CRMInvestorRecord } from '@/lib/api/mocks/crmMockData';

export class CRMService {
  /**
   * Automatically updates a CRM record's pipeline status based on its linked registration ID.
   */
  static updatePipelineStatusByRegistration(registrationId: string, status: string): CRMInvestorRecord | null {
    const record = CRMStore.getByRegistrationId(registrationId);
    if (!record) return null;

    return CRMStore.update(record.id, { status });
  }

  /**
   * Appends an automated communication log to the CRM record.
   */
  static appendLogByRegistration(registrationId: string, summary: string, type: 'email' | 'call' | 'meeting' | 'site_visit' = 'email'): CRMInvestorRecord | null {
    const record = CRMStore.getByRegistrationId(registrationId);
    if (!record) return null;

    const newLog = {
      id: `COMM-${Date.now()}`,
      type,
      summary,
      loggedBy: 'System Automation',
      loggedAt: new Date().toISOString(),
    };

    const updatedCommunications = [newLog, ...(record.communications || [])];

    return CRMStore.update(record.id, { communications: updatedCommunications });
  }

  /**
   * Retrieves all CRM records.
   */
  static getAll(): CRMInvestorRecord[] {
    return CRMStore.getAll();
  }

  /**
   * Retrieves a specific CRM record by ID.
   */
  static getById(id: string): CRMInvestorRecord | undefined {
    return CRMStore.getById(id);
  }

  /**
   * Standard update method by CRM ID.
   */
  static update(id: string, updates: Partial<CRMInvestorRecord>): CRMInvestorRecord | null {
    try {
      return CRMStore.update(id, updates);
    } catch {
      return null;
    }
  }
}
