/**
 * Validates location data input
 */
exports.validateLocationData = (req, res, next) => {
  const { latitude, longitude } = req.body;

  // Check required fields
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required fields",
    });
  }

  // Validate latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      message: "Latitude must be between -90 and 90 degrees",
    });
  }

  // Validate longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: "Longitude must be between -180 and 180 degrees",
    });
  }

  next();
};

/**
 * Validates device configuration data input
 */
exports.validateDeviceConfigData = (req, res, next) => {
  const configData = req.body;
  const errors = [];

  // Define valid configuration fields with their validation rules
  const configFields = {
    gpsTimer: { type: "string", required: false },
    configTimer: { type: "string", required: false },
    uploadTimer: { type: "string", required: false },
    retryCounter: { type: "string", required: false },
    angleThreshold: { type: "string", required: false },
    overSpeedingThreshold: { type: "string", required: false },
    travelStartTimer: { type: "string", required: false },
    travelStopTimer: { type: "string", required: false },
    movingTimer: { type: "string", required: false },
    stopTimer: { type: "string", required: false },
    distanceThreshold: { type: "string", required: false },
    heartbeatTimer: { type: "string", required: false },
    liveStatusUpdateTimer: { type: "string", required: false },
    baseUrl: { type: "string", required: false },
  };

  // Check if at least one configuration field is provided
  const providedFields = Object.keys(configData).filter(
    (key) =>
      Object.keys(configFields).includes(key) && configData[key] !== undefined
  );

  if (providedFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one configuration field must be provided",
      validFields: Object.keys(configFields),
    });
  }

  // Validate each provided field
  Object.keys(configData).forEach((key) => {
    if (configFields[key]) {
      const field = configFields[key];
      const value = configData[key];

      // Type validation
      if (field.type === "string" && typeof value !== "string") {
        errors.push(`${key} must be a string`);
      }

      // Special validation for numeric string fields
      if (
        [
          "gpsTimer",
          "configTimer",
          "uploadTimer",
          "retryCounter",
          "angleThreshold",
          "overSpeedingThreshold",
          "travelStartTimer",
          "travelStopTimer",
          "movingTimer",
          "stopTimer",
          "distanceThreshold",
          "heartbeatTimer",
          "liveStatusUpdateTimer",
        ].includes(key)
      ) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
          errors.push(`${key} must be a valid positive number as string`);
        }
      }

      // Special validation for baseUrl
      if (key === "baseUrl" && value) {
        try {
          new URL(value);
        } catch (e) {
          errors.push("baseUrl must be a valid URL");
        }
      }
    } else {
      errors.push(`Invalid configuration field: ${key}`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};
