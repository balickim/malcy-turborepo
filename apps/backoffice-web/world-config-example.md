```json
{
  "COMBAT": {
    "SIEGE": {
      "TIME_TICK_MS": 60000
    },
    "UNITS": {
      "ARCHER": {
        "ATTACK": 15,
        "HEALTH": 80,
        "DEFENSE": 3
      },
      "KNIGHT": {
        "ATTACK": 20,
        "HEALTH": 150,
        "DEFENSE": 15
      },
      "ARCHMAGE": {
        "ATTACK": 30,
        "HEALTH": 90,
        "DEFENSE": 8
      },
      "LUCHADOR": {
        "ATTACK": 25,
        "HEALTH": 120,
        "DEFENSE": 10
      },
      "SWORDSMAN": {
        "ATTACK": 10,
        "HEALTH": 100,
        "DEFENSE": 5
      }
    }
  },
  "SETTLEMENT": {
    "CASTLE_TOWN": {
      "MAX": "infinite",
      "UPGRADE": {
        "COST": {
          "gold": 1000,
          "iron": 1500,
          "wood": 2000
        },
        "TIME_MS": 7200000
      },
      "NEXT_TYPE": "FORTIFIED_SETTLEMENT",
      "RECRUITMENT": {
        "KNIGHT": {
          "COST": {
            "gold": 300,
            "iron": 100,
            "wood": 150
          },
          "TIME_MS": 120000
        },
        "ARCHMAGE": {
          "COST": {
            "gold": 500,
            "iron": 150,
            "wood": 200
          },
          "TIME_MS": 180000
        }
      },
      "RESOURCES_CAP": {
        "gold": 50000,
        "iron": 40000,
        "wood": 60000
      },
      "RESOURCE_GENERATION_BASE": {
        "gold": 20,
        "iron": 30,
        "wood": 40
      }
    },
    "MINING_TOWN": {
      "MAX": "infinite",
      "UPGRADE": {
        "COST": {
          "gold": 500,
          "iron": 800,
          "wood": 1000
        },
        "TIME_MS": 3600000
      },
      "NEXT_TYPE": "CASTLE_TOWN",
      "RECRUITMENT": {
        "ARCHER": {
          "COST": {
            "gold": 150,
            "iron": 30,
            "wood": 80
          },
          "TIME_MS": 90000
        },
        "SWORDSMAN": {
          "COST": {
            "gold": 100,
            "iron": 20,
            "wood": 50
          },
          "TIME_MS": 60000
        }
      },
      "RESOURCES_CAP": {
        "gold": 10000,
        "iron": 15000,
        "wood": 20000
      },
      "RESOURCE_GENERATION_BASE": {
        "gold": 10,
        "iron": 15,
        "wood": 20
      }
    },
    "CAPITOL_SETTLEMENT": {
      "MAX": 1,
      "UPGRADE": {
        "COST": {
          "gold": 3000,
          "iron": 4000,
          "wood": 5000
        },
        "TIME_MS": 21600000
      },
      "RECRUITMENT": {},
      "RESOURCES_CAP": {
        "gold": 100000,
        "iron": 150000,
        "wood": 200000
      },
      "RESOURCE_GENERATION_BASE": {
        "gold": 50,
        "iron": 75,
        "wood": 100
      }
    },
    "FORTIFIED_SETTLEMENT": {
      "MAX": "infinite",
      "UPGRADE": {
        "COST": {
          "gold": 1500,
          "iron": 2000,
          "wood": 2500
        },
        "TIME_MS": 10800000
      },
      "NEXT_TYPE": "CAPITOL_SETTLEMENT",
      "RECRUITMENT": {
        "LUCHADOR": {
          "COST": {
            "gold": 400,
            "iron": 150,
            "wood": 200
          },
          "TIME_MS": 150000
        }
      },
      "RESOURCES_CAP": {
        "gold": 75000,
        "iron": 80000,
        "wood": 100000
      },
      "RESOURCE_GENERATION_BASE": {
        "gold": 30,
        "iron": 45,
        "wood": 60
      }
    }
  },
  "WORLD_BOUNDS": [
    [
      53.51,
      14.42
    ],
    [
      53.51,
      14.65
    ],
    [
      53.35,
      14.65
    ],
    [
      53.35,
      14.42
    ],
    [
      53.51,
      14.42
    ]
  ],
  "MAX_USER_IS_ONLINE_SECONDS": 3600,
  "MAX_RADIUS_TO_DISCOVER_METERS": 1000,
  "MAX_RADIUS_TO_TAKE_ACTION_METERS": 500,
  "MAX_USER_SPEED_METERS_PER_SECOND": 10,
  "DEFAULT_RESOURCE_DISPOSITION_RATE": "1.5"
}
```