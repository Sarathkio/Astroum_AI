# Legal Case Sources: Indian Kanoon API Integration

This document outlines the API specifications, query syntax, caching parameters, and schema details for the Indian Kanoon integration.

## Indian Kanoon API Details

Indian Kanoon is the primary source of legal cases and statutes for Indian jurisprudence.

### 1. API Authentication
Include the token in HTTP Headers:
```http
Authorization: Token <YOUR_INDIAN_KANOON_API_KEY>
```

### 2. Case Search Endpoint
- **URL**: `https://api.indiankanoon.org/search/`
- **Method**: `POST`
- **Params**:
  - `formInput`: Query search string (e.g. `Section 438 CrPC anticipatory bail supreme court`)
  - `pagenum`: Page offset (default: `0`)
- **Response Shape**:
  ```json
  {
    "category": "cases",
    "results": [
      {
        "tid": 123456,
        "title": "State of Haryana v. Bhajan Lal",
        "docsource": "Supreme Court of India",
        "publishdate": "1990-11-21",
        "headline": "A landmark case relating to quashing of FIR under Section 482 of CrPC..."
      }
    ],
    "found": 1240
  }
  ```

### 3. Case Document Metadata Endpoint
- **URL**: `https://api.indiankanoon.org/doc/<doc_id>/`
- **Method**: `GET`
- **Response Shape**: Includes raw judgement text, judge names, acts referenced, and citing status.

## Caching Strategy
To reduce latency and API cost overhead, query responses are cached locally inside the database table `ik_case_cache`.

- **Key**: Hashed search query.
- **Payload**: Parsed array of matching precedents (`tid`, `title`, `court`, `date`, `summary`).
- **TTL**: 7 days (or updated via database trigger/application check).
