const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Create or update device configuration
 */
exports.setDeviceConfig = async (req, res) => {
  try {
    const { imei } = req.params;

    const configData = req.body;

    // Validate device exists
    const device = await prisma.device.findUnique({
      where: { imei: imei },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Check if config already exists for this device
    const existingConfig = await prisma.deviceConfig.findUnique({
      where: { deviceImei: imei },
    });

    let config;
    if (existingConfig) {
      // Update existing config
      config = await prisma.deviceConfig.update({
        where: { deviceImei: imei },
        data: {
          gpsTimer: configData.gpsTimer || existingConfig.gpsTimer,
          configTimer: configData.configTimer || existingConfig.configTimer,
          uploadTimer: configData.uploadTimer || existingConfig.uploadTimer,
          retryCounter: configData.retryCounter || existingConfig.retryCounter,
          angleThreshold:
            configData.angleThreshold || existingConfig.angleThreshold,
          overSpeedingThreshold:
            configData.overSpeedingThreshold ||
            existingConfig.overSpeedingThreshold,
          travelStartTimer:
            configData.travelStartTimer || existingConfig.travelStartTimer,
          travelStopTimer:
            configData.travelStopTimer || existingConfig.travelStopTimer,
          movingTimer: configData.movingTimer || existingConfig.movingTimer,
          stopTimer: configData.stopTimer || existingConfig.stopTimer,
          distanceThreshold:
            configData.distanceThreshold || existingConfig.distanceThreshold,
          heartbeatTimer:
            configData.heartbeatTimer || existingConfig.heartbeatTimer,
          liveStatusUpdateTimer:
            configData.liveStatusUpdateTimer ||
            existingConfig.liveStatusUpdateTimer,
          baseUrl: configData.baseUrl || existingConfig.baseUrl,
        },
        include: {
          device: {
            select: {
              id: true,
              imei: true,
              name: true,
            },
          },
        },
      });
    } else {
      // Create new config
      config = await prisma.deviceConfig.create({
        data: {
          deviceImei: imei,
          gpsTimer: configData.gpsTimer,
          configTimer: configData.configTimer,
          uploadTimer: configData.uploadTimer,
          retryCounter: configData.retryCounter,
          angleThreshold: configData.angleThreshold,
          overSpeedingThreshold: configData.overSpeedingThreshold,
          travelStartTimer: configData.travelStartTimer,
          travelStopTimer: configData.travelStopTimer,
          movingTimer: configData.movingTimer,
          stopTimer: configData.stopTimer,
          distanceThreshold: configData.distanceThreshold,
          heartbeatTimer: configData.heartbeatTimer,
          liveStatusUpdateTimer: configData.liveStatusUpdateTimer,
          baseUrl: configData.baseUrl,
        },
        include: {
          device: {
            select: {
              id: true,
              imei: true,
              name: true,
            },
          },
        },
      });
    }

    return res.status(existingConfig ? 200 : 201).json({
      success: true,
      message: `Device configuration ${
        existingConfig ? "updated" : "created"
      } successfully`,
      data: config,
    });
  } catch (error) {
    console.error("Error setting device config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set device configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get device configuration by device ID
 */
exports.getDeviceConfig = async (req, res) => {
  try {
    const { imei } = req.params;

    // Validate device exists
    const device = await prisma.device.findUnique({
      where: { imei: imei },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Get device config
    const config = await prisma.deviceConfig.findUnique({
      where: { deviceImei: imei },
      include: {
        device: {
          select: {
            id: true,
            imei: true,
            name: true,
          },
        },
      },
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found for this device",
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching device config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch device configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get device configuration by IMEI
 */
exports.getDeviceConfigByImei = async (req, res) => {
  try {
    const { imei } = req.params;

    // Find device by IMEI
    const device = await prisma.device.findUnique({
      where: { imei: imei },
      include: {
        config: true,
      },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    if (!device.config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found for this device",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...device.config,
        device: {
          id: device.id,
          imei: device.imei,
          name: device.name,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching device config by IMEI:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch device configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all device configurations
 */
exports.getAllDeviceConfigs = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const configs = await prisma.deviceConfig.findMany({
      include: {
        device: {
          select: {
            id: true,
            imei: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const totalCount = await prisma.deviceConfig.count();

    return res.status(200).json({
      success: true,
      data: configs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching all device configs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch device configurations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete device configuration
 */
exports.deleteDeviceConfig = async (req, res) => {
  try {
    const { imei } = req.params;

    // Check if config exists
    const existingConfig = await prisma.deviceConfig.findUnique({
      where: { deviceImei: imei },
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found for this device",
      });
    }

    // Delete config
    await prisma.deviceConfig.delete({
      where: { deviceImei: imei },
    });

    return res.status(200).json({
      success: true,
      message: "Device configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting device config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete device configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get default configuration
 */
exports.getDefaultConfig = async (req, res) => {
  try {
    // Get the first (and should be only) default config record
    let defaultConfig = await prisma.defaultConfig.findFirst();

    // If no default config exists, create one with default values
    if (!defaultConfig) {
      defaultConfig = await prisma.defaultConfig.create({
        data: {
          gpsTimer: "5",
          configTimer: "60",
          uploadTimer: "10",
          retryCounter: "10",
          angleThreshold: "45",
          overSpeedingThreshold: "60",
          travelStartTimer: "20",
          travelStopTimer: "20",
          movingTimer: "60",
          stopTimer: "130",
          distanceThreshold: "1000",
          heartbeatTimer: "30",
          liveStatusUpdateTimer: "30",
          baseUrl:
            "https://connectlive.commtw.com:446/twconnectlive/TrackingServices.asmx",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: defaultConfig,
    });
  } catch (error) {
    console.error("Error fetching default config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch default configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update default configuration
 */
exports.updateDefaultConfig = async (req, res) => {
  try {
    const configData = req.body;

    // Get existing default config or create if none exists
    let defaultConfig = await prisma.defaultConfig.findFirst();

    if (!defaultConfig) {
      // Create new default config
      defaultConfig = await prisma.defaultConfig.create({
        data: {
          gpsTimer: configData.gpsTimer || "5",
          configTimer: configData.configTimer || "60",
          uploadTimer: configData.uploadTimer || "10",
          retryCounter: configData.retryCounter || "10",
          angleThreshold: configData.angleThreshold || "45",
          overSpeedingThreshold: configData.overSpeedingThreshold || "60",
          travelStartTimer: configData.travelStartTimer || "20",
          travelStopTimer: configData.travelStopTimer || "20",
          movingTimer: configData.movingTimer || "60",
          stopTimer: configData.stopTimer || "130",
          distanceThreshold: configData.distanceThreshold || "1000",
          heartbeatTimer: configData.heartbeatTimer || "30",
          liveStatusUpdateTimer: configData.liveStatusUpdateTimer || "30",
          baseUrl:
            configData.baseUrl ||
            "https://connectlive.commtw.com:446/twconnectlive/TrackingServices.asmx",
        },
      });
    } else {
      // Update existing default config
      defaultConfig = await prisma.defaultConfig.update({
        where: { id: defaultConfig.id },
        data: {
          gpsTimer:
            configData.gpsTimer !== undefined
              ? configData.gpsTimer.toString()
              : defaultConfig.gpsTimer,
          configTimer:
            configData.configTimer !== undefined
              ? configData.configTimer.toString()
              : defaultConfig.configTimer,
          uploadTimer:
            configData.uploadTimer !== undefined
              ? configData.uploadTimer.toString()
              : defaultConfig.uploadTimer,
          retryCounter:
            configData.retryCounter !== undefined
              ? configData.retryCounter.toString()
              : defaultConfig.retryCounter,
          angleThreshold:
            configData.angleThreshold !== undefined
              ? configData.angleThreshold.toString()
              : defaultConfig.angleThreshold,
          overSpeedingThreshold:
            configData.overSpeedingThreshold !== undefined
              ? configData.overSpeedingThreshold.toString()
              : defaultConfig.overSpeedingThreshold,
          travelStartTimer:
            configData.travelStartTimer !== undefined
              ? configData.travelStartTimer.toString()
              : defaultConfig.travelStartTimer,
          travelStopTimer:
            configData.travelStopTimer !== undefined
              ? configData.travelStopTimer.toString()
              : defaultConfig.travelStopTimer,
          movingTimer:
            configData.movingTimer !== undefined
              ? configData.movingTimer.toString()
              : defaultConfig.movingTimer,
          stopTimer:
            configData.stopTimer !== undefined
              ? configData.stopTimer.toString()
              : defaultConfig.stopTimer,
          distanceThreshold:
            configData.distanceThreshold !== undefined
              ? configData.distanceThreshold.toString()
              : defaultConfig.distanceThreshold,
          heartbeatTimer:
            configData.heartbeatTimer !== undefined
              ? configData.heartbeatTimer.toString()
              : defaultConfig.heartbeatTimer,
          liveStatusUpdateTimer:
            configData.liveStatusUpdateTimer !== undefined
              ? configData.liveStatusUpdateTimer.toString()
              : defaultConfig.liveStatusUpdateTimer,
          baseUrl: configData.baseUrl || defaultConfig.baseUrl,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Default configuration updated successfully",
      data: defaultConfig,
    });
  } catch (error) {
    console.error("Error updating default config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update default configuration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
