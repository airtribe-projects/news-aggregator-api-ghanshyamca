// User validation functions
function validateUserRegistration(req, res, next) {
  const { email, password, name, preferences } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required and must be a non-empty string' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password is required and must be at least 6 characters long' });
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }

  // Basic email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  next();
}

function validateUserLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required and must be a non-empty string' });
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required and must be a non-empty string' });
  }

  next();
}

function validateUserPreferences(req, res, next) {
  const { preferences } = req.body;

  if (!preferences || !Array.isArray(preferences)) {
    return res.status(400).json({ error: 'Preferences must be an array' });
  }

  if (preferences.length === 0) {
    return res.status(400).json({ error: 'Preferences array cannot be empty' });
  }

  // Validate that all preferences are strings
  for (let i = 0; i < preferences.length; i++) {
    if (typeof preferences[i] !== 'string' || preferences[i].trim() === '') {
      return res.status(400).json({ error: 'All preferences must be non-empty strings' });
    }
  }

  next();
}

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserPreferences
};
