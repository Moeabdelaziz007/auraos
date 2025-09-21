# Chronos Create Event (Placeholder)

Purpose: Server-side endpoint to create calendar events and schedule notifications.

- Endpoint (planned): POST /api/chronos/create-event
- Trusted integration: POST /api/chronos/from-action (from Synapse action extraction)
- Auth: Requires authenticated user (Core Auth)
- Inputs: { title: string, start: string, end?: string, reminder?: boolean }
- Output: { id: string, status: 'scheduled' | 'created' }

Implementation notes:
- Store events in Firestore collection `chronos_events`
- Schedule local/push notifications via Service Worker + Push API
- Respect timezone/working hours from Core settings (packages/common)

Status: Placeholder for Sprint 1 scaffold.
