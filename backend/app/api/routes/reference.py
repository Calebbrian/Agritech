"""Reference data endpoints — categories, crop calendar, market insights, weather, quality alerts"""
from fastapi import APIRouter

router = APIRouter(prefix="/reference", tags=["Reference Data"])

CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Tubers", "Oils", "Livestock", "Dairy"]

CROP_CALENDAR = [
    {"crop": "Tomatoes", "plantMonth": "October - November", "harvestMonth": "February - March", "season": "Dry Season", "region": "North Central, North West", "tips": "Plant in well-drained loamy soil. Use drip irrigation during dry season. Apply organic manure before planting.", "bestPrice": "March - April (Peak scarcity period)", "currentDemand": "high"},
    {"crop": "Maize", "plantMonth": "March - April", "harvestMonth": "July - August", "season": "Rainy Season", "region": "All regions", "tips": "Plant at the onset of rain. Space 75cm between rows. Apply NPK fertilizer 3 weeks after planting.", "bestPrice": "September - December (Off-season premium)", "currentDemand": "medium"},
    {"crop": "Rice", "plantMonth": "June - July", "harvestMonth": "October - November", "season": "Rainy Season", "region": "Kebbi, Niger, Ebonyi, Cross River", "tips": "Requires flooded paddy fields. Use improved seedlings like FARO 44 or NERICA varieties.", "bestPrice": "December - February (Festive season demand)", "currentDemand": "high"},
    {"crop": "Cassava", "plantMonth": "April - May", "harvestMonth": "December - February (12 months)", "season": "Early Rainy Season", "region": "South West, South East, South South", "tips": "Plant stem cuttings at 45° angle. Harvest after 9-12 months for best starch content.", "bestPrice": "Year-round (Stable demand)", "currentDemand": "medium"},
    {"crop": "Yam", "plantMonth": "February - March", "harvestMonth": "August - October", "season": "Early Rainy Season", "region": "Benue, Enugu, Kwara, Oyo", "tips": "Plant setts in mounds or ridges. Provide stakes for vine support. Apply potash fertilizer.", "bestPrice": "December (New yam festival premium)", "currentDemand": "high"},
    {"crop": "Pepper (Habanero)", "plantMonth": "March - April", "harvestMonth": "June - August", "season": "Rainy Season", "region": "All regions", "tips": "Start in nursery, transplant after 6 weeks. Needs full sun and regular watering.", "bestPrice": "August - October (Rainy season scarcity)", "currentDemand": "high"},
    {"crop": "Beans (Cowpea)", "plantMonth": "July - August", "harvestMonth": "October - November", "season": "Late Rainy Season", "region": "North East, North West, North Central", "tips": "Short duration variety (60-70 days). Intercrop with maize for best results.", "bestPrice": "January - March (Storage premium)", "currentDemand": "medium"},
    {"crop": "Groundnuts", "plantMonth": "May - June", "harvestMonth": "September - October", "season": "Rainy Season", "region": "Kano, Kaduna, Niger, Bauchi", "tips": "Plant in sandy-loam soil. Do not waterlog. Harvest when leaves turn yellow.", "bestPrice": "December - February (Processing demand)", "currentDemand": "low"},
    {"crop": "Palm Oil", "plantMonth": "June - August (Seedlings)", "harvestMonth": "Year-round (after 4 years)", "season": "All Year", "region": "South East, South South, South West", "tips": "Long-term investment. Requires 4-5 years to first harvest. Peak production at 8-12 years.", "bestPrice": "December - February (Festive cooking demand)", "currentDemand": "high"},
    {"crop": "Watermelon", "plantMonth": "October - November", "harvestMonth": "January - February", "season": "Dry Season", "region": "North Central, FCT, Lagos suburbs", "tips": "Needs sandy soil and plenty of water. Harvest when bottom spot turns yellow.", "bestPrice": "February - April (Hot season demand)", "currentDemand": "medium"},
]

MARKET_INSIGHTS = [
    {"product": "Tomatoes", "currentPrice": 2500, "lastWeekPrice": 2200, "trend": "up", "changePercent": 13.6, "forecast": "Prices expected to rise further as dry season ends. Stock up now."},
    {"product": "Rice (Local)", "currentPrice": 42000, "lastWeekPrice": 43000, "trend": "down", "changePercent": -2.3, "forecast": "Slight dip due to new harvest arrivals from Kebbi and Niger states."},
    {"product": "Palm Oil", "currentPrice": 35000, "lastWeekPrice": 33000, "trend": "up", "changePercent": 6.1, "forecast": "Rising demand ahead of Easter celebrations. Good time to sell."},
    {"product": "Yam Tubers", "currentPrice": 5000, "lastWeekPrice": 4500, "trend": "up", "changePercent": 11.1, "forecast": "New yam season approaching. Prices volatile, sell stored yams now."},
    {"product": "Maize", "currentPrice": 18000, "lastWeekPrice": 18500, "trend": "down", "changePercent": -2.7, "forecast": "Stable prices. New planting season starting, demand for seed maize increasing."},
    {"product": "Beans", "currentPrice": 28000, "lastWeekPrice": 27000, "trend": "up", "changePercent": 3.7, "forecast": "Steady demand. Prices firm due to reduced supply from northeast."},
]

