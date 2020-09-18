# nmap-public-api
**THIS PACKAGE IS DEPRECATED**

Public facing data api for the naloxone map project.

## Endpoints

### GET /search

- Query parameters:
  -- query: string.

Performs a text search on the organizationName,
location.address, location.city, and location.provinceState fields.
Returns an array of non-expired kits ordered by text relevance score.

### GET /kits

- Query parameters:
  -- lat: number
  -- lon: number
  -- radius: number

  Returns all non-expired kits within specified radius of specified coordinates.

### GET /healthz

Docker healthcheck endpoint. Returns empty response with 200 status if process is healthy.

## Data structure

Both data endpoints return data in the same format.
See `src/schemas/kitArrayResponse.schema.ts` for details.

## Database

Data is stored in a mongoDB database. The database connection string
must be supplied as a docker secret.
