const { PrismaClient } = require("@prisma/client");
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
        message: "Latitude and longitude are required fields",
      });
    }

    let deviceId = null;

    // Handle device creation/lookup if IMEI is provided
    if (locationData.imei) {
      try {
        // Check if device with this IMEI already exists
        let device = await prisma.device.findUnique({
          where: { imei: locationData.imei },
        });

        // If device doesn't exist, create a new one
        if (!device) {
          device = await prisma.device.create({
            data: {
              imei: locationData.imei,
              name: locationData.name,
              phoneNo: locationData.phoneNo,
              emailAddress: locationData.emailAddress,
            },
          });
          console.log(`Created new device with IMEI: ${locationData.imei}`);
        } else {
          console.log(`Using existing device with IMEI: ${locationData.imei}`);
        }

        deviceId = device.id;
      } catch (deviceError) {
        console.error("Error handling device:", deviceError);
        // Continue without device association if there's an error
      }
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
        deviceId: deviceId,
      },
      include: {
        device: true,
      },
    });

    // Convert BigInt to string for JSON response
    const responseData = {
      ...savedData,
      time: savedData.time ? savedData.time.toString() : null,
    };

    return res.status(201).json({
      success: true,
      message: "Location data saved successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error saving location data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save location data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all location tracking data from database
 */
exports.getAllLocationData = async (req, res) => {
  try {
    const { imei, startDate, endDate, limit = 50, offset = 0 } = req.query;

    // Build where clause dynamically based on filters
    const whereClause = {};

    // Filter by IMEI if provided
    if (imei) {
      whereClause.imei = imei;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      whereClause.createdAt = {};

      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        // Add 23:59:59 to end date to include the entire day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDateTime;
      }
    }

    // Fetch location data, total count, and devices separately
    const [locationData, totalCount, devices] = await Promise.all([
      prisma.locationData.findMany({
        where: whereClause,
        include: {
          device: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.locationData.count({
        where: whereClause,
      }),
      prisma.device.findMany({
        include: {
          _count: {
            select: { locationData: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Convert BigInt to string for JSON response in location data
    const responseLocationData = locationData.map((data) => ({
      ...data,
      time: data.time ? data.time.toString() : null,
    }));

    // Calculate pagination metadata
    const currentPage = Math.floor(parseInt(offset) / parseInt(limit)) + 1;
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return res.status(200).json({
      success: true,
      locationsData: responseLocationData,
      devices: devices,
      filters: {
        imei: imei || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      pagination: {
        currentPage: currentPage,
        totalPages: totalPages,
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        resultCount: responseLocationData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching location data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch location data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all devices
 */
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        _count: {
          select: { locationData: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch devices",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get device by IMEI
 */
exports.getDeviceByImei = async (req, res) => {
  try {
    const { imei } = req.params;

    const device = await prisma.device.findUnique({
      where: { imei },
      include: {
        locationData: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Get last 10 location records
        },
        _count: {
          select: { locationData: true },
        },
      },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Convert BigInt to string for JSON response
    const responseData = {
      ...device,
      locationData: device.locationData.map((data) => ({
        ...data,
        time: data.time ? data.time.toString() : null,
      })),
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching device:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch device",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get location data for a specific device
 */
exports.getLocationDataByImei = async (req, res) => {
  try {
    const { imei } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const device = await prisma.device.findUnique({
      where: { imei },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const locationData = await prisma.locationData.findMany({
      where: { deviceId: device.id },
      include: {
        device: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Convert BigInt to string for JSON response
    const responseData = locationData.map((data) => ({
      ...data,
      time: data.time ? data.time.toString() : null,
    }));

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching location data for device:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch location data for device",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all unique IMEIs for dropdown filter
 */
exports.getAllImeis = async (req, res) => {
  try {
    const imeis = await prisma.locationData.findMany({
      select: {
        imei: true,
      },
      distinct: ["imei"],
      where: {
        imei: {
          not: null,
        },
      },
      orderBy: {
        imei: "asc",
      },
    });

    const imeiList = imeis.map((item) => item.imei).filter(Boolean);

    return res.status(200).json({
      success: true,
      data: imeiList,
    });
  } catch (error) {
    console.error("Error fetching IMEIs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch IMEIs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
