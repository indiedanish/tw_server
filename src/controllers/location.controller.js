const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Save location tracking data to the database
 */
exports.saveLocationData = async (req, res) => {
  try {
    // Get data from request body
    const locationData = req.body;

    // Basic validation for required fields
    if (!locationData.latitude || !locationData.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required fields',
      });
    }

    // Save data to database
    const savedData = await prisma.locationData.create({
      data: {
        accuracy: locationData.accuracy,
        altitude: locationData.altitude,
        bearing: locationData.bearing,
        deviceRDT: locationData.deviceRDT,
        emailAddress: locationData.emailAddress,
        gmtSettings: locationData.gmtSettings,
        igStatus: locationData.igStatus,
        imei: locationData.imei,
        latitude: locationData.latitude,
        localPrimaryId: locationData.localPrimaryId,
        longitude: locationData.longitude,
        name: locationData.name,
        phoneNo: locationData.phoneNo,
        provider: locationData.provider,
        reason: locationData.reason,
        speed: locationData.speed,
        time: locationData.time ? BigInt(locationData.time) : null,
        versionNo: locationData.versionNo,
      },
    });

    // Convert BigInt to string for JSON response
    const responseData = {
      ...savedData,
      time: savedData.time ? savedData.time.toString() : null,
    };

    return res.status(201).json({
      success: true,
      message: 'Location data saved successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Error saving location data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save location data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all location tracking data from database
 */
exports.getAllLocationData = async (req, res) => {
  try {
    const locationData = await prisma.locationData.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert BigInt to string for JSON response
    const responseData = locationData.map(data => ({
      ...data,
      time: data.time ? data.time.toString() : null,
    }));

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Error fetching location data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};