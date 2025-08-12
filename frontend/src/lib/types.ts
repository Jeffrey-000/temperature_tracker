export type SensorData = {
  temperature: number;
  humidity: number;
  time: Date;
};
export type disabledDatesType = {
  before?: Date;
  after?: Date;
  dates?: Date[];
};

export type CalculatedDataPoints = {
  current: SensorData | null;
  maxTemp: SensorData | null;
  minTemp: SensorData | null;
  maxHumidity: SensorData | null;
  minHumidity: SensorData | null;
};

export type TopicStats = {
  current: SensorData;
  max: Max;
  min: Min;
};

type Max = {
  temperature: SensorData;
  humidity: SensorData;
};

type Min = {
  temperature: SensorData;
  humidity: SensorData;
};
