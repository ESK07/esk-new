// Firestore Rules Dirty Dozen Verification Specification
export const DIRTY_DOZEN_CASES = [
  { name: 'unauthenticated-write', path: '/quotes/q1', expected: 'PERMISSION_DENIED' },
  { name: 'unverified-email-write', path: '/quotes/q1', expected: 'PERMISSION_DENIED' },
  { name: 'owner-spoof-create', path: '/quotes/q1', expected: 'PERMISSION_DENIED' },
  { name: 'role-escalation-profile', path: '/users/u1', expected: 'PERMISSION_DENIED' },
  { name: 'shadow-field-injection', path: '/tickets/t1', expected: 'PERMISSION_DENIED' },
  { name: 'oversized-id-poisoning', path: `/quotes/${'a'.repeat(200)}`, expected: 'PERMISSION_DENIED' },
  { name: 'forged-timestamp-create', path: '/notes/n1', expected: 'PERMISSION_DENIED' },
  { name: 'unbounded-serviceIds-array', path: '/quotes/q2', expected: 'PERMISSION_DENIED' },
  { name: 'oversized-notes-payload', path: '/quotes/q3', expected: 'PERMISSION_DENIED' },
  { name: 'unfiltered-list-query', path: '/quotes', expected: 'PERMISSION_DENIED' },
  { name: 'immutable-owner-update', path: '/tickets/t1', expected: 'PERMISSION_DENIED' },
  { name: 'terminal-state-mutation', path: '/tickets/t_resolved', expected: 'PERMISSION_DENIED' },
] as const;
