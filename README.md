# Hygenco Proposal Frontend

This is the frontend application for the Hygenco Proposal system.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_PRODUCTION_API_URL=https://proposal.hygenco.in/api
   ```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Calls

The application uses a utility function to handle API calls in both local and production environments:

```typescript
import { getApiUrl } from '@/lib/utils';

// Example usage
const response = await fetch(getApiUrl('endpoint'), {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});
```

In development mode, API calls are proxied to the production API through Next.js rewrites configuration.

## Authentication

Authentication is handled through cookies. Make sure to include `credentials: 'include'` in your fetch requests to send cookies with cross-origin requests.

## Building for Production

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm start
# or
yarn start
``` 