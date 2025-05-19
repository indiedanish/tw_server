/**
 * Validates location data input
 */
exports.validateLocationData = (req, res, next) => {
  const { latitude, longitude } = req.body;

  // Check required fields
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required fields',
    });
  }

  // Validate latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be between -90 and 90 degrees',
    });
  }

  // Validate longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be between -180 and 180 degrees',
    });
  }

  next();
};