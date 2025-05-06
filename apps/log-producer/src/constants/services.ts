export const SERVICES = {
  AUTH: 'auth-service',
  PAYMENT: 'payment-service',
  USER: 'user-service',
  ORDER: 'order-service',
} as const;

export type Service = typeof SERVICES[keyof typeof SERVICES];

export const SERVICE_VALUES = Object.values(SERVICES) as readonly Service[]; 