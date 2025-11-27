/**
 * @swagger
 * /api/missions:
 *   get:
 *     tags:
 *       - Missions
 *     summary: Get all missions
 *     description: Retrieve list of all missions sorted by status and date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of missions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mission'
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags:
 *       - Missions
 *     summary: Create new mission
 *     description: Create a new mission and send Expo push notification to assigned user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - id
 *               - date
 *               - cashier
 *               - machineName
 *               - collect
 *               - refill
 *               - qrCode
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username to assign mission to
 *                 example: worker1
 *               id:
 *                 type: string
 *                 example: mission-001
 *               date:
 *                 type: string
 *                 example: 2025-11-26
 *               cashier:
 *                 type: string
 *                 example: John Doe
 *               machineName:
 *                 type: string
 *                 example: Machine A1
 *               collect:
 *                 type: object
 *                 properties:
 *                   noteAmount:
 *                     type: number
 *                     example: 500
 *                   coinAmount:
 *                     type: number
 *                     example: 200
 *               refill:
 *                 type: object
 *                 properties:
 *                   coins:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       coinTypes:
 *                         type: object
 *                         example: { "1": 50, "2": 50 }
 *                   notes:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: number
 *                         example: 500
 *                       noteTypes:
 *                         type: object
 *                         example: { "10": 30, "20": 20 }
 *               maintenance:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Clean screen", "Check printer"]
 *               qrCode:
 *                 type: string
 *                 example: QR12345
 *     responses:
 *       201:
 *         description: Mission created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Mission already exists
 * 
 * /api/missions/{id}:
 *   get:
 *     tags:
 *       - Missions
 *     summary: Get mission by ID
 *     description: Retrieve detailed information about a specific mission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mission ID
 *         example: mission-001
 *     responses:
 *       200:
 *         description: Mission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mission'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mission not found
 * 
 * /api/missions/{id}/open:
 *   post:
 *     tags:
 *       - Missions
 *     summary: Open mission
 *     description: Mark mission as in_progress (only if status is unopened)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mission ID
 *         example: mission-001
 *     responses:
 *       200:
 *         description: Mission opened successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mission'
 *       400:
 *         description: Mission not in unopened status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mission not found
 * 
 * /api/missions/{id}/update:
 *   post:
 *     tags:
 *       - Missions
 *     summary: Update mission
 *     description: Update mission status and optionally add task results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mission ID
 *         example: mission-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed]
 *                 example: completed
 *               tasks:
 *                 type: object
 *                 description: Optional task validation results
 *                 example: { "collected": true, "refilled": true }
 *               note:
 *                 type: string
 *                 description: Optional note
 *                 example: All tasks completed successfully
 *     responses:
 *       200:
 *         description: Mission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mission'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mission not found
 */
