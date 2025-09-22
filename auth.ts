import express from 'express';
import admin from 'firebase-admin';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// تعريف نوع مخصص للـ Request لتضمين الجلسة
interface AuthRequest extends express.Request {
  session: express.Request['session'] & {
    userId?: string;
    user?: object;
  };
}

router.post('/google-signin', async (req: AuthRequest, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'ID token is missing.' });
  }

  try {
    // 1. التحقق من الرمز باستخدام Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Email not available from Google account.' });
    }

    // 2. البحث عن المستخدم في قاعدة البيانات
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // 3. إذا لم يكن المستخدم موجودًا، قم بإنشاء سجل جديد له
      console.log(`Creating new user: ${email}`);
      const newUserResult = await db.insert(users).values({
        id: uid, // استخدام Firebase UID كمعرف أساسي
        email: email,
        fullName: name,
        avatarUrl: picture,
      }).returning();
      user = newUserResult[0];
    }

    // 4. إنشاء جلسة للمستخدم
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      avatar: user.avatarUrl,
    };

    console.log(`Session created for user: ${user.email}`);
    res.status(200).json({ message: 'Sign-in successful', user: req.session.user });

  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
});

export default router;
