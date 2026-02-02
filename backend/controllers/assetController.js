const asyncHandler = require('express-async-handler');
const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private/Admin
const getAssets = asyncHandler(async (req, res) => {
    const assets = await Asset.find({}).populate('assignedToRoom');
    res.json(assets);
});

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private/Admin
const createAsset = asyncHandler(async (req, res) => {
    const { name, category, condition, quantity, assignedToRoom, value } = req.body;

    const asset = await Asset.create({
        name,
        category,
        condition,
        quantity,
        assignedToRoom: assignedToRoom || null,
        value
    });

    if (asset) {
        res.status(201).json(asset);
    } else {
        res.status(400);
        throw new Error('Invalid asset data');
    }
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private/Admin
const updateAsset = asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (asset) {
        asset.name = req.body.name || asset.name;
        asset.category = req.body.category || asset.category;
        asset.condition = req.body.condition || asset.condition;
        asset.quantity = req.body.quantity || asset.quantity;
        asset.assignedToRoom = req.body.assignedToRoom || asset.assignedToRoom;
        asset.value = req.body.value || asset.value;

        const updatedAsset = await asset.save();
        res.json(updatedAsset);
    } else {
        res.status(404);
        throw new Error('Asset not found');
    }
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private/Admin
const deleteAsset = asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (asset) {
        await asset.deleteOne();
        res.json({ message: 'Asset removed' });
    } else {
        res.status(404);
        throw new Error('Asset not found');
    }
});

module.exports = {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset
};
