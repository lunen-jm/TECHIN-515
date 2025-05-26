// Test data generator for chart development
export const generateTestSensorData = (count: number = 24) => {
  const now = new Date();
  const data = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // hourly data
    data.push({
      timestamp,
      value: Math.round((Math.random() * 30 + 20) * 10) / 10 // 20-50 range with 1 decimal
    });
  }
  
  return data;
};

export const generateTestData = () => {
  return {
    temperature: generateTestSensorData(24).map(d => ({
      ...d,
      value: Math.round((Math.random() * 15 + 20) * 10) / 10 // 20-35°C
    })),
    humidity: generateTestSensorData(24).map(d => ({
      ...d,
      value: Math.round((Math.random() * 50 + 30) * 10) / 10 // 30-80%
    })),
    co2: generateTestSensorData(24).map(d => ({
      ...d,
      value: Math.round(Math.random() * 800 + 400) // 400-1200 ppm
    })),
    lidar: generateTestSensorData(24).map(d => ({
      ...d,
      value: Math.round(Math.random() * 250 + 50) // 50-300 cm
    })),
    outdoorTemp: generateTestSensorData(24).map(d => ({
      ...d,
      value: Math.round((Math.random() * 20 + 5) * 10) / 10 // 5-25°C
    }))
  };
};
