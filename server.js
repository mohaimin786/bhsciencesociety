const express = require('express');
const Datastore = require('nedb');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { promisify } = require('util');

const app = express();

// Initialize databases
const db = new Datastore({ filename: 'submissions.db', autoload: true });
const usersDb = new Datastore({ filename: 'users.db', autoload: true });

// Promisify database methods
const dbFind = promisify(db.find.bind(db));
const dbFindOne = promisify(db.findOne.bind(db));
const dbUpdate = promisify(db.update.bind(db));
const dbRemove = promisify(db.remove.bind(db));
const dbInsert = promisify(db.insert.bind(db));

const usersDbFindOne = promisify(usersDb.findOne.bind(usersDb));
const usersDbInsert = promisify(usersDb.insert.bind(usersDb));

// Generate or use environment secret key
const secretKey = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Configure session
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  })
);

// Security middleware
app.set('trust proxy', true);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS configuration
app.use(function (req, res, next) {
  res.header(
    'Access-Control-Allow-Origin',
    'https://stackblitzstartersuogm5vlf-qlly--3000--b5a27d10.local-credentialless.webcontainer.io/'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later',
});

const submissionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: 'You have reached the maximum number of submissions allowed per day (3). Please try again tomorrow.',
  keyGenerator: function (req) {
    var forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      var ips = forwarded.split(',');
      return ips[0].trim();
    }
    return req.connection.remoteAddress;
  },
  handler: function (req, res) {
    console.log('Rate limit exceeded for IP:', req.headers['x-forwarded-for'] || req.ip);
    res.status(429).json({
      success: false,
      error: 'You have reached the maximum number of submissions allowed per day (3). Please try again tomorrow.',
    });
  },
  skip: function (req, res) {
    return req.session.authenticated;
  },
  onLimitReached: function (req) {
    console.log('Rate limit reached for', req.headers['x-forwarded-for'] || req.ip, 'at', new Date());
  },
});

const ipinfoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many IP info requests, please try again later',
});

// Email configuration check
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('WARNING: Email credentials not configured. Email functionality will be disabled.');
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Password generator
function generatePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Email sending functions
async function sendApprovalEmail(email, fullName, password) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not sent - no email configuration');
    return false;
  }

  try {
    const mailOptions = {
      from: `"BHSS Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your BHSS Application Has Been Approved',
      html: `
        <h2>Welcome to Bloomfield Hall Science Society!</h2>
        <p>We're pleased to inform you that your application has been approved.</p>
        <p>Your account has been created with the following credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in at <a href="https://yourwebsite.com/login">our website</a> and change your password immediately.</p>
        <p>If you didn't request this, please contact us immediately.</p>
        <p>Best regards,<br>BHSS Council</p>
      `
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
}

async function sendRejectionEmail(email, fullName) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not sent - no email configuration');
    return false;
  }

  try {
    const mailOptions = {
      from: `"BHSS Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your BHSS Application Status',
      html: `
        <h2>Dear ${fullName},</h2>
        <p>We regret to inform you that your application to the Bloomfield Hall Science Society has not been successful.</p>
        <p>We appreciate your interest and encourage you to apply again in the future.</p>
        <p>Best regards,<br>BHSS Council</p>
      `
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return false;
  }
}

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USER || 'BHSS_COUNCIL',
  password: process.env.ADMIN_PASS
    ? bcrypt.hashSync(process.env.ADMIN_PASS, 10)
    : bcrypt.hashSync('temporary1234', 10),
};

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  res.status(403).json({ error: 'Authentication required' });
}

function requireUserAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(403).json({ error: 'Authentication required' });
}

// Routes
app.post('/api/admin/login', loginLimiter, express.json(), async (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && bcrypt.compareSync(password, ADMIN_CREDENTIALS.password)) {
    req.session.authenticated = true;
    req.session.user = { username: username };
    return res.json({ success: true });
  }

  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.json({ success: true });
  });
});

