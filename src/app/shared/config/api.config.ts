/**
 * Centralized API Configuration
 * 
 * This file centralizes all API URLs to facilitate
 * changes in different environments (development, testing, production)
 */

export const API_CONFIG = {
  // Base URL of the API - use relative URL to work with proxy during development
  baseUrl: '/api',
  
  // Specific endpoints
  endpoints: {
    patients: '/patient',
    patientsByTerapist: '/patient/patient-terapist',
    guardians: '/guardian',
    modalities: '/modality',
    modalitiesCreate: '/modality/save-modality',
    therapies: '/therapy',
    therapiesCreate: '/therapy/save-therapy',
    therapists: '/team',
    therapistsCreate: '/team/save-team',
    healthPlans: '/healthinsurance',
    healthPlansCreate: '/healthinsurance/save-healthinsurance',
    guides: '/guide',
    guidesCreate: '/guide/save-guide',
    servicePackages: '/service-package',
    servicePackageCreate: '/service-package/save-service-package',
    patientsCreate: '/patient/save-patient',
    guardiansCreate: '/guardian/save-guardian',
    schedules: '/schedule',
    schedulesCreate: '/schedule/save-schedule',
    sessions: '/session',
    sessionsCreate: '/session/save-session',
    schedulesActive: '/schedule/active',
    schedulesActiveByTerapist: '/schedule/active-terapist',
    registerAppointment: '/register-appointment/register-register-appointment',
    registerSession: '/session/registerSession',
    contracts: '/contract',
    contractsCreate: '/contract/save-contract',
    scheduleCreate: '/schedule/register-schedule',
  },
  
  // Timeouts (in ms)
  requestTimeout: 30000,
  
  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Cache configuration
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

/**
 * Function to build complete URLs
 * 
 * @param endpoint - Endpoint name (ex: 'patients')
 * @returns Complete API URL
 */
export function getApiUrl(endpoint: keyof typeof API_CONFIG.endpoints): string {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
}

/**
 * Function to build URLs with parameters
 * 
 * @param endpoint - Endpoint name
 * @param path - Additional path (ex: '/123/values')
 * @returns Complete URL with path
 */
export function getApiUrlWithPath(
  endpoint: keyof typeof API_CONFIG.endpoints,
  path: string = ''
): string {
  return `${getApiUrl(endpoint)}${path}`;
}

/**
 * Function to build filter URLs
 * 
 * @param endpoint - Endpoint name
 * @param filter - Filter name (ex: 'active', 'cpf')
 * @param value - Filter value (optional)
 * @returns Complete URL with filter
 */
export function getApiUrlWithFilter(
  endpoint: keyof typeof API_CONFIG.endpoints,
  filter: string,
  value?: string
): string {
  const baseUrl = getApiUrl(endpoint);
  if (value) {
    return `${baseUrl}/${filter}/${value}`;
  }
  return `${baseUrl}/filter/${filter}`;
}
