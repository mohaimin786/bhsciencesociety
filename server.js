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

const app = express();

// Initialize databases
const db = new Datastore({ filename: 'submissions.db', autoload: true });
const usersDb = new Datastore({ filename: 'users.db', autoload: true });

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

// Improved Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,   // 10 seconds
  socketTimeout: 10000      // 10 seconds
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

// Improved email sending function
async function sendApprovalEmail(email, fullName, password) {
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

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('Server is ready to take our messages');

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check your email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection error - check your network or SMTP settings');
    }
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
app.post('/api/admin/login', loginLimiter, express.json(), function (req, res) {
  const { username, password } = req.body;

  if (username === ADMIN_CREDENTIALS.username && bcrypt.compareSync(password, ADMIN_CREDENTIALS.password)) {
    req.session.authenticated = true;
    req.session.user = { username: username };
    return res.json({ success: true });
  }

  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.post('/api/admin/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.json({ success: true });
  });
});

app.get('/api/admin/status', function (req, res) {
  res.json({ authenticated: !!req.session.authenticated });
});

app.post('/api/user/login', express.json(), function (req, res) {
  const { email, password } = req.body;

  usersDb.findOne({ email }, function (err, user) {
    if (err || !user) {
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
  });
});

app.post('/api/user/logout', function (req, res) {
  req.session.destroy(function (err) {
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

app.post('/api/submit', submissionLimiter, express.json(), function (req, res) {
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

  db.insert(submission, function (err, doc) {
    if (err)
      return res.status(500).json({ success: false, error: 'Database error' });
    console.log(
      'New submission from IP:',
      req.ip,
      'at',
      new Date()
    );
    res.json({ success: true, id: doc._id });
  });
});

app.get('/api/submissions', requireAuth, function (req, res) {
  db.find({})
    .sort({ timestamp: -1 })
    .exec(function (err, docs) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, data: docs });
    });
});

app.get('/api/submissions/export', requireAuth, function (req, res) {
  db.find({})
    .sort({ timestamp: -1 })
    .exec(function (err, docs) {
      if (err) {
        console.error('Export error:', err);
        return res.status(500).json({ success: false, error: 'Export failed' });
      }

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
    });
});

app.delete('/api/submissions/bulk-delete', requireAuth, express.json(), (req, res) => {
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

    db.remove({ _id: { $in: validIds } }, { multi: true }, (err, numRemoved) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database operation failed' 
        });
      }

      res.json({ 
        success: true, 
        deleted: numRemoved,
        message: `Deleted ${numRemoved} submissions`
      });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.put('/api/submissions/:id', requireAuth, async function (req, res) {
  try {
    const { status, notes } = req.body;
    
    db.update(
      { _id: req.params.id },
      { $set: { status, notes: notes || '' } },
      {},
      async function (err, numReplaced) {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (status === 'approved') {
          db.findOne({ _id: req.params.id }, async (err, submission) => {
            if (err || !submission) {
              console.error('Error finding submission:', err);
              return res.json({ success: true, updated: numReplaced });
            }

            usersDb.findOne({ email: submission.email }, async (err, existingUser) => {
              if (err) {
                console.error('Error checking for existing user:', err);
                return res.json({ success: true, updated: numReplaced });
              }

              if (!existingUser) {
                const password = generatePassword();
                const hashedPassword = bcrypt.hashSync(password, 10);

                const newUser = {
                  email: submission.email,
                  password: hashedPassword,
                  fullName: submission.fullName,
                  role: 'member',
                  createdAt: new Date(),
                  verified: false
                };

                usersDb.insert(newUser, async (err) => {
                  if (err) {
                    console.error('Error creating user account:', err);
                    return res.json({ success: true, updated: numReplaced });
                  }

                  const emailSent = await sendApprovalEmail(submission.email, submission.fullName, password);
                  if (!emailSent) {
                    console.error('Failed to send approval email to:', submission.email);
                  }
                });
              }
            });
          });
        }

        res.json({ success: true, updated: numReplaced });
      }
    );
  } catch (err) {
    console.error('Error in submission update:', err);
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

    db.update(
      { _id: { $in: ids } },
      { $set: { status } },
      { multi: true },
      async (err, numUpdated) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (status === 'approved') {
          const submissions = await new Promise((resolve) => {
            db.find({ _id: { $in: ids } }, (err, docs) => {
              if (err) return resolve([]);
              resolve(docs);
            });
          });

          for (const submission of submissions) {
            const existingUser = await new Promise((resolve) => {
              usersDb.findOne({ email: submission.email }, (err, user) => {
                if (err) return resolve(null);
                resolve(user);
              });
            });

            if (!existingUser) {
              const password = generatePassword();
              const hashedPassword = bcrypt.hashSync(password, 10);

              const newUser = {
                email: submission.email,
                password: hashedPassword,
                fullName: submission.fullName,
                role: 'member',
                createdAt: new Date(),
                verified: false
              };

              await new Promise((resolve) => {
                usersDb.insert(newUser, (err) => {
                  if (err) console.error('Error creating user:', err);
                  resolve();
                });
              });

              const emailSent = await sendApprovalEmail(submission.email, submission.fullName, password);
              if (!emailSent) {
                console.error('Failed to send approval email to:', submission.email);
              }
            }
          }
        }

        res.json({ success: true, updated: numUpdated });
      }
    );
  } catch (err) {
    console.error('Error in bulk update:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/submissions/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  
  db.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error' 
      });
    }
    
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
  });
});

// Static file routes
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', function (req, res) {
  if (!req.session.authenticated) {
    return res.redirect('/admin-login');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-login', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Server running on port', PORT);
  console.log('Email service configured for:', process.env.EMAIL_HOST || 'Gmail');
  console.log('Admin username:', ADMIN_CREDENTIALS.username);
});