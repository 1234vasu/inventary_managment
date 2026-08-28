import Supplier from '../models/Supplier.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: suppliers.length, suppliers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Manager,Admin
export const createSupplier = async (req, res, next) => {
  try {
    const { name, contactNumber, email, address } = req.body;

    if (!name || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Supplier name and contact number are required' });
    }

    const supplier = await Supplier.create({ name, contactNumber, email, address });
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Manager,Admin
export const updateSupplier = async (req, res, next) => {
  try {
    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    await supplier.deleteOne();
    res.status(200).json({ success: true, message: 'Supplier removed' });
  } catch (error) {
    next(error);
  }
};
