from django.core.management.base import BaseCommand
from api.models import MenuItem

DEFAULT_MENU = [
    # --- FAST FOOD - BURGERS ---
    {"name": "Aloo tikki burger", "category": "Fast Food", "price": 60.00, "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Cheese burger", "category": "Fast Food", "price": 100.00, "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer burger", "category": "Fast Food", "price": 100.00, "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"},

    # --- FAST FOOD - SANDWICH ---
    {"name": "Veg grill", "category": "Sandwich", "price": 80.00, "img": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Cheese sandwich", "category": "Sandwich", "price": 120.00, "img": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Tanduri sandwich", "category": "Sandwich", "price": 100.00, "img": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Pizza sandwich", "category": "Sandwich", "price": 150.00, "img": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&q=80&w=600"},

    # --- FAST FOOD - PIZZA ---
    {"name": "Margherita pizza", "category": "Pizza", "price": 140.00, "img": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600"},
    {"name": "Onion capsicum", "category": "Pizza", "price": 180.00, "img": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600"},
    {"name": "Cheese pizza", "category": "Pizza", "price": 220.00, "img": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer pizza", "category": "Pizza", "price": 220.00, "img": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600"},
    {"name": "Farm house pizza", "category": "Pizza", "price": 280.00, "img": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600"},
    {"name": "Sweet corn pizza", "category": "Pizza", "price": 240.00, "img": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600"},

    # --- SOUTH INDIAN - IDLI ---
    {"name": "Idli (4-piece)", "category": "South Indian", "price": 100.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Masala idli", "category": "South Indian", "price": 130.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},

    # --- SOUTH INDIAN - DOSA ---
    {"name": "Plain dosa", "category": "South Indian", "price": 80.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Masala dosa", "category": "South Indian", "price": 120.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chocolate dosa", "category": "South Indian", "price": 170.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer dosa", "category": "South Indian", "price": 160.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Cheese dosa", "category": "South Indian", "price": 180.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Upma dosa", "category": "South Indian", "price": 200.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Butter Masala dosa", "category": "South Indian", "price": 170.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},

    # --- SOUTH INDIAN SNACK ---
    {"name": "Mysore bonda (4-piece)", "category": "South Indian", "price": 100.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Medu vada", "category": "South Indian", "price": 80.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},
    {"name": "Upma", "category": "South Indian", "price": 80.00, "img": "https://images.unsplash.com/photo-1630409351241-1939ee9f4273?auto=format&fit=crop&q=80&w=600"},

    # --- SABJI (MAIN COURSE) ---
    {"name": "Paneer butter masala", "category": "Sabji", "price": 170.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Shahi paneer", "category": "Sabji", "price": 200.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer lababdar", "category": "Sabji", "price": 200.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Palak paneer", "category": "Sabji", "price": 180.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo palak", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dal fry", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Kadi", "category": "Sabji", "price": 100.00, "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer patiyala", "category": "Sabji", "price": 220.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dahi fry", "category": "Sabji", "price": 120.00, "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chana masala", "category": "Sabji", "price": 160.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chola paneer", "category": "Sabji", "price": 180.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Khoya matar paneer", "category": "Sabji", "price": 200.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer cheese", "category": "Sabji", "price": 220.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo gobhi", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Sev paneer", "category": "Sabji", "price": 170.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Kadi pakoda", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Mix veg", "category": "Sabji", "price": 180.00, "img": "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&q=80&w=600"},
    {"name": "Besan gatta", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Sev tomato", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Papad sabji", "category": "Sabji", "price": 120.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Kadhai paneer", "category": "Sabji", "price": 200.00, "img": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600"},
    {"name": "Matar paneer", "category": "Sabji", "price": 180.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer pyaaza", "category": "Sabji", "price": 180.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo paneer", "category": "Sabji", "price": 160.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dal palak", "category": "Sabji", "price": 160.00, "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dal tadka", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer burji", "category": "Sabji", "price": 170.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Kaju curry", "category": "Sabji", "price": 250.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dal paneer", "category": "Sabji", "price": 170.00, "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo chola", "category": "Sabji", "price": 160.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Khoya paneer", "category": "Sabji", "price": 180.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer tikka", "category": "Sabji", "price": 220.00, "img": "https://images.unsplash.com/photo-1599487405702-3e28c9b31d55?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo matar", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo jeera", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Sev bhaji paneer", "category": "Sabji", "price": 170.00, "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo gobhi matar", "category": "Sabji", "price": 160.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Green mix veg", "category": "Sabji", "price": 160.00, "img": "https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&q=80&w=600"},
    {"name": "Malai kofta", "category": "Sabji", "price": 250.00, "img": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo masala", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},
    {"name": "Sev bhaji milk", "category": "Sabji", "price": 140.00, "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600"},

    # --- BEVERAGES ---
    {"name": "Plain tea", "category": "Beverages", "price": 30.00, "img": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600"},
    {"name": "Coffee", "category": "Beverages", "price": 50.00, "img": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600"},
    {"name": "Cold coffee", "category": "Beverages", "price": 90.00, "img": "https://images.unsplash.com/photo-1461023058943-0708e52238eb?auto=format&fit=crop&q=80&w=600"},
    {"name": "Milk", "category": "Beverages", "price": 50.00, "img": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600"},
    {"name": "Cold coffee with icecream", "category": "Beverages", "price": 120.00, "img": "https://images.unsplash.com/photo-1461023058943-0708e52238eb?auto=format&fit=crop&q=80&w=600"},

    # --- BREADS, RICE & SIDES - ROTI ---
    {"name": "Tava plain", "category": "Breads & Rice", "price": 10.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Tava butter", "category": "Breads & Rice", "price": 12.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Tava ghee", "category": "Breads & Rice", "price": 15.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Plain paratha", "category": "Breads & Rice", "price": 25.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Plain paratha butter", "category": "Breads & Rice", "price": 25.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Plain paratha ghee", "category": "Breads & Rice", "price": 40.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Onion paratha", "category": "Breads & Rice", "price": 60.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo paratha", "category": "Breads & Rice", "price": 60.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo pyaaz paratha", "category": "Breads & Rice", "price": 60.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer paratha", "category": "Breads & Rice", "price": 80.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Missi roti", "category": "Breads & Rice", "price": 40.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Bajra roti", "category": "Breads & Rice", "price": 40.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},
    {"name": "Extra butter", "category": "Breads & Rice", "price": 30.00, "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600"},

    # --- BREADS, RICE & SIDES - PULAV ---
    {"name": "Matar pulav", "category": "Breads & Rice", "price": 150.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Paneer pulav", "category": "Breads & Rice", "price": 160.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Vegetable pulav", "category": "Breads & Rice", "price": 160.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Veg biryani", "category": "Breads & Rice", "price": 160.00, "img": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"},
    {"name": "Plain rice", "category": "Breads & Rice", "price": 100.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Jeera rice", "category": "Breads & Rice", "price": 120.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dal khichdi", "category": "Breads & Rice", "price": 180.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Dal spicy khichdi", "category": "Breads & Rice", "price": 200.00, "img": "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600"},

    # --- BREADS, RICE & SIDES - RAITA ---
    {"name": "Veg raita", "category": "Raita", "price": 70.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Boondi raita", "category": "Raita", "price": 70.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Butter chaach", "category": "Raita", "price": 20.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Curd", "category": "Raita", "price": 25.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Sweet lassi", "category": "Raita", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Plain raita", "category": "Raita", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},

    # --- SALAD ---
    {"name": "Tomato Salad", "category": "Salad", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Kheera Salad", "category": "Salad", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Onion Salad", "category": "Salad", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Green salad", "category": "Salad", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Mix Salad", "category": "Salad", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Kachumbar Salad", "category": "Salad", "price": 60.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Plain papad", "category": "Salad", "price": 30.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Fry papad", "category": "Salad", "price": 50.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Masala papad", "category": "Salad", "price": 70.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Peanut masala", "category": "Salad", "price": 70.00, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"},

    # --- SNACKS - PAKODA'S ---
    {"name": "Paneer pakoda", "category": "Snacks", "price": 150.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Aloo pakoda", "category": "Snacks", "price": 160.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Mix pakoda", "category": "Snacks", "price": 160.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Bread pakoda (1-piece)", "category": "Snacks", "price": 80.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Onion pakoda", "category": "Snacks", "price": 150.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Mirchi pakoda (2-piece)", "category": "Snacks", "price": 80.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},

    # --- SNACKS - MAGGIE ---
    {"name": "Plain Maggie", "category": "Snacks", "price": 80.00, "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Veg Maggie", "category": "Snacks", "price": 100.00, "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chatpati Maggie", "category": "Snacks", "price": 120.00, "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "Tanduri Maggie", "category": "Snacks", "price": 120.00, "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600"},

    # --- OTHER SNACKS ---
    {"name": "Poha", "category": "Snacks", "price": 50.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Pav bhaji", "category": "Snacks", "price": 100.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Vada pav", "category": "Snacks", "price": 80.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "French fries", "category": "Snacks", "price": 80.00, "img": "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=600"},
    {"name": "Spring roll", "category": "Snacks", "price": 150.00, "img": "https://images.unsplash.com/photo-1544681280-d2dc1e6261bc?auto=format&fit=crop&q=80&w=600"},
    {"name": "Bread paneer pakoda", "category": "Snacks", "price": 120.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Soya chaap", "category": "Snacks", "price": 190.00, "img": "https://images.unsplash.com/photo-1626804475297-41609ea0fb49?auto=format&fit=crop&q=80&w=600"},
    {"name": "Red pasta", "category": "Snacks", "price": 150.00, "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600"},
    {"name": "White pasta", "category": "Snacks", "price": 150.00, "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=600"}
]

class Command(BaseCommand):
    help = 'Seeds initial menu items into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding comprehensive menu data from H.S Cafe PDF...')
        
        created_count = 0
        
        for item_data in DEFAULT_MENU:
            obj, created = MenuItem.objects.get_or_create(
                name=item_data['name'],
                defaults=item_data
            )
            if created:
                created_count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully populated {created_count} new menu items! (Total in list: {len(DEFAULT_MENU)})'))