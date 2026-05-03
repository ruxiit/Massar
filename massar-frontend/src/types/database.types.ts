export type Role = 'etudiant' | 'directeur' | 'departement' | 'faculte';

export type DossierStatus = 
  | 'depose' 
  | 'progres_verifie' 
  | 'plagiat_verifie' 
  | 'jury_propose' 
  | 'planifie' 
  | 'delibere' 
  | 'pv_genere' 
  | 'archive';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  matricule?: string;
}

export interface Dossier {
  id: string;
  student_id: string;
  document_url: string;
  resume: string;
  status: DossierStatus;
  plagiarism_score?: number;
  created_at: string;
}

export interface Soutenance {
  id: string;
  dossier_id: string;
  date_soutenance?: string; // Changed from Date to string for frontend compatibility if needed, or keep Date
  salle?: string;
  president_id?: string;
  examinateur_id?: string;
  pv_url?: string;
}
