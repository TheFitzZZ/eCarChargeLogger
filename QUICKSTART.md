# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Application
```bash
./manage.sh start
```

### Step 2: Open Your Browser
Go to: **http://localhost:8080**

### Step 3: Start Tracking!
1. Add your first reading:
   - Enter your current meter reading (e.g., 1000 kWh)
   - Enter your current electricity price (e.g., 0.30 €/kWh)
   - Click "Add Reading"

2. Add subsequent readings to see:
   - Automatic consumption calculation
   - Cost tracking
   - Consumption trends

## 📊 Using Multiple Meters

Click the **"+ Meter"** button to add additional meters (e.g., "Garage", "Workshop").

## 📈 View Statistics

Click **"Statistics"** in the menu to see:
- Total consumption and costs
- Consumption trends over time
- Price history
- Interactive charts

## 🔧 Management Commands

```bash
# View status
./manage.sh status

# View logs
./manage.sh logs

# Backup database
./manage.sh backup

# Stop application
./manage.sh stop
```

## 📝 Example Usage

### First Reading (Baseline)
- Date: Oct 1, 2025
- Reading: 1000 kWh
- Price: €0.30/kWh
- **Result**: Baseline established (no consumption yet)

### Second Reading (One Week Later)
- Date: Oct 8, 2025
- Reading: 1150 kWh
- Price: €0.32/kWh
- **Result**: 
  - Consumption: 150 kWh
  - Cost: €48.00

### Editing a Reading
1. Click the pencil icon next to any reading
2. Update the values
3. Click "Save"
- **Result**: All calculations automatically updated!

## 💡 Tips

- **Regular Readings**: Add readings weekly or monthly for accurate trends
- **Price Updates**: The app automatically uses the last price, but you can update it anytime
- **Notes**: Add notes like "Summer AC usage" to remember context
- **Backup**: Use `./manage.sh backup` before making major changes

## 🆘 Need Help?

- Full documentation: See [README.md](README.md)
- API documentation: See [Architecture.md](Architecture.md)
- Contributing: See [CONTRIBUTING.md](CONTRIBUTING.md)
- Future features: See [TODO.md](TODO.md)

## 🎯 What You Can Track

- ✅ Electricity consumption per period
- ✅ Cost analysis over time
- ✅ Multiple meters (house, garage, workshop, etc.)
- ✅ Price changes and their impact
- ✅ Consumption trends (daily, weekly, monthly)
- ✅ Average usage patterns

Enjoy tracking your electricity consumption! ⚡
