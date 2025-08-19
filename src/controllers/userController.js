const User = require('../models/userSchema'); // For user profile operations
const multer = require('multer');
const upload = multer();

// Upload profile picture as blob to MongoDB
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Accept file as raw binary in body
        if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('image/')) {
            return res.status(400).json({ message: 'Content-Type must be an image' });
        }
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            await User.findByIdAndUpdate(req.user._id, {
                profilePicture: buffer,
                profilePictureType: req.headers['content-type']
            });
            res.status(200).json({ message: 'Profile picture uploaded successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading profile picture', error: error.message });
    }
};

// Get profile picture as blob from MongoDB
const getProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profilePicture) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }
        res.set('Content-Type', user.profilePictureType || 'image/jpeg');
        res.send(user.profilePicture);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile picture', error: error.message });
    }
};

// Update profile and profile picture in one endpoint
const updateProfile = [upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updateData = { ...req.body };
        if (req.file) {
            updateData.profilePicture = req.file.buffer;
            updateData.profilePictureType = req.file.mimetype;
        }
        // If password is being updated, hash it before saving
        if (updateData.password && updateData.password !== '********') {
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
}];

// Export the functions to be used in routes
module.exports = {
    uploadProfilePicture,
    getProfilePicture,
    updateProfile,
};