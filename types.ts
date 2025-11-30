export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  latex: string | null;
  error: string | null;
}
