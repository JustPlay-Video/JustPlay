/**
 * Mux API Client
 *
 * Initializes the Mux client with API credentials for server-side operations.
 * Used for creating direct uploads, managing assets, and retrieving playback IDs.
 *
 * @module lib/mux/client
 */

import Mux from '@mux/mux-node';

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error('Missing required Mux environment variables: MUX_TOKEN_ID and MUX_TOKEN_SECRET');
}

/**
 * Mux API client instance
 *
 * Provides access to Mux Video API for:
 * - Creating direct upload URLs
 * - Managing video assets
 * - Retrieving playback information
 *
 * @see https://docs.mux.com/api-reference
 */
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export default mux;
