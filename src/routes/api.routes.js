const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");
const configController = require("../controllers/config.controller");
const {
  validateDeviceConfigData,
} = require("../middleware/validation.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       required:
 *         - imei
 *       properties:
 *         id:
 *           type: integer
 *           description: Device ID
 *         imei:
 *           type: string
 *           description: Unique IMEI number of the device
 *         name:
 *           type: string
 *           description: Device name
 *         phoneNo:
 *           type: string
 *           description: Phone number associated with device
 *         emailAddress:
 *           type: string
 *           description: Email address associated with device
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Device creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Device last update timestamp
 *       example:
 *         id: 1
 *         imei: "865632050026800"
 *         name: "Tracker Device 1"
 *         phoneNo: "TST123"
 *         emailAddress: "device@example.com"
 *         createdAt: "2025-01-30T02:04:27.703Z"
 *         updatedAt: "2025-01-30T02:04:27.703Z"
 *     LocationData:
 *       type: object
 *       required:
 *         - latitude
 *         - longitude
 *       properties:
 *         accuracy:
 *           type: number
 *           description: Accuracy of the location data in meters
 *         altitude:
 *           type: number
 *           description: Altitude in meters
 *         bearing:
 *           type: number
 *           description: Bearing in degrees
 *         deviceRDT:
 *           type: string
 *           description: Device date and time
 *         emailAddress:
 *           type: string
 *           description: Email address of the user
 *         gmtSettings:
 *           type: string
 *           description: GMT settings of the device
 *         igStatus:
 *           type: integer
 *           description: Ignition status
 *         imei:
 *           type: string
 *           description: IMEI number of the device
 *         latitude:
 *           type: number
 *           description: Latitude coordinate
 *         localPrimaryId:
 *           type: integer
 *           description: Local primary ID
 *         longitude:
 *           type: number
 *           description: Longitude coordinate
 *         name:
 *           type: string
 *           description: Name identifier
 *         phoneNo:
 *           type: string
 *           description: Phone number
 *         provider:
 *           type: string
 *           description: Location provider (GPS, network, etc.)
 *         reason:
 *           type: string
 *           description: Reason for the location update
 *         speed:
 *           type: number
 *           description: Speed in km/h
 *         time:
 *           type: integer
 *           format: int64
 *           description: Timestamp in milliseconds
 *         versionNo:
 *           type: string
 *           description: Version number of the device
 *         deviceId:
 *           type: integer
 *           description: Associated device ID
 *         device:
 *           $ref: '#/components/schemas/Device'
 *       example:
 *         accuracy: 3.9
 *         altitude: 198
 *         bearing: 201
 *         deviceRDT: "30/01/2025 02:04:27.703"
 *         emailAddress: "email"
 *         gmtSettings: "GMT+05:00 2025"
 *         igStatus: 1
 *         imei: "865632050026800"
 *         latitude: 31.3025483
 *         localPrimaryId: 10253
 *         longitude: 74.0778433
 *         name: "865632050026800"
 *         phoneNo: "TST123"
 *         provider: "fused"
 *         reason: "Turn"
 *         speed: 95
 *         time: 1738227867703
 *         versionNo: "v 250111"
 *         deviceId: 1
 *     DeviceConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Configuration ID
 *         deviceId:
 *           type: integer
 *           description: Associated device ID
 *         gpsTimer:
 *           type: string
 *           description: GPS timer interval in seconds
 *           default: "5"
 *         configTimer:
 *           type: string
 *           description: Configuration timer interval in seconds
 *           default: "60"
 *         uploadTimer:
 *           type: string
 *           description: Upload timer interval in seconds
 *           default: "10"
 *         retryCounter:
 *           type: string
 *           description: Number of retry attempts
 *           default: "10"
 *         angleThreshold:
 *           type: string
 *           description: Angle threshold in degrees
 *           default: "45"
 *         overSpeedingThreshold:
 *           type: string
 *           description: Over speeding threshold in km/h
 *           default: "60"
 *         travelStartTimer:
 *           type: string
 *           description: Travel start timer in seconds
 *           default: "20"
 *         travelStopTimer:
 *           type: string
 *           description: Travel stop timer in seconds
 *           default: "20"
 *         movingTimer:
 *           type: string
 *           description: Moving timer in seconds
 *           default: "60"
 *         stopTimer:
 *           type: string
 *           description: Stop timer in seconds
 *           default: "130"
 *         distanceThreshold:
 *           type: string
 *           description: Distance threshold in meters
 *           default: "1000"
 *         heartbeatTimer:
 *           type: string
 *           description: Heartbeat timer in seconds
 *           default: "30"
 *         liveStatusUpdateTimer:
 *           type: string
 *           description: Live status update timer in seconds
 *           default: "30"
 *         baseUrl:
 *           type: string
 *           description: Base URL for device communications
 *           default: "https://connectlive.commtw.com:446/twconnectlive/TrackingServices.asmx"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Configuration creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Configuration last update timestamp
 *         device:
 *           $ref: '#/components/schemas/Device'
 *       example:
 *         id: 1
 *         deviceId: 1
 *         gpsTimer: "5"
 *         configTimer: "60"
 *         uploadTimer: "10"
 *         retryCounter: "10"
 *         angleThreshold: "45"
 *         overSpeedingThreshold: "60"
 *         travelStartTimer: "20"
 *         travelStopTimer: "20"
 *         movingTimer: "60"
 *         stopTimer: "130"
 *         distanceThreshold: "1000"
 *         heartbeatTimer: "30"
 *         liveStatusUpdateTimer: "30"
 *         baseUrl: "https://connectlive.commtw.com:446/twconnectlive/TrackingServices.asmx"
 */

/**
 * @swagger
 * /api/location:
 *   post:
 *     summary: Save location tracking data and create/link device
 *     tags: [Location]
 *     description: Saves location data and automatically creates a device if IMEI is provided and doesn't exist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationData'
 *     responses:
 *       201:
 *         description: Location data successfully saved and device created/linked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Location data saved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LocationData'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post("/location", locationController.saveLocationData);

/**
 * @swagger
 * /api/location:
 *   get:
 *     summary: Get all location tracking data
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: List of all location data with device information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LocationData'
 *       500:
 *         description: Server error
 */
router.get("/location", locationController.getAllLocationData);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices
 *     tags: [Device]
 *     responses:
 *       200:
 *         description: List of all devices with location data count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Device'
 *                       - type: object
 *                         properties:
 *                           _count:
 *                             type: object
 *                             properties:
 *                               locationData:
 *                                 type: integer
 *       500:
 *         description: Server error
 */
router.get("/devices", locationController.getAllDevices);

/**
 * @swagger
 * /api/devices/{imei}:
 *   get:
 *     summary: Get device by IMEI
 *     tags: [Device]
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: IMEI number of the device
 *     responses:
 *       200:
 *         description: Device information with recent location data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Device'
 *                     - type: object
 *                       properties:
 *                         locationData:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/LocationData'
 *                         _count:
 *                           type: object
 *                           properties:
 *                             locationData:
 *                               type: integer
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server error
 */
router.get("/devices/:imei", locationController.getDeviceByImei);

/**
 * @swagger
 * /api/devices/{imei}/locations:
 *   get:
 *     summary: Get location data for a specific device
 *     tags: [Device]
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: IMEI number of the device
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip for pagination
 *     responses:
 *       200:
 *         description: Location data for the specified device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LocationData'
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server error
 */
router.get(
  "/devices/:imei/locations",
  locationController.getLocationDataByImei
);

/**
 * @swagger
 * /api/devices/{imei}/config:
 *   post:
 *     summary: Create or update device configuration
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: Device IMEI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gpsTimer:
 *                 type: string
 *               configTimer:
 *                 type: string
 *               uploadTimer:
 *                 type: string
 *               retryCounter:
 *                 type: string
 *               angleThreshold:
 *                 type: string
 *               overSpeedingThreshold:
 *                 type: string
 *               travelStartTimer:
 *                 type: string
 *               travelStopTimer:
 *                 type: string
 *               movingTimer:
 *                 type: string
 *               stopTimer:
 *                 type: string
 *               distanceThreshold:
 *                 type: string
 *               heartbeatTimer:
 *                 type: string
 *               liveStatusUpdateTimer:
 *                 type: string
 *               baseUrl:
 *                 type: string
 *             example:
 *               gpsTimer: "5"
 *               configTimer: "60"
 *               uploadTimer: "10"
 *               retryCounter: "10"
 *               angleThreshold: "45"
 *               overSpeedingThreshold: "60"
 *               travelStartTimer: "20"
 *               travelStopTimer: "20"
 *               movingTimer: "60"
 *               stopTimer: "130"
 *               distanceThreshold: "1000"
 *               heartbeatTimer: "30"
 *               liveStatusUpdateTimer: "30"
 *               baseUrl: "https://connectlive.commtw.com:446/twconnectlive/TrackingServices.asmx"
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device configuration updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DeviceConfig'
 *       201:
 *         description: Configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device configuration created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DeviceConfig'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server error
 */
router.post(
  "/devices/:imei/config",
  validateDeviceConfigData,
  configController.setDeviceConfig
);

/**
 * @swagger
 * /api/devices/{imei}/config:
 *   get:
 *     summary: Get device configuration by device ID
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: Device IMEI
 *     responses:
 *       200:
 *         description: Device configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DeviceConfig'
 *       404:
 *         description: Device or configuration not found
 *       500:
 *         description: Server error
 */
router.get("/devices/:imei/config", configController.getDeviceConfig);

/**
 * @swagger
 * /api/devices/imei/{imei}/config:
 *   get:
 *     summary: Get device configuration by IMEI
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: Device IMEI
 *     responses:
 *       200:
 *         description: Device configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DeviceConfig'
 *       404:
 *         description: Device or configuration not found
 *       500:
 *         description: Server error
 */
router.get(
  "/devices/imei/:imei/config",
  configController.getDeviceConfigByImei
);

/**
 * @swagger
 * /api/configs:
 *   get:
 *     summary: Get all device configurations
 *     tags: [Configuration]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip for pagination
 *     responses:
 *       200:
 *         description: List of all device configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeviceConfig'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/configs", configController.getAllDeviceConfigs);

/**
 * @swagger
 * /api/devices/{imei}/config:
 *   delete:
 *     summary: Delete device configuration
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *         description: Device IMEI
 *     responses:
 *       200:
 *         description: Configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device configuration deleted successfully"
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */
router.delete("/devices/:imei/config", configController.deleteDeviceConfig);

module.exports = router;
