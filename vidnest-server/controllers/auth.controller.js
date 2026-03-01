import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database.js';
import { generateToken } from '../middleware/auth.middleware.js';
import logger from '../config/logger.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

class AuthController {
  /**
   * POST /api/v1/auth/google
   * Verify Google OAuth token and create/login user
   */
  async googleLogin(req, res) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ error: 'Google credential is required' });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture: avatar } = payload;

      logger.info('Google OAuth login attempt', { email });

      // Upsert user — create if not exists, update if exists
      const user = await prisma.user.upsert({
        where: { googleId },
        update: {
          name,
          avatar,
          email,
        },
        create: {
          googleId,
          email,
          name,
          avatar,
          role: 'user',
        },
      });

      // Generate JWT
      const token = generateToken(user.id);

      // Set httpOnly cookie
      res.cookie('vidnest_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info('User logged in successfully', { userId: user.id, email });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error('Google OAuth error', { error: error.message });
      return res.status(401).json({ error: 'Google authentication failed' });
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user
   */
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          _count: {
            select: { downloads: true },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        ...user,
        totalDownloads: user._count.downloads,
      });
    } catch (error) {
      logger.error('Get user error', { error: error.message });
      return res.status(500).json({ error: 'Failed to get user data' });
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Clear the auth cookie
   */
  async logout(req, res) {
    res.clearCookie('vidnest_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  }
}

export default new AuthController();
