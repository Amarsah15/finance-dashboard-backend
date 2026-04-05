import Record from "../models/Record.model.js";

// @desc    Create a new financial record
// @route   POST /api/records
// @access  Private (Admin only)
export const createRecord = async (req, res, next) => {
  try {
    // Add the user ID from the protected route to the record payload
    const recordData = { ...req.body, user: req.user._id };

    const record = await Record.create(recordData);

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all records (with filtering and pagination)
// @route   GET /api/v1/records
// @access  Private (Admin, Analyst)
export const getRecords = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      includeDeleted,
      search,
    } = req.query;

    let query = { isDeleted: false };

    if (req.user.role === "Admin" && includeDeleted === "true") {
      delete query.isDeleted; // Removes the filter, returning BOTH active and soft-deleted records
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$and = [
        ...(query.$and || []),
        { $or: [{ category: regex }, { notes: regex }] },
      ];
      delete query.category; 
    }

    // --- PAGINATION LOGIC ---
    // Convert strings to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for metadata
    const totalRecords = await Record.countDocuments(query);

    // Fetch the actual data
    const records = await Record.find(query)
      .populate("user", "name email")
      .sort({ date: -1 })
      .skip(skip) // Skip previous pages
      .limit(limitNum); // Limit the number of results

    res.status(200).json({
      success: true,
      count: records.length,
      pagination: {
        totalRecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        limit: limitNum,
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private (Admin only)
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record || record.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    // Perform Soft Delete
    record.isDeleted = true;
    record.deletedAt = new Date();
    await record.save();

    res.status(200).json({
      success: true,
      message:
        "Record soft-deleted successfully (will be permanently removed in 30 days)",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private (Admin only)
export const updateRecord = async (req, res, next) => {
  try {
    let record = await Record.findById(req.params.id);

    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    const { amount, type, category, date, notes } = req.body;

    // Update the record and return the new version
    record = await Record.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, notes }, // Pass the safe object here
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
