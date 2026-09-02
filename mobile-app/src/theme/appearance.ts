export type SystemAppearance = 'light' | 'dark' | null | undefined;

export function resolveSystemAppearance(system: SystemAppearance): 'light' | 'dark' {
  return system === 'dark' ? 'dark' : 'light';
}
