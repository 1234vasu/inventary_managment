import sys
import json
import math
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

def main():
    try:
        # Read JSON string from stdin
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({"error": "No input data received"}))
            sys.exit(1)
            
        products = json.loads(input_data)
        results = []

        for prod in products:
            prod_id = prod.get("productId")
            prod_name = prod.get("productName")
            current_stock = prod.get("currentStock", 0)
            min_threshold = prod.get("minStockThreshold", 10)
            category = prod.get("category", "Uncategorized")
            supplier = prod.get("supplier", "Unknown")
            price = prod.get("price", 0.0)
            brand = prod.get("brand", "Generic")
            sales_history = prod.get("salesHistory", [])

            # Check if we have sufficient data to train Linear Regression (requires at least 2 months of records)
            if len(sales_history) < 2:
                # Fallback recommendation logic
                pred_sales = 0
                for item in sales_history:
                    pred_sales += item.get("quantitySold", 0)
                
                # Use average sales if there is 1 data point, else 0
                pred_sales = pred_sales / len(sales_history) if len(sales_history) > 0 else 0
                
                # Check restock status
                if current_stock <= min_threshold or current_stock < pred_sales:
                    recommendation = "Restock"
                    # Recommended qty is threshold + average sales - current stock
                    rec_qty = math.ceil(max(0, (min_threshold + pred_sales) - current_stock))
                else:
                    recommendation = "No Action"
                    rec_qty = 0

                results.append({
                    "productId": prod_id,
                    "productName": prod_name,
                    "brand": brand,
                    "category": category,
                    "supplier": supplier,
                    "currentStock": current_stock,
                    "minStockThreshold": min_threshold,
                    "price": price,
                    "predictedSalesNextMonth": round(pred_sales, 2),
                    "recommendation": recommendation,
                    "recommendedQuantity": rec_qty,
                    "trend": "Stable (Insufficient Data)",
                    "slope": 0.0,
                    "modelTrained": False
                })
                continue

            # Prepare data points for Scikit-Learn
            df = pd.DataFrame(sales_history) # columns: monthIndex, quantitySold
            X = df[["monthIndex"]].values
            y = df["quantitySold"].values

            # Train Scikit-Learn Linear Regression model
            model = LinearRegression()
            model.fit(X, y)

            # Predict next month index (max_index + 1)
            max_index = int(np.max(X))
            next_month_index = max_index + 1

            # Perform prediction
            pred_array = model.predict([[next_month_index]])
            pred_sales = float(pred_array[0])
            if pred_sales < 0:
                pred_sales = 0.0

            # Calculate trend slope
            slope = float(model.coef_[0])
            trend = "Upward" if slope > 0.05 else ("Downward" if slope < -0.05 else "Stable")

            # Determine restock action and recommended quantity
            # If current stock is below min threshold, or predicted sales next month exceeds current stock
            if current_stock <= min_threshold or current_stock < pred_sales:
                recommendation = "Restock"
                # Safety stock calculation: predict next month's sales * 1.2 safety factor
                safety_stock_demand = pred_sales * 1.2
                rec_qty = math.ceil(max(0, safety_stock_demand - current_stock))
            else:
                recommendation = "No Action"
                rec_qty = 0

            results.append({
                "productId": prod_id,
                "productName": prod_name,
                "brand": brand,
                "category": category,
                "supplier": supplier,
                "currentStock": current_stock,
                "minStockThreshold": min_threshold,
                "price": price,
                "predictedSalesNextMonth": round(pred_sales, 2),
                "recommendation": recommendation,
                "recommendedQuantity": rec_qty,
                "trend": trend,
                "slope": round(slope, 4),
                "modelTrained": True
            })

        # Print final result as JSON to stdout for Node capture
        print(json.dumps(results))

    except Exception as e:
        error_res = {"error": str(e)}
        print(json.dumps(error_res))
        sys.exit(1)

if __name__ == "__main__":
    main()
