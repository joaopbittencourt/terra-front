export type GuideStatus = 'ACTIVE' | 'INACTIVE';

export interface Guide {
  id: string;
  patientId: string;
  healthPlanId: string;
  guideNumber: string;
  authorizationCode: string;
  expirationDate: string;
  totalSessionsAuthorized: number;
  usedSessions: number;
  status: GuideStatus;
}