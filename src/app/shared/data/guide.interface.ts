export type GuideStatus = 'ACTIVE' | 'INACTIVE';

export interface Guide {
  id: string;
  patientId: string;
  guideNumber: string;
  authorizationCode: string;
  authorizationDate: string;
  expirationDate: string;
  totalSessionsAuthorized: number;
  usedSessions: number;
  status: GuideStatus;
}