app.get('/api/admin/status', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

app.post('/api/user/login', express.json(), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersDbFindOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      req.session.userId = user._id;
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
      
      return res.json({ 
        success: true,
        user: {
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/user/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.json({ success: true });
  });
});

app.get('/api/ipinfo', ipinfoLimiter, async (req, res) => {
  try {
    const forwardedHeader = req.headers['x-forwarded-for'];
    const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : req.ip;

    const apiKey = process.env.IPAPI_KEY || '';
    const ipapiUrl = apiKey
      ? `https://ipapi.co/${clientIp}/json/?key=${apiKey}`
      : 'https://ipapi.co/json/';
    const fallbackUrl = 'https://ipwhois.app/json/';

    let response = await fetch(ipapiUrl);

    if (!response.ok) {
      response = await fetch(fallbackUrl);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Both IP API services failed');
    }

    const data = await response.json();

    res.json({
      country: data.country || data.country_name,
      countryCode: data.country_code,
      ip: data.ip,
    });
  } catch (error) {
    console.error('IP detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not detect location',
      fallback: true,
    });
  }
});

app.post('/api/submit', submissionLimiter, express.json(), async (req, res) => {
  try {
    if (
      !req.body.fullName ||
      !req.body.email ||
      !req.body.phone ||
      !req.body.dob ||
      !req.body.grade ||
      !req.body.isBhStudent
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'All required fields must be filled' });
    }

    if (!req.body.subjects || req.body.subjects.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Please select at least one subject' });
    }

    if (!req.body.motivation || req.body.motivation.length < 50) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Motivation must be at least 50 characters long',
        });
    }

    if (req.body.isBhStudent === 'yes' && !req.body.section) {
      return res
        .status(400)
        .json({ success: false, error: 'Section is required for BH students' });
    }

    if (
      req.body.isBhStudent === 'no' &&
      (!req.body.country || !req.body.school)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Country and School are required for non-BH students',
        });
    }

    const submission = {
      fullName: req.body.fullName,
      email: req.body.email,
      countryCode: req.body.countryCode,
      phone: req.body.phone,
      dob: req.body.dob,
      grade: req.body.grade,
      isBhStudent: req.body.isBhStudent === 'yes',
      bhBranch: req.body.bhBranch || null,
      section: req.body.section || null,
      city: req.body.city || null,
      school: req.body.school || null,
      country: req.body.country || null,
      subjects: req.body.subjects,
      category: req.body.category || null,
      motivation: req.body.motivation,
      whyChosenSubjects: req.body.whyChosenSubjects || null,
      heardAbout: req.body.heardAbout || null,
      social: req.body.social || null,
      prevCompetitions: req.body.prevCompetitions || null,
      skills: req.body.skills || null,
      ideas: req.body.ideas || null,
      status: 'pending',
      timestamp: new Date(),
    };

    const doc = await dbInsert(submission);
    console.log('New submission from IP:', req.ip, 'at', new Date());
    res.json({ success: true, id: doc._id });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/submissions', requireAuth, async (req, res) => {
  try {
    const docs = await dbFind({}).sort({ timestamp: -1 }).exec();
    res.json({ success: true, data: docs });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
app.get('/api/submissions/export', requireAuth, async (req, res) => {
  try {
    const docs = await dbFind({}).sort({ timestamp: -1 }).exec();

    let csv = 'Full Name,Email,Country Code,Phone Number,Date of Birth,Grade,Is BH Student,Country,School Name,Subjects,Motivation\n';

    docs.forEach(function (sub) {
      const escapeCsv = (str) => {
        if (!str) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
      };

      const subjects = sub.subjects ? sub.subjects.join('; ') : '';

      csv += [
        escapeCsv(sub.fullName),
        escapeCsv(sub.email),
        escapeCsv(sub.countryCode),
        escapeCsv(sub.phone),
        escapeCsv(sub.dob),
        escapeCsv(sub.grade),
        escapeCsv(sub.isBhStudent ? 'Yes' : 'No'),
        escapeCsv(sub.country),
        escapeCsv(sub.school),
        escapeCsv(subjects),
        escapeCsv(sub.motivation)
      ].join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=submissions-' +
        new Date().toISOString().slice(0, 10) +
        '.csv'
    );
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, error: 'Export failed' });
  }
});

