export enum VehicleType {
  CAR = 'Carro',
  MOTORCYCLE = 'Moto',
  TRUCK = 'Caminhão'
}

export enum ServiceType {
  EMERGENCY = 'Emergência (Guincho/Socorro)',
  MAINTENANCE = 'Manutenção Geral',
  TIRE = 'Borracharia',
  ELECTRICAL = 'Elétrica',
  PARTS = 'Comprar Peças e Acessórios'
}

export type UserRole = 'CLIENT' | 'MECHANIC';

export type UserPlan = 'FREE' | 'PRO' | 'PRIME';

export type ServiceStatus = 'PENDING' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PROCESSING' | 'PAID';
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';

export interface ActiveServiceRequest {
  id: string;
  clientName: string;
  mechanicName: string;
  vehicleInfo: string;
  serviceType: string;
  status: ServiceStatus;
  updatedAt: Date;
  locationInfo?: string;
  estimatedArrival?: string;
  distanceKm?: number;
  etaMinutes?: number;
  trafficCondition?: 'LIVRE' | 'MODERADO' | 'INTENSO';
  mechanicCoords?: Coordinates;
  clientCoords?: Coordinates;
  // Payment simulation fields
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  servicePrice?: number;
  receiptId?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan; // Novo campo
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  // Campos específicos de cliente
  vehicleModel?: string;
  vehiclePlate?: string;
  // Campos específicos de mecânico
  shopName?: string;
  specialties?: string[];
  description?: string;
  rating?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        snippet: string;
      }[];
    };
  };
}

export interface SearchResult {
  text: string;
  groundingChunks: GroundingChunk[];
}