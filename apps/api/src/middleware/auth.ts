import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Role, User } from '@prisma/client';
import { prisma } from '../server.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: User;
}

let supabase: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }
  return supabase;
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const supabaseClient = getSupabaseClient();

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    return res.status(401).json({ error: 'Unauthorized: Empty token provided' });
  }

  try {
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const authUserId = data.user.id;
    req.userId = authUserId;

    // Auto-sync or find user in PostgreSQL
    let dbUser = await prisma.user.findUnique({ where: { id: authUserId } });
    if (!dbUser) {
      const name = data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User';
      const avatar = data.user.user_metadata?.avatar_url || null;
      dbUser = await prisma.user.create({
        data: {
          id: authUserId,
          email: data.user.email || '',
          name,
          avatar,
          role: Role.BUYER,
          isSuspended: false
        }
      });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to ${allowedRoles.join(', ')}.` });
    }
    if (req.user.isSuspended && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Account suspended: Your selling privileges have been deactivated.' });
    }
    next();
  };
};

export const requireSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  return requireRole([Role.SELLER, Role.ADMIN])(req, res, next);
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  return requireRole([Role.ADMIN])(req, res, next);
};
