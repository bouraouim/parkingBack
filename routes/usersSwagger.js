/**
 * @swagger
 * /api/users/{id}/push-token:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register Push Token
 *     description: Register or update Expo push token for push notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM device token
 *                 example: fcm_token_123456789
 *     responses:
 *       200:
 *         description: Token registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tokenCount:
 *                   type: number
 *       400:
 *         description: Token is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *   delete:
 *     tags:
 *       - Users
 *     summary: Remove Push Token
 *     description: Remove Expo push token from user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM device token to remove
 *     responses:
 *       200:
 *         description: Token removed successfully
 *       400:
 *         description: Token is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
