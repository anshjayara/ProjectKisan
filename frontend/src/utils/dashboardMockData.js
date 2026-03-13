const SENSOR_TEMPLATES = [
  { id: "moisture", label: "Soil Moisture", unit: "%", icon: "SM" },
  { id: "temperature", label: "Temperature", unit: "deg C", icon: "TP" },
  { id: "humidity", label: "Humidity", unit: "%", icon: "HM" },
  { id: "ph", label: "Soil pH", unit: "", icon: "PH" },
  { id: "light", label: "Light Intensity", unit: "", icon: "LT" },
];

const SUGGESTION_POOL = [
  {
    id: "irrigation-12h",
    title: "Irrigation Recommended",
    description: "Soil moisture levels are dropping; irrigation suggested within the next 12 hours.",
    priority: "high",
    icon: "IR",
  },
  {
    id: "inspect-fungal",
    title: "Inspect Leaves for Fungal Infection",
    description: "Humidity and warm conditions can increase fungal risk. Inspect lower leaves for early spots.",
    priority: "medium",
    icon: "FG",
  },
  {
    id: "delay-spray-rain",
    title: "Delay Pesticide Spraying",
    description: "Rain risk can reduce spray effectiveness. Delay field spray and re-check weather update.",
    priority: "medium",
    icon: "RN",
  },
  {
    id: "soil-nutrient-check",
    title: "Check Soil Nutrient Levels",
    description: "Run a quick nutrient check to keep crop development uniform across beds.",
    priority: "low",
    icon: "SN",
  },
  {
    id: "monitor-heat-stress",
    title: "Monitor Crop Temperature Stress",
    description: "Daytime canopy temperature is elevated. Increase monitoring in exposed rows.",
    priority: "high",
    icon: "HT",
  },
  {
    id: "organic-pest-control",
    title: "Apply Organic Pest Control if Needed",
    description: "Prepare neem-based treatment in case early pest activity is confirmed.",
    priority: "medium",
    icon: "PC",
  },
];

const ALERT_POOL = [
  {
    id: "fungal-risk",
    title: "Fungal Disease Risk",
    description: "Humidity above 80% can accelerate fungal spread in dense crop sections.",
    severity: "medium",
  },
  {
    id: "heavy-rain",
    title: "Heavy Rain Warning",
    description: "Rain probability is elevated. Avoid nutrient spray during the expected rain window.",
    severity: "medium",
  },
  {
    id: "low-moisture",
    title: "Low Soil Moisture",
    description: "Soil moisture has moved near crop stress levels in monitored zones.",
    severity: "high",
  },
  {
    id: "high-temp",
    title: "High Temperature Stress",
    description: "Temperature is nearing stress thresholds for sensitive crop stages.",
    severity: "high",
  },
  {
    id: "pest-risk",
    title: "Pest Activity Risk",
    description: "Conditions may support rising pest movement. Increase scouting frequency.",
    severity: "medium",
  },
];

const ALERT_TIMES = ["10 min ago", "25 min ago", "1 hour ago", "2 hours ago", "3 hours ago"];

