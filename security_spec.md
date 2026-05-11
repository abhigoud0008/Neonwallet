# security_spec.md

## Data Invariants
1. A user profile is owned by the user with the matching UID.
2. Balance should not be directly modifiable by the user (simulated in this demo, but rules should restrict it).
3. Transactions and Orders must belong to a valid user.

## The "Dirty Dozen" Payloads
1. Create a user profile with `uid` of another user. (Denied)
2. Update another user's balance. (Denied)
3. Create a transaction for another user. (Denied)
4. List transactions of another user. (Denied)
5. Inject a 1MB string into the `phone` field. (Denied)
6. Change the `identityId` of a user after creation. (Denied)
7. Delete another user's profile. (Denied)
8. Create an order for a user without authentication. (Denied)
9. Update a success order to pending. (Denied)
10. Set a legacy `createdAt` date on a new transaction. (Denied)
11. Read a user profile without being that user. (Denied)
12. Update the `referralCode` of self to a reserved code. (Denied)

## Test Runner
(Simulated conceptually as no testing framework is requested to be run here, but rules will be audited)
