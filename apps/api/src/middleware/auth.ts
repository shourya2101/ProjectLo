import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

export interface AuthRequest extends Request {
  userId?: string;
}

let supabase: ReturnType<typeof createClient> | null = null;

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // This officially supported method fetches the user securely and verifies the signature, expiration, and issuer.
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.userId = data.user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
