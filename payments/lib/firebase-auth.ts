import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose'
import { isManager, projectId } from './firestore'

// Verifies Firebase sign-in tokens with Google's public keys (no service account needed),
// then checks the managers list — the same two conditions the manager portal itself uses.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

export interface VerifiedManager {
  uid: string
  email: string | null
}

export async function verifyManager(req: Request): Promise<VerifiedManager | null> {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.get('authorization') ?? '')
  if (!match) return null
  const token = match[1]
  try {
    // The local Auth emulator issues unsigned tokens; only real tokens can be verified.
    const payload = process.env.FIREBASE_AUTH_EMULATOR_HOST
      ? decodeJwt(token)
      : (
          await jwtVerify(token, JWKS, {
            issuer: `https://securetoken.google.com/${projectId()}`,
            audience: projectId(),
            algorithms: ['RS256'],
          })
        ).payload
    if (typeof payload.sub !== 'string' || !payload.sub) return null
    if (!(await isManager(payload.sub, token))) return null
    return { uid: payload.sub, email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null }
  } catch {
    return null
  }
}
