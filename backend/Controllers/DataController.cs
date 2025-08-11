using Microsoft.AspNetCore.Mvc;

using MQTT.Database;
using MQTT.Models;

namespace MQTT.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase {
    private readonly PostgresService _db;

    public DataController(PostgresService db) => _db = db;

    [HttpGet("{topic}")]
    public async Task<ActionResult<IEnumerable<SensorData>>> GetData(string topic,
                                                    [FromQuery] uint? limit = null,
                                                    [FromQuery] int? start = null,
                                                    [FromQuery] int? stop = null) {

        var data = await _db.GetSensorDataAsync(topic, limit, start, stop);
        return Ok(data);

    }




    [HttpGet("{topic}/statistics")]
    public async Task<ActionResult<TopicStats>> GetStats(string topic,
                                        [FromQuery] ulong? start = null, [FromQuery] ulong? end = null) {

        throw new NotImplementedException();
    }
}
