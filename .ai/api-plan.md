# REST API Plan

## 1. Resources
- **notes**: `public.notes` table (id, user_id, content, is_ai_generated, created_at, updated_at).
- **profiles**: `public.profiles` table (id, created_at, updated_at).
- **ai_suggestions**: logical resource for AI suggestion generation.

## 2. Endpoints

### Notes Resource

#### GET /api/notes
- Description: List authenticated user’s notes (user-created). Supports pagination, sorting, and filtering by note type.
- Query Parameters:
  - `page` (int, default=1)
  - `limit` (int, default=20)
  - `sort` (string, default="created_at.desc")
  - `type` (string, optional; values `user` or `ai`): alias for filtering `is_ai_generated=false` (user-created) or `is_ai_generated=true` (AI-generated).
- Response 200:
  ```json
  {
    "data": [
      { "id": "uuid", "content": "string", "created_at": "timestamp", "updated_at": "timestamp" },
      ...
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- Errors:
  - 401 Unauthorized

#### GET /api/notes/ai
- Description: List authenticated user’s notes (AI-generated).
- Query Parameters:
  - `page` (int, default=1)
  - `limit` (int, default=20)
  - `sort` (string, default="created_at.desc")
- Response 200:
  ```json
  {
    "data": [
      { "id": "uuid", "content": "string", "created_at": "timestamp", "updated_at": "timestamp" },
      ...
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- Errors:
  - 401 Unauthorized

#### POST /api/note
- Description: Create a new user note (user-created only, `is_ai_generated=false`).
- Request Body:
  ```json
  { "content": "string (max 5000 chars)" }
  ```
- Response 201:
  ```json
  { "id": "uuid", "content": "string", "created_at": "timestamp", "updated_at": "timestamp" }
  ```
- Errors:
  - 400 Bad Request (validation failed)
  - 401 Unauthorized

#### GET /api/note/{id}
- Description: Retrieve a single note by ID belonging to authenticated user.
- Path Parameter: `id` (uuid)
- Response 200:
  ```json
  { "id": "uuid", "content": "string", "is_ai_generated": boolean, "created_at": "timestamp", "updated_at": "timestamp" }
  ```
- Errors:
  - 401 Unauthorized
  - 404 Not Found

#### PUT /api/note/{id}
- Description: Update content of a user-created note (`is_ai_generated=false`).
- Path Parameter: `id` (uuid)
- Request Body:
  ```json
  { "content": "string (max 5000 chars)" }
  ```
- Response 200:
  ```json
  { "id": "uuid", "content": "string", "is_ai_generated": false, "created_at": "timestamp", "updated_at": "timestamp" }
  ```
- Errors:
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden (attempt to modify AI-generated note)
  - 404 Not Found

#### DELETE /api/note/{id}
- Description: Delete a note (user-created or AI-generated) belonging to authenticated user.
- Path Parameter: `id` (uuid)
- Response 204 No Content
- Errors:
  - 401 Unauthorized
  - 404 Not Found

### Profiles Resource

#### GET /api/profile
- Description: Retrieve authenticated user’s profile.
- Response 200:
  ```json
  { "id": "uuid", "created_at": "timestamp", "updated_at": "timestamp" }
  ```
- Errors:
  - 401 Unauthorized
  - 404 Not Found

### AI Suggestions Resource

#### POST /api/suggestion
- Description: Generate AI-based suggestions for the authenticated user based on provided non-AI note IDs.
- Request Body:
  ```json
  { "note_ids": ["uuid", ...] }
  ```
- Response 200:
  ```json
  { "suggestions": ["string", ...] }
  ```
- Errors:
  - 400 Bad Request (invalid or non-AI note IDs)
  - 401 Unauthorized
  - 502 Bad Gateway (AI service error)

#### POST /api/note/ai
- Description: Save an AI-generated suggestion as a note (`is_ai_generated=true`) for the authenticated user.
- Request Body:
  ```json
  { "content": "string (max 5000 chars)" }
  ```
- Response 201:
  ```json
  { "id": "uuid", "content": "string", "created_at": "timestamp", "updated_at": "timestamp" }
  ```
- Errors:
  - 400 Bad Request (validation failed)
  - 401 Unauthorized
  - 502 Bad Gateway 

## 3. Authentication & Authorization
- Mechanism: Supabase JWT via HTTP header `Authorization: Bearer <token>`.
- Middleware: Astro middleware attaches `context.locals.supabase` to handle auth.
- RLS on database ensures user can only access their own data.

## 4. Validation & Business Logic
- **Content length**: max 5000 chars (`CHECK length(content) <= 5000`).
- **Insert/Update rules**: Only user-created notes (`is_ai_generated=false`) can be created/updated by user; validated in API layer before DB.
- **AI-generated notes**: Creation handled by backend function with service role; user cannot set `is_ai_generated=true` on POST /api/notes.
- **Pagination & Sorting**: Implement limit/offset and `order by created_at desc` by default.

## 5. Performance & Security Considerations
- Use database indexes on `user_id` and `created_at` to optimize listing queries.
- Rate limiting: apply per-user rate limit on POST /api/ai/suggestions to prevent abuse.
- Input sanitization: trim and escape content to prevent injection.
- Use HTTPS and secure environment variables in deployment.