WEATHER_DATA = [
    {"region": "North Central", "temp": "32°C", "humidity": "45%", "rainfall": "Low", "condition": "Sunny", "advisory": "Good conditions for harvesting. Ensure proper irrigation for dry season crops."},
    {"region": "North West", "temp": "36°C", "humidity": "30%", "rainfall": "None", "condition": "Hot & Dry", "advisory": "Extreme heat. Water crops early morning and late evening. Avoid midday planting."},
    {"region": "North East", "temp": "35°C", "humidity": "35%", "rainfall": "None", "condition": "Harmattan ending", "advisory": "Prepare land for rainy season planting. Clear debris and apply organic manure."},
    {"region": "South West", "temp": "29°C", "humidity": "70%", "rainfall": "Light", "condition": "Partly Cloudy", "advisory": "Early rains starting. Good time to begin planting maize, vegetables, and cassava."},
    {"region": "South East", "temp": "28°C", "humidity": "75%", "rainfall": "Moderate", "condition": "Rainy", "advisory": "Rainy season active. Plant cassava and yam. Watch for waterlogging in lowlands."},
    {"region": "South South", "temp": "27°C", "humidity": "80%", "rainfall": "Heavy", "condition": "Thunderstorms", "advisory": "Heavy rainfall expected. Delay harvesting. Ensure drainage systems are clear."},
]

QUALITY_ALERTS = [
    {"id": 1, "farmerId": 6, "farmerName": "Aisha Mohammed", "product": "Fresh Peppers", "issue": "Some peppers showed signs of fungal infection", "date": "2026-03-10", "severity": "warning", "resolved": False, "penalty": "Payment held until replacement sent"},
    {"id": 2, "farmerId": 3, "farmerName": "Musa Ibrahim", "product": "Fresh Cassava", "issue": "Cassava roots had signs of brown streak disease", "date": "2026-02-28", "severity": "critical", "resolved": True, "penalty": "Refund issued to buyer. 1 warning added."},
    {"id": 3, "farmerId": 8, "farmerName": "Grace Eze", "product": "Plantain (Ripe)", "issue": "Over-ripe plantains delivered, not matching listing photos", "date": "2026-03-05", "severity": "warning", "resolved": True, "penalty": "Partial refund (50%). Quality photo verification required for future listings."},
]


@router.get("/categories")
async def get_categories():
    return CATEGORIES


@router.get("/crop-calendar")
async def get_crop_calendar():
    return CROP_CALENDAR


@router.get("/market-insights")
async def get_market_insights():
    return MARKET_INSIGHTS


@router.get("/weather")
async def get_weather():
    return WEATHER_DATA


@router.get("/quality-alerts")
async def get_quality_alerts():
    return QUALITY_ALERTS


