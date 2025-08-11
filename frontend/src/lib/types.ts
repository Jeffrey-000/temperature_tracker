export type TempData = {
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
  current: TempData | null;
  maxTemp: TempData | null;
  minTemp: TempData | null;
  maxHumidity: TempData | null;
  minHumidity: TempData | null;
};
