export type disabledDatesType = {
  before?: Date;
  after?: Date;
  dates?: Date[];
};

export type SensorDataDB = {
  temperature: number;
  humidity: number;
  time: number;
};
export type SensorData = Omit<SensorDataDB, "time"> & { time: Date };

export type TopicStats = {
  current: SensorData;
  maxTemp: SensorData[];
  minTemp: SensorData[];
  maxHumidity: SensorData[];
  minHumidity: SensorData[];
};
export type TopicStatsDB = {
  current: SensorDataDB;
  maxTemp: SensorDataDB[];
  minTemp: SensorDataDB[];
  maxHumidity: SensorDataDB[];
  minHumidity: SensorDataDB[];
};
export type TopicMetaDataDto = { start: number; end: number };
