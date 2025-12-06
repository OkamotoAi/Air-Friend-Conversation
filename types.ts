export enum PersonaType {
  TANAKA = 'TANAKA',
  SAMANTHA = 'SAMANTHA',
  ALBERTO = 'ALBERTO',
  RINKA = 'RINKA',
  SHINICHI = 'SHINICHI'
}

export interface PersonaConfig {
  type: PersonaType;
  name: string;
  title: string; // e.g. "極端な無関心"
  themeColor: string; // Tailwind class prefix
  font: string;
  avatar: string; // Initials or symbol
  avatarStyle: string; // CSS classes for shape and color
  description: string;
  greeting: string; // Fixed static greeting part
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}