app.delete('/api/submissions/bulk-delete', requireAuth, express.json(), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ 
        success: false, 
        error: 'IDs must be provided as an array' 
      });
    }

    const validIds = ids.map(id => String(id)).filter(id => id.trim().length > 0);

    if (validIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid IDs provided' 
      });
    }

    const numRemoved = await dbRemove({ _id: { $in: validIds } }, { multi: true });
    
    res.json({ 
      success: true, 
      deleted: numRemoved,
      message: `Deleted ${numRemoved} submissions`
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.put('/api/submissions/:id', requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // First update the submission
    const submission = await new Promise((resolve, reject) => {
      db.update(
        { _id: req.params.id },
        { $set: { status, notes: notes || '' } },
        { returnUpdatedDocs: true },
        function (err, numReplaced, affectedDocument) {
          if (err) return reject(err);
          resolve(affectedDocument);
        }
      );
    });

    // Handle email sending based on status
    if (status === 'approved') {
      const existingUser = await usersDbFindOne({ email: submission.email });
      
      if (!existingUser) {
        const password = generatePassword();
        const hashedPassword = bcrypt.hashSync(password, 10);

        await usersDbInsert({
          email: submission.email,
          password: hashedPassword,
          fullName: submission.fullName,
          role: 'member',
          createdAt: new Date(),
          verified: false
        });

        // Send email without waiting for completion
        sendApprovalEmail(submission.email, submission.fullName, password)
          .catch(err => console.error('Email error:', err));
      }
    } else if (status === 'rejected') {
      // Send rejection email without waiting for completion
      sendRejectionEmail(submission.email, submission.fullName)
        .catch(err => console.error('Email error:', err));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Submission update error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/submissions/bulk-update', requireAuth, express.json(), async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Invalid submission IDs' });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // Update all submissions
    const numUpdated = await new Promise((resolve, reject) => {
      db.update(
        { _id: { $in: ids } },
        { $set: { status } },
        { multi: true },
        (err, numUpdated) => {
          if (err) return reject(err);
          resolve(numUpdated);
        }
      );
    });

    // If approved, create accounts and send emails
    if (status === 'approved') {
      const submissions = await dbFind({ _id: { $in: ids } });

      // Process each submission in parallel
      await Promise.all(submissions.map(async (submission) => {
        const existingUser = await usersDbFindOne({ email: submission.email });

        if (!existingUser) {
          const password = generatePassword();
          const hashedPassword = bcrypt.hashSync(password, 10);

          await usersDbInsert({
            email: submission.email,
            password: hashedPassword,
            fullName: submission.fullName,
            role: 'member',
            createdAt: new Date(),
            verified: false
          });

          // Send email without waiting for completion
          sendApprovalEmail(submission.email, submission.fullName, password)
            .catch(err => console.error('Email error:', err));
        }
      }));
    } else if (status === 'rejected') {
      const submissions = await dbFind({ _id: { $in: ids } });
      
      // Send rejection emails without waiting for completion
      submissions.forEach(submission => {
        sendRejectionEmail(submission.email, submission.fullName)
          .catch(err => console.error('Email error:', err));
      });
    }

    res.json({ success: true, updated: numUpdated });
  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/submissions/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const numRemoved = await dbRemove({ _id: id });
    
    if (numRemoved === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Submission not found' 
      });
    }
    
    res.json({ 
      success: true,
      deleted: numRemoved
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database error' 
    });
  }
});

// Test email endpoint
app.get('/api/test-email', requireAuth, async (req, res) => {
  try {
    const success = await sendApprovalEmail(
      'test@example.com', 
      'Test User', 
      'testpassword'
    );
    
    res.json({
      success,
      message: success 
        ? 'Test email sent successfully' 
        : 'Failed to send test email'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Email test failed',
      details: err.message
    });
  }
});

// Static file routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect('/admin-login');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
  console.log('Email service configured for:', process.env.EMAIL_HOST || 'Gmail');
  console.log('Admin username:', ADMIN_CREDENTIALS.username);
});