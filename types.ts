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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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