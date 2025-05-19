const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

/**
 * @swagger
 * components:
 *   schemas:
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
 */

/**
 * @swagger
 * /api/location:
 *   post:
 *     summary: Save location tracking data
 *     tags: [Location]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationData'
 *     responses:
 *       201:
 *         description: Location data successfully saved
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
router.post('/location', locationController.saveLocationData);

/**
 * @swagger
 * /api/location:
 *   get:
 *     summary: Get all location tracking data
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: List of all location data
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
router.get('/location', locationController.getAllLocationData);

module.exports = router;