import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Sale from '../models/Sale.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    // Clear all existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Inventory.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();
    await Sale.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Users (passwords will be hashed by User schema pre-save hook)
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@retail.com',
        password: 'admin123',
        role: 'Admin',
        phone: '123-456-7890',
      },
      {
        name: 'Store Manager',
        email: 'manager@retail.com',
        password: 'manager123',
        role: 'Manager',
        phone: '234-567-8901',
      },
      {
        name: 'Cashier Alice',
        email: 'cashier@retail.com',
        password: 'cashier123',
        role: 'Cashier',
        phone: '345-678-9012',
      },
    ]);
    console.log('Seed users created.');

    // 2. Seed Categories
    const categories = await Category.create([
      { name: 'Beverages', description: 'Soft drinks, juices, water' },
      { name: 'Snacks', description: 'Chips, biscuits, nuts' },
      { name: 'Dairy', description: 'Milk, cheese, butter' },
      { name: 'Produce', description: 'Fruits and vegetables' },
      { name: 'Canned Goods', description: 'Soups, beans, canned fish' },
    ]);
    console.log('Seed categories created.');

    // 3. Seed Suppliers
    const suppliers = await Supplier.create([
      {
        name: 'PepsiCo Distributors',
        contactNumber: '+1-800-433-2652',
        email: 'orders@pepsico.com',
        address: '700 Anderson Hill Rd, Purchase, NY',
      },
      {
        name: 'Amul Dairy Supply',
        contactNumber: '+91-1800-258-3333',
        email: 'supply@amul.coop',
        address: 'Anand, Gujarat, India',
      },
      {
        name: 'Nestlé Wholesale',
        contactNumber: '+41-21-924-1111',
        email: 'info@nestle.com',
        address: 'Vevey, Switzerland',
      },
      {
        name: 'Fresh Farms Produce Ltd',
        contactNumber: '+1-555-0199',
        email: 'fresh@farms.com',
        address: 'Greenhouse Valley, CA',
      },
    ]);
    console.log('Seed suppliers created.');

    // 4. Seed Products
    const productsData = [
      {
        name: 'Coca Cola 500ml',
        barcode: '5449000000996',
        categoryId: categories[0]._id,
        price: 1.50,
        quantity: 120,
        minStockThreshold: 20,
        brand: 'Coca-Cola Co.',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Pepsi 500ml',
        barcode: '012000000133',
        categoryId: categories[0]._id,
        price: 1.40,
        quantity: 15,
        minStockThreshold: 25,
        brand: 'PepsiCo Inc.',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Lays Classic Chips',
        barcode: '028400015949',
        categoryId: categories[1]._id,
        price: 2.00,
        quantity: 80,
        minStockThreshold: 15,
        brand: 'PepsiCo Inc.',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Amul Salted Butter 500g',
        barcode: '8901262010041',
        categoryId: categories[2]._id,
        price: 4.50,
        quantity: 45,
        minStockThreshold: 10,
        brand: 'Amul Dairy',
        supplierId: suppliers[1]._id,
      },
      {
        name: 'Whole Milk 1L',
        barcode: '8901262150341',
        categoryId: categories[2]._id,
        price: 1.20,
        quantity: 6,
        minStockThreshold: 30,
        brand: 'Amul Dairy',
        supplierId: suppliers[1]._id,
      },
      {
        name: 'Organic Bananas 1kg',
        barcode: '990123456789',
        categoryId: categories[3]._id,
        price: 2.50,
        quantity: 50,
        minStockThreshold: 15,
        brand: 'Fresh Farms',
        supplierId: suppliers[3]._id,
      },
      {
        name: 'Heinz Tomato Soup',
        barcode: '050000150341',
        categoryId: categories[4]._id,
        price: 1.80,
        quantity: 110,
        minStockThreshold: 20,
        brand: 'Nestlé S.A.',
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Sprite 500ml',
        barcode: '049000028904',
        categoryId: categories[0]._id,
        price: 1.45,
        quantity: 95,
        minStockThreshold: 20,
        brand: 'Coca-Cola Co.',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Gatorade Blue Bolt 500ml',
        barcode: '052000338775',
        categoryId: categories[0]._id,
        price: 1.80,
        quantity: 40,
        minStockThreshold: 15,
        brand: 'PepsiCo Inc.',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Doritos Nacho Cheese',
        barcode: '028400091561',
        categoryId: categories[1]._id,
        price: 2.20,
        quantity: 65,
        minStockThreshold: 15,
        brand: 'PepsiCo Inc.',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Nescafé Instant Coffee 100g',
        barcode: '280002143210',
        categoryId: categories[0]._id,
        price: 5.50,
        quantity: 30,
        minStockThreshold: 10,
        brand: 'Nestlé S.A.',
        supplierId: suppliers[2]._id,
      },
      {
        name: 'KitKat Chocolate Bar 45g',
        barcode: '059800223048',
        categoryId: categories[1]._id,
        price: 1.00,
        quantity: 150,
        minStockThreshold: 30,
        brand: 'Nestlé S.A.',
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Amul Cheese Slices 200g',
        barcode: '8901262020347',
        categoryId: categories[2]._id,
        price: 3.20,
        quantity: 50,
        minStockThreshold: 15,
        brand: 'Amul Dairy',
        supplierId: suppliers[1]._id,
      },
      {
        name: 'Red Apples 1kg',
        barcode: '990123456001',
        categoryId: categories[3]._id,
        price: 3.50,
        quantity: 40,
        minStockThreshold: 12,
        brand: 'Fresh Farms',
        supplierId: suppliers[3]._id,
      },
      {
        name: 'Dr Pepper 500ml',
        barcode: '078000088460',
        categoryId: categories[0]._id,
        price: 1.60,
        quantity: 85,
        minStockThreshold: 20,
        brand: 'Keurig Dr Pepper',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Monster Energy 350ml',
        barcode: '070847012473',
        categoryId: categories[0]._id,
        price: 2.50,
        quantity: 60,
        minStockThreshold: 15,
        brand: 'Monster Beverage',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Red Bull 250ml',
        barcode: '9002470024684',
        categoryId: categories[0]._id,
        price: 2.80,
        quantity: 75,
        minStockThreshold: 15,
        brand: 'Red Bull GmbH',
        supplierId: suppliers[0]._id,
      },
      {
        name: 'Pringles Original 165g',
        barcode: '038000138439',
        categoryId: categories[1]._id,
        price: 2.75,
        quantity: 90,
        minStockThreshold: 20,
        brand: "Kellogg's",
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Oreo Cookies 120g',
        barcode: '044000032221',
        categoryId: categories[1]._id,
        price: 1.20,
        quantity: 110,
        minStockThreshold: 25,
        brand: 'Mondelez International',
        supplierId: suppliers[2]._id,
      },
      {
        name: "Hershey's Milk Chocolate 43g",
        barcode: '034000002427',
        categoryId: categories[1]._id,
        price: 1.10,
        quantity: 130,
        minStockThreshold: 25,
        brand: "Hershey's",
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Activia Yogurt 4-Pack',
        barcode: '036632027503',
        categoryId: categories[2]._id,
        price: 3.00,
        quantity: 40,
        minStockThreshold: 10,
        brand: 'Danone',
        supplierId: suppliers[1]._id,
      },
      {
        name: 'Philadelphia Cream Cheese 200g',
        barcode: '021000612238',
        categoryId: categories[2]._id,
        price: 3.80,
        quantity: 35,
        minStockThreshold: 10,
        brand: 'Kraft Heinz',
        supplierId: suppliers[1]._id,
      },
      {
        name: 'Dole Pineapple Slices 500g',
        barcode: '038900003002',
        categoryId: categories[3]._id,
        price: 2.10,
        quantity: 55,
        minStockThreshold: 15,
        brand: 'Dole Food Co.',
        supplierId: suppliers[3]._id,
      },
      {
        name: 'Chiquita Bananas 1kg',
        barcode: '990123456002',
        categoryId: categories[3]._id,
        price: 2.40,
        quantity: 65,
        minStockThreshold: 15,
        brand: 'Chiquita Brands',
        supplierId: suppliers[3]._id,
      },
      {
        name: 'Del Monte Fresh Avocados 3 Pack',
        barcode: '990123456003',
        categoryId: categories[3]._id,
        price: 4.20,
        quantity: 30,
        minStockThreshold: 8,
        brand: 'Del Monte',
        supplierId: suppliers[3]._id,
      },
      {
        name: "Campbell's Tomato Soup",
        barcode: '051000000114',
        categoryId: categories[4]._id,
        price: 1.65,
        quantity: 100,
        minStockThreshold: 20,
        brand: 'Campbell Soup Co.',
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Heinz Baked Beans 415g',
        barcode: '5000157004677',
        categoryId: categories[4]._id,
        price: 1.90,
        quantity: 120,
        minStockThreshold: 20,
        brand: 'Kraft Heinz',
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Del Monte Sweet Corn 425g',
        barcode: '024000162507',
        categoryId: categories[4]._id,
        price: 1.75,
        quantity: 95,
        minStockThreshold: 15,
        brand: 'Del Monte Foods',
        supplierId: suppliers[2]._id,
      },
      {
        name: 'Lipton Yellow Label Tea 100 Bag',
        barcode: '8901030932205',
        categoryId: categories[0]._id,
        price: 4.50,
        quantity: 50,
        minStockThreshold: 12,
        brand: 'Unilever',
        supplierId: suppliers[2]._id,
      },
      {
        name: "Kellogg's Corn Flakes 500g",
        barcode: '038000001207',
        categoryId: categories[1]._id,
        price: 3.95,
        quantity: 70,
        minStockThreshold: 15,
        brand: "Kellogg's",
        supplierId: suppliers[2]._id,
      },
    ];

    const products = await Product.create(productsData);
    console.log('Seed products created.');

    // Write initial stock logs in Inventory collection
    const inventoryLogs = products.map(prod => ({
      productId: prod._id,
      quantityChanged: prod.quantity,
      type: 'Stock In',
      updatedBy: users[0]._id,
      remarks: 'Initial seeding upload',
    }));
    await Inventory.insertMany(inventoryLogs);
    console.log('Initial inventory logs created.');

    // 5. Seed 12 Months of Historical Sales
    // We will generate daily sales records. To show a trend for Linear Regression,
    // we make each product follow a predictable growth pattern with some random variance.
    // e.g. quantitySold = baseSales + (monthIndex * growthFactor) + noise
    console.log('Generating 12 months of historical sales data for AI training...');
    const salesRecords = [];
    const today = new Date();
    
    // Configs for trend: product index mapped to growth rate
    const trends = [
      { base: 15, growth: 2 },  // Coke: starts at 15/day, grows by 2 per month
      { base: 10, growth: 1.5 },// Pepsi: starts at 10/day, grows by 1.5 per month
      { base: 12, growth: 1.2 },// Lays: starts at 12/day, grows by 1.2 per month
      { base: 5,  growth: 0.8 },// Butter: starts at 5/day, grows by 0.8 per month
      { base: 25, growth: 3.5 },// Milk: starts at 25/day, grows by 3.5 per month
      { base: 8,  growth: 0.5 },// Bananas: starts at 8/day, grows by 0.5 per month
      { base: 6,  growth: 0.4 },// Soup: starts at 6/day, grows by 0.4 per month
      { base: 12, growth: 1.8 },// Sprite
      { base: 8,  growth: 1.1 },// Gatorade
      { base: 10, growth: 1.3 },// Doritos
      { base: 4,  growth: 0.6 },// Coffee
      { base: 18, growth: 2.2 },// KitKat
      { base: 7,  growth: 0.9 },// Cheese
      { base: 9,  growth: 0.7 },// Apples
      { base: 11, growth: 1.4 },// Dr Pepper
      { base: 14, growth: 1.7 },// Monster Energy
      { base: 16, growth: 2.0 },// Red Bull
      { base: 13, growth: 1.3 },// Pringles
      { base: 17, growth: 1.9 },// Oreo
      { base: 19, growth: 2.1 },// Hershey's
      { base: 8,  growth: 0.9 },// Activia Yogurt
      { base: 6,  growth: 0.7 },// Philadelphia Cream Cheese
      { base: 7,  growth: 0.8 },// Dole Pineapple
      { base: 9,  growth: 0.6 },// Chiquita Bananas
      { base: 5,  growth: 0.5 },// Avocados
      { base: 15, growth: 1.6 },// Campbell's Soup
      { base: 12, growth: 1.2 },// Heinz Baked Beans
      { base: 10, growth: 1.0 },// Del Monte Sweet Corn
      { base: 8,  growth: 0.8 },// Lipton Tea
      { base: 11, growth: 1.2 },// Corn Flakes
    ];

    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      // Calculate specific year/month
      const d = new Date();
      d.setMonth(today.getMonth() - monthOffset);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthIndex = 11 - monthOffset; // 0 to 11

      // Days in this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day, 12, 0, 0);

        products.forEach((prod, pIdx) => {
          const config = trends[pIdx] || { base: 10, growth: 1 };
          
          // Linear growth formula: base + index * growth
          const trendValue = config.base + (monthIndex * config.growth);
          
          // Random variance: -20% to +20%
          const variance = (Math.random() * 0.4 - 0.2) * trendValue;
          
          // Final quantity sold today (rounded to integer, minimum 0)
          let quantitySold = Math.round(trendValue + variance);
          if (quantitySold < 0) quantitySold = 0;

          // Occasionally 0 sales on Sundays (e.g. if day of week is 0, 20% chance of 0 sales)
          if (currentDate.getDay() === 0 && Math.random() < 0.3) {
            quantitySold = 0;
          }

          if (quantitySold > 0) {
            const revenue = quantitySold * prod.price;
            salesRecords.push({
              date: currentDate,
              productId: prod._id,
              quantitySold,
              revenue,
            });
          }
        });
      }
    }

    await Sale.insertMany(salesRecords);
    console.log(`Generated ${salesRecords.length} historical daily sales records.`);

    // 6. Seed some mock orders (last 5 days) to populate recent transaction lists and today's KPIs
    console.log('Generating mock transaction history...');
    for (let i = 4; i >= 0; i--) {
      const orderDate = new Date();
      orderDate.setDate(today.getDate() - i);
      orderDate.setHours(10 + i, 15 * i, 0, 0);

      // Random cashier
      const cashier = users[2];
      
      const invoiceNumber = `INV-${orderDate.toISOString().slice(0, 10).replace(/-/g, '')}-99${i}`;
      
      // Select 2 random products for this order
      const prod1 = products[Math.floor(Math.random() * products.length)];
      const prod2 = products[Math.floor(Math.random() * products.length)];
      
      const qty1 = Math.floor(Math.random() * 3) + 1;
      const qty2 = Math.floor(Math.random() * 2) + 1;

      const sub1 = qty1 * prod1.price;
      const sub2 = qty2 * prod2.price;

      const totalAmount = sub1 + sub2;
      const discount = Math.random() < 0.3 ? 1.00 : 0;
      const tax = parseFloat((totalAmount * 0.08).toFixed(2));
      const netAmount = totalAmount + tax - discount;

      const order = await Order.create({
        invoiceNumber,
        cashierId: cashier._id,
        customerName: Math.random() < 0.5 ? 'John Doe' : 'Jane Smith',
        customerContact: '555-0199',
        totalAmount,
        tax: 8, // 8%
        discount,
        netAmount,
        paymentMode: i % 3 === 0 ? 'UPI' : (i % 3 === 1 ? 'Card' : 'Cash'),
        createdAt: orderDate,
      });

      await OrderItem.create([
        {
          orderId: order._id,
          productId: prod1._id,
          productName: prod1.name,
          quantity: qty1,
          priceAtSale: prod1.price,
          subTotal: sub1,
          createdAt: orderDate,
        },
        {
          orderId: order._id,
          productId: prod2._id,
          productName: prod2.name,
          quantity: qty2,
          priceAtSale: prod2.price,
          subTotal: sub2,
          createdAt: orderDate,
        }
      ]);
    }
    console.log('Transaction history seeded.');

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