function randomBetween(min, max, precision = 0) {
  const value = Math.random() * (max - min) + min;
  if (precision === 0) {
    return Math.round(value);
  }
  return Number(value.toFixed(precision));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function generateSensorData() {
  return {
    soilMoisture: randomBetween(20, 80),
    temperature: randomBetween(18, 38),
    humidity: randomBetween(40, 95),
    soilPH: randomBetween(5.5, 7.5, 1).toFixed(1),
    light: pickRandom(["Low", "Medium", "High"]),
  };
}

function getSensorStatus(sensorData, sensorId) {
  if (sensorId === "moisture") {
    if (sensorData.soilMoisture < 30) {
      return "critical";
    }
    if (sensorData.soilMoisture < 40 || sensorData.soilMoisture > 70) {
      return "warning";
    }
    return "normal";
  }

  if (sensorId === "temperature") {
    if (sensorData.temperature >= 35) {
      return "critical";
    }
    if (sensorData.temperature >= 31 || sensorData.temperature <= 20) {
      return "warning";
    }
    return "normal";
  }

  if (sensorId === "humidity") {
    if (sensorData.humidity >= 90) {
      return "critical";
    }
    if (sensorData.humidity >= 80 || sensorData.humidity <= 45) {
      return "warning";
    }
    return "normal";
  }

  if (sensorId === "ph") {
    const phValue = Number(sensorData.soilPH);
    if (phValue < 5.8 || phValue > 7.3) {
      return "warning";
    }
    return "normal";
  }

  if (sensorData.light === "Low") {
    return "warning";
  }
  return "normal";
}

export function toSensorCards(sensorData) {
  return SENSOR_TEMPLATES.map((sensor) => {
    if (sensor.id === "moisture") {
      return {
        ...sensor,
        value: String(sensorData.soilMoisture),
        status: getSensorStatus(sensorData, "moisture"),
      };
    }

    if (sensor.id === "temperature") {
      return {
        ...sensor,
        value: String(sensorData.temperature),
        status: getSensorStatus(sensorData, "temperature"),
      };
    }

    if (sensor.id === "humidity") {
      return {
        ...sensor,
        value: String(sensorData.humidity),
        status: getSensorStatus(sensorData, "humidity"),
      };
    }

    if (sensor.id === "ph") {
      return {
        ...sensor,
        value: sensorData.soilPH,
        status: getSensorStatus(sensorData, "ph"),
      };
    }

    return {
      ...sensor,
      value: sensorData.light,
      status: getSensorStatus(sensorData, "light"),
    };
  });
}

function dedupeById(items) {
  const unique = new Map();
  items.forEach((item) => {
    if (!unique.has(item.id)) {
      unique.set(item.id, item);
    }
  });
  return [...unique.values()];
}

function getInterpretedSuggestions(sensorData) {
  const suggestions = [];

  if (sensorData.soilMoisture <= 35) {
    suggestions.push(SUGGESTION_POOL.find((item) => item.id === "irrigation-12h"));
  }

  if (sensorData.humidity >= 80 && sensorData.temperature > 25) {
    suggestions.push(SUGGESTION_POOL.find((item) => item.id === "inspect-fungal"));
  }

  if (sensorData.temperature >= 33) {
    suggestions.push(SUGGESTION_POOL.find((item) => item.id === "monitor-heat-stress"));
  }

  if (sensorData.humidity <= 50 || sensorData.light === "Low") {
    suggestions.push(SUGGESTION_POOL.find((item) => item.id === "soil-nutrient-check"));
  }

  return suggestions.filter(Boolean);
}

function addAlertTime(alert) {
  return {
    ...alert,
    time: pickRandom(ALERT_TIMES),
  };
}

function getInterpretedAlerts(sensorData) {
  const alerts = [];

  if (sensorData.humidity >= 80 && sensorData.temperature > 25) {
    alerts.push(ALERT_POOL.find((item) => item.id === "fungal-risk"));
  }

  if (sensorData.soilMoisture <= 30) {
    alerts.push(ALERT_POOL.find((item) => item.id === "low-moisture"));
  }

  if (sensorData.temperature >= 34) {
    alerts.push(ALERT_POOL.find((item) => item.id === "high-temp"));
  }

  if (sensorData.humidity >= 70 && sensorData.light === "Low") {
    alerts.push(ALERT_POOL.find((item) => item.id === "pest-risk"));
  }

  return alerts.filter(Boolean).map(addAlertTime);
}

export function getRandomSuggestions(sensorData) {
  const interpreted = getInterpretedSuggestions(sensorData);
  const randomCount = randomInt(3, 4);
  const randomSuggestions = shuffleArray(SUGGESTION_POOL).slice(0, randomCount);
  return dedupeById([...interpreted, ...randomSuggestions]).slice(0, 4);
}

export function generateRandomAlerts(sensorData) {
  const interpreted = getInterpretedAlerts(sensorData);
  const randomCount = randomInt(2, 3);
  const randomAlerts = shuffleArray(ALERT_POOL)
    .slice(0, randomCount)
    .map(addAlertTime);

  return dedupeById([...interpreted, ...randomAlerts]).slice(0, 3);
}

export function generateDashboardData() {
  const sensorData = generateSensorData();
  return {
    sensorData: toSensorCards(sensorData),
    suggestions: getRandomSuggestions(sensorData),
    alerts: generateRandomAlerts(sensorData),
  };
}
