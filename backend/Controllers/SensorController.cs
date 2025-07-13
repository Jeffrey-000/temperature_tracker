using Microsoft.AspNetCore.Mvc;
using MQTT.Database;
using MQTT.Models;

namespace MqttToPostgresApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SensorController : ControllerBase {
    private readonly PostgresService _db;

    public SensorController(PostgresService db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<SensorData>> Get([FromQuery] int? limit = null,
                                                    [FromQuery] int? start = null,
                                                    [FromQuery] int? stop = null) =>
        await _db.GetRecentAsync(limit, start, stop);

    [HttpGet("min_time")]
    public async Task<long> GetMinTime() =>
        await _db.GetOldestEntry();
}