STORIES = [
    {"id": 1, "user": "Your Story", "avatar": "Y", "color": "#2D6A4F", "image": None, "isOwn": True},
    {"id": 2, "user": "Adamu B.", "avatar": "A", "color": "#16a34a", "image": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&h=300&fit=crop", "viewed": False},
    {"id": 3, "user": "Chioma O.", "avatar": "C", "color": "#2563eb", "image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=300&fit=crop", "viewed": False},
    {"id": 4, "user": "FastDel.", "avatar": "F", "color": "#db2777", "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=300&fit=crop", "viewed": True},
    {"id": 5, "user": "Grace E.", "avatar": "G", "color": "#d97706", "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=300&fit=crop", "viewed": False},
    {"id": 6, "user": "Musa I.", "avatar": "M", "color": "#16a34a", "image": "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=200&h=300&fit=crop", "viewed": True},
    {"id": 7, "user": "Fatima Y.", "avatar": "F", "color": "#7c3aed", "image": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=300&fit=crop", "viewed": False},
]

REELS = [
    {"id": 1, "user": "Adamu Bello", "avatar": "A", "color": "#16a34a", "role": "farmer", "thumbnail": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&h=500&fit=crop", "caption": "Harvesting fresh tomatoes this morning! 🍅", "views": "12.4K", "likes": 890, "verified": True},
    {"id": 2, "user": "Grace Eze", "avatar": "G", "color": "#d97706", "role": "farmer", "thumbnail": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=500&fit=crop", "caption": "How I grow the best plantains in Edo State 🌿", "views": "8.2K", "likes": 634, "verified": True},
    {"id": 3, "user": "FastDelivery NG", "avatar": "F", "color": "#db2777", "role": "logistics", "thumbnail": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=500&fit=crop", "caption": "Delivering 50 bags of rice across Lagos today 🚛", "views": "5.1K", "likes": 312, "verified": True},
    {"id": 4, "user": "Emeka Nwankwo", "avatar": "E", "color": "#16a34a", "role": "farmer", "thumbnail": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=500&fit=crop", "caption": "Traditional palm oil processing - no chemicals! 🌴", "views": "23.7K", "likes": 2100, "verified": True},
    {"id": 5, "user": "Chioma Okafor", "avatar": "C", "color": "#2563eb", "role": "agent", "thumbnail": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=500&fit=crop", "caption": "Helping farmers list their maize on FarmLink", "views": "3.8K", "likes": 245, "verified": False},
]

FAQS = [
    {"id": 1, "question": "How do I sell my products on FarmLink?", "answer": "Register as a Farmer, go to Products page, click 'Add Product', fill in the details (name, price, photos), and your product will be visible to buyers across Nigeria.", "category": "Selling"},
    {"id": 2, "question": "How does payment work?", "answer": "When a buyer purchases your product, the money goes into FarmLink escrow. After the logistics partner delivers and the buyer confirms, the payment is released to your wallet. You can then withdraw to your bank account.", "category": "Payment"},
    {"id": 3, "question": "What is an Agent and how do they work?", "answer": "Agents help illiterate farmers who can't use smartphones. They register farmers, list their products, and manage orders on their behalf. The agent earns 10% commission on each sale. Payment goes directly to the farmer's bank account, never the agent's.", "category": "Agents"},
    {"id": 4, "question": "How do I track my delivery?", "answer": "Go to Track Orders in your dashboard. You'll see real-time status updates: Pending → Confirmed → Picked Up → In Transit → Delivered. You'll also get notifications at each step.", "category": "Delivery"},
    {"id": 5, "question": "What if I receive spoilt products?", "answer": "Report the issue immediately through the app. The farmer's payment will be held, and our quality team will investigate. You may receive a full or partial refund depending on the situation.", "category": "Quality"},
    {"id": 6, "question": "How do I become a logistics partner?", "answer": "Register as a Logistics Partner with your vehicle details. Once verified, you'll receive delivery assignments. You can accept or decline based on your availability and route preferences.", "category": "Logistics"},
    {"id": 7, "question": "Is my money safe on FarmLink?", "answer": "Yes. All payments go through our secure escrow system. Buyer money is held safely until delivery is confirmed. We use Paystack for payment processing, which is PCI DSS compliant.", "category": "Security"},
    {"id": 8, "question": "How do I withdraw my earnings?", "answer": "Go to Wallet → click Withdraw. Enter the amount and it will be transferred to your registered bank account. Withdrawals typically process within 24 hours.", "category": "Payment"},
]

BADGES = [
    {"name": "Gold Farmer", "description": "Earned over ₦1,000,000 in sales", "color": "#d97706", "icon": "🥇", "requirement": 1000000},
    {"name": "Silver Farmer", "description": "Earned over ₦500,000 in sales", "color": "#9ca3af", "icon": "🥈", "requirement": 500000},
    {"name": "Bronze Farmer", "description": "Earned over ₦100,000 in sales", "color": "#b45309", "icon": "🥉", "requirement": 100000},
    {"name": "Top Rated", "description": "Average rating above 4.8", "color": "#16a34a", "icon": "⭐", "requirement": 4.8},
    {"name": "Eco Warrior", "description": "Sustainability score above 80%", "color": "#059669", "icon": "🌿", "requirement": 80},
    {"name": "Fast Seller", "description": "Sold 100+ items in a month", "color": "#2563eb", "icon": "⚡", "requirement": 100},
]

SUSTAINABILITY_CRITERIA = [
    {"name": "Organic Farming", "description": "Uses organic methods without synthetic pesticides or fertilizers", "maxPoints": 25, "icon": "🌿"},
    {"name": "Water Conservation", "description": "Implements drip irrigation or rainwater harvesting", "maxPoints": 20, "icon": "💧"},
    {"name": "Soil Health", "description": "Practices crop rotation and composting", "maxPoints": 20, "icon": "🌱"},
    {"name": "Waste Reduction", "description": "Minimizes post-harvest losses and packaging waste", "maxPoints": 15, "icon": "♻️"},
    {"name": "Community Impact", "description": "Employs local workers and supports community development", "maxPoints": 10, "icon": "🤝"},
    {"name": "Biodiversity", "description": "Maintains crop diversity and protects local ecosystems", "maxPoints": 10, "icon": "🦋"},
]

UPCOMING_TASKS = [
    {"id": 1, "task": "Apply NPK fertilizer to Tomatoes", "crop": "🍅 Tomatoes", "due": "Tomorrow", "priority": "high"},
    {"id": 2, "task": "Spray pesticide on Maize field", "crop": "🌽 Maize", "due": "In 3 days", "priority": "medium"},
    {"id": 3, "task": "Harvest Pepper (Tatase)", "crop": "🌶️ Pepper", "due": "In 4 days", "priority": "high"},
    {"id": 4, "task": "Weed Cassava field", "crop": "🫘 Cassava", "due": "In 7 days", "priority": "low"},
    {"id": 5, "task": "Prepare yam stakes", "crop": "🍠 Yam", "due": "In 10 days", "priority": "medium"},
]

BEST_PLANTING_TIMES = [
    {"crop": "Tomatoes 🍅", "bestMonth": "Oct - Jan", "season": "Dry Season", "region": "North Central", "tip": "Use drip irrigation for best yield"},
    {"crop": "Maize 🌽", "bestMonth": "Mar - Apr", "season": "Early Rainy", "region": "All Regions", "tip": "Plant after first heavy rain"},
    {"crop": "Rice 🌾", "bestMonth": "Jun - Jul", "season": "Rainy Season", "region": "Niger, Kebbi", "tip": "Ensure paddy fields are ready"},
    {"crop": "Yam 🍠", "bestMonth": "Feb - Mar", "season": "Late Dry", "region": "South West, South East", "tip": "Prepare mounds 2 weeks before planting"},
    {"crop": "Cassava 🫘", "bestMonth": "Apr - Oct", "season": "Rainy Season", "region": "All Regions", "tip": "Can be planted anytime with enough moisture"},
    {"crop": "Pepper 🌶️", "bestMonth": "Sep - Nov", "season": "Late Rainy", "region": "All Regions", "tip": "Nursery seedlings for 6 weeks first"},
    {"crop": "Beans 🫘", "bestMonth": "Jul - Aug", "season": "Rainy Season", "region": "North", "tip": "Early maturing varieties best for double cropping"},
    {"crop": "Plantain 🍌", "bestMonth": "Mar - Jun", "season": "Early Rainy", "region": "South", "tip": "Use tissue culture suckers for disease-free plants"},
]

PRICE_HISTORY = [
    {"product": "Fresh Tomatoes 🍅", "prices": [{"month": "Jan", "price": 3500}, {"month": "Feb", "price": 3000}, {"month": "Mar", "price": 2500}], "trend": "down", "change": -28.6},
    {"product": "Brown Beans 🫘", "prices": [{"month": "Jan", "price": 25000}, {"month": "Feb", "price": 27000}, {"month": "Mar", "price": 28000}], "trend": "up", "change": 12},
    {"product": "Fresh Yam 🍠", "prices": [{"month": "Jan", "price": 6000}, {"month": "Feb", "price": 5500}, {"month": "Mar", "price": 5000}], "trend": "down", "change": -16.7},
    {"product": "Palm Oil 🫙", "prices": [{"month": "Jan", "price": 32000}, {"month": "Feb", "price": 33000}, {"month": "Mar", "price": 35000}], "trend": "up", "change": 9.4},
]

ADMIN_RECENT_ACTIVITY = [
    {"id": 1, "action": "New farmer registered", "user": "Adamu Bello (via Agent Chioma)", "time": "5 min ago", "type": "user"},
    {"id": 2, "action": "Order delivered", "user": "FastDelivery NG", "time": "12 min ago", "type": "order"},
    {"id": 3, "action": "Payment released", "user": "NGN 120,000 to Farmer Musa", "time": "30 min ago", "type": "payment"},
    {"id": 4, "action": "Quality warning issued", "user": "Farmer Bala - spoilt tomatoes", "time": "1 hour ago", "type": "alert"},
    {"id": 5, "action": "New buyer signed up", "user": "John Doe (Lagos)", "time": "2 hours ago", "type": "user"},
    {"id": 6, "action": "Agent flagged", "user": "Agent Emeka - suspicious registration", "time": "3 hours ago", "type": "alert"},
]


@router.get("/stories")
async def get_stories():
    return STORIES


@router.get("/reels")
async def get_reels():
    return REELS


@router.get("/faqs")
async def get_faqs():
    return FAQS


@router.get("/badges")
async def get_badges():
    return BADGES


@router.get("/sustainability-criteria")
async def get_sustainability_criteria():
    return SUSTAINABILITY_CRITERIA


@router.get("/upcoming-tasks")
async def get_upcoming_tasks():
    return UPCOMING_TASKS


@router.get("/best-planting-times")
async def get_best_planting_times():
    return BEST_PLANTING_TIMES


@router.get("/price-history")
async def get_price_history():
    return PRICE_HISTORY


@router.get("/admin-activity")
async def get_admin_activity():
    return ADMIN_RECENT_ACTIVITY
