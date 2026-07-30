const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

const RESET_EMAIL_SENT_MESSAGE = 'Am trimis instructiunile de resetare catre emailul tau.';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const isPlaceholderValue = (value = '') => {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized.includes('emailul_tau') ||
    normalized.includes('app_password') ||
    normalized.includes('your_') ||
    normalized.includes('example')
  );
};

const hasSmtpConfig = () => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && !isPlaceholderValue(SMTP_USER) && !isPlaceholderValue(SMTP_PASS));
};

const getResetUrl = (token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
};

const getClientUrl = () => {
  return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
};

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = getResetUrl(token);

  if (!transporter) {
    console.log('SMTP is not configured. Password reset URL:', resetUrl);
    return { skipped: true, resetUrl };
  }

  const from = process.env.SMTP_FROM || '"Nestify" <no-reply@nestify.local>';
  const info = await transporter.sendMail({
    from,
    to: email,
    subject: 'Resetare parola Nestify',
    text: `Am primit o solicitare pentru resetarea parolei. Acceseaza linkul urmator pentru a-ti seta o parola noua: ${resetUrl}`,
    html: `<p>Am primit o solicitare pentru resetarea parolei.</p><p>Acceseaza linkul urmator pentru a-ti seta o parola noua:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('Preview email URL:', previewUrl);
  }

  return { skipped: false };
};

const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  const clientUrl = getClientUrl();

  if (!transporter) {
    console.log('SMTP is not configured. Welcome email skipped for:', user.email);
    return { skipped: true };
  }

  const from = process.env.SMTP_FROM || '"Nestify" <no-reply@nestify.local>';
  const info = await transporter.sendMail({
    from,
    to: user.email,
    subject: 'Bine ai venit in Nestify',
    text: `Buna, ${user.name}! Contul tau Nestify a fost creat cu succes. Poti incepe de aici: ${clientUrl}`,
    html: `<p>Buna, ${user.name}!</p><p>Contul tau Nestify a fost creat cu succes.</p><p><a href="${clientUrl}">Intra in Nestify</a></p>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('Preview welcome email URL:', previewUrl);
  }

  return { skipped: false };
};

const register = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Toate campurile sunt obligatorii.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Exista deja un cont cu acest email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const allowedRoles = ['USER', 'DESIGNER'];
    const assignedRole = allowedRoles.includes(role) ? role : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
      },
    });

    if (user.role === 'DESIGNER') {
      await prisma.designerProfile.create({ data: { userId: user.id } });
    }

    const token = generateToken(user);

    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare la inregistrare.' });
  }
};

const login = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Emailul si parola sunt obligatorii.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Email sau parola incorecta.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email sau parola incorecta.' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare la autentificare.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({ message: 'Emailul este obligatoriu.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'Nu exista niciun cont asociat cu acest email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    const emailResult = await sendResetEmail(email, token);

    res.json({
      message: RESET_EMAIL_SENT_MESSAGE,
      ...(emailResult.skipped ? { resetUrl: emailResult.resetUrl } : {}),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare la trimiterea emailului de resetare.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Toate campurile sunt obligatorii.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Parolele nu coincid.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Parola trebuie sa aiba cel putin 6 caractere.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalid sau expirat.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({ message: 'Parola a fost resetata cu succes. Te poti autentifica acum.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare la resetarea parolei.' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
