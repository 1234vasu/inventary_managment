import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantitySold: {
      type: Number,
      required: true,
      min: 0,
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for a product on a specific day
saleSchema.index({ date: 1, productId: 1 }, { unique: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
