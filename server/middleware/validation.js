const { body, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for signup
const validateSignup = [
  body('userId')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('User ID must be 2-20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('User ID can only contain letters, numbers, hyphens, and underscores')
    .escape(),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(),
  body('pin')
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage('PIN must be 4-6 digits')
    .isNumeric()
    .withMessage('PIN must contain only numbers'),
  handleValidationErrors
];

// Validation rules for login
const validateLogin = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .escape(),
  body('pin')
    .trim()
    .notEmpty()
    .withMessage('PIN is required')
    .isNumeric()
    .withMessage('PIN must be numeric'),
  handleValidationErrors
];

// Validation rules for transactions
const validateTransaction = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .escape(),
  body('type')
    .trim()
    .isIn(['add', 'deduct'])
    .withMessage('Type must be either "add" or "deduct"'),
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000')
    .toFloat(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .escape(),
  body('addedBy')
    .trim()
    .notEmpty()
    .withMessage('Added by is required')
    .escape(),
  handleValidationErrors
];

// Validation rules for balance query
const validateBalanceQuery = [
  query('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .escape(),
  handleValidationErrors
];

// Validation rules for transaction query
const validateTransactionQuery = [
  query('userId')
    .optional()
    .trim()
    .escape(),
  query('type')
    .optional()
    .trim()
    .isIn(['add', 'deduct', ''])
    .withMessage('Type must be either "add" or "deduct"'),
  query('startDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be 0 or greater')
    .toInt(),
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateTransaction,
  validateBalanceQuery,
  validateTransactionQuery
};
