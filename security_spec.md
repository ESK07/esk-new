# Firestore Security Specification

## Data Invariants
1. Every document in `/users/{userId}` can only be created, read, updated, or deleted by the verified user whose `request.auth.uid == userId`, and `role` is locked to `'client'` (no privilege escalation).
2. Every document in `/quotes/{quoteId}`, `/tickets/{ticketId}`, and `/notes/{noteId}` MUST carry `ownerId == request.auth.uid` on creation, and `ownerId` and `createdAt` are immutable across updates.
3. All string lengths, array bounds (`serviceIds.size() <= 10`), numeric ranges (`estimatedBaseline >= 0`), and server timestamps (`request.time`) are strictly enforced in rules.
4. `allow list` queries evaluate `resource.data.ownerId == request.auth.uid` directly without relying on client-side query honesty.
5. Terminal statuses (`status == 'reviewed'` on quotes, `status == 'Resolved'` on tickets) block subsequent client mutations once reached.

## Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated read or write on `/users/u1`, `/quotes/q1`, `/tickets/t1`, or `/notes/n1`.
2. Unverified email (`email_verified == false`) write attempt on any collection.
3. User `A` creating a quote with `ownerId: "user_B"` (Identity Spoofing).
4. User `A` creating a profile at `/users/user_A` with `role: "admin"` (Privilege Escalation).
5. Shadow field injection: adding `isVerified: true` or `adminOverride: true` to a quote or ticket create/update payload.
6. Oversized document ID (>128 chars or containing `$` / spaces) in `/quotes/{quoteId}`.
7. Client-forged `createdAt` or `updatedAt` timestamp differing from `request.time`.
8. Unbounded array attack: submitting `serviceIds` with 11+ entries or a non-string element.
9. Over-length `notes` (>2000 chars) or `content` (>8000 chars) Denial-of-Wallet payload.
10. Cross-owner `list` query without `where('ownerId', '==', uid)` filter.
11. Mutating `ownerId` or `createdAt` during an `update` operation on an existing quote or ticket.
12. Updating a `ticket` after `status` has already reached `'Resolved'`.
