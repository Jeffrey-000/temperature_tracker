using Microsoft.AspNetCore.Mvc;
using MQTT.Database;
using MQTT.Models;

namespace MQTT.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SensorController : ControllerBase {
    private readonly PostgresService _db;

    public SensorController(PostgresService db) => _db = db;

    [HttpGet("temps")]
    public async Task<IEnumerable<SensorData>> GetTemps([FromQuery] string? topic = "sensors/temperature/esp32/bedroom",
                                                    [FromQuery] int? limit = null,
                                                    [FromQuery] int? start = null,
                                                    [FromQuery] int? stop = null) =>
        await _db.GetRecentAsync(topic!, limit, start, stop);

    [HttpGet("min_time")]
    public async Task<long> GetMinTime([FromQuery] string? topic = "sensors/temperature/esp32/bedroom") =>
        await _db.GetOldestEntry(topic!);


    [HttpGet("topic_list")]
    public async Task<IEnumerable<string>> GetTopicList() =>
        await _db.GetTopicList();
}
