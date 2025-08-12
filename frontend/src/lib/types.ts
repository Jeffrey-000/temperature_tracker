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
  current: SensorData;
  maxTemp: SensorData[];
  minTemp: SensorData[];
  maxHumidity: SensorData[];
  minHumidity: SensorData[];
};
export type CalculatedDataPointsDB = {
  current: SensorDataDB;
  maxTemp: SensorDataDB[];
  minTemp: SensorDataDB[];
  maxHumidity: SensorDataDB[];
  minHumidity: SensorDataDB[];
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

type SensorDataDB = SensorData & { time: number };
