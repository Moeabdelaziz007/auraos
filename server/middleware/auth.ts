import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from '../firebase';

// Extend the Express Request type to include our custom 'user' property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    // you can add other user properties from the token if needed
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or incorrect format.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await verifyToken(token);
    req.user = { id: decodedToken.uid };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
  }
};
