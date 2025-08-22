using Microsoft.Extensions.Hosting;
using MQTTnet;
using System.Text.Json;
using System.Text;
using MQTT.Database;
using MQTT.Models;
using MQTT.SECRETS;


public class MqttListenerService : BackgroundService {
    private readonly string MQTT_SERVER = SECRETS.MQTT_SERVER;
    private readonly string TOPIC = "sensors/temperature/#"; //all topics that start with sensors/esp32/temperature
    private readonly PostgresService _db;

    public MqttListenerService(PostgresService db) => _db = db;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        var mqttFactory = new MqttClientFactory();
        using var mqttClient = mqttFactory.CreateMqttClient();

        var options = new MqttClientOptionsBuilder()
            .WithTcpServer(MQTT_SERVER, 1883)
            .Build();

        mqttClient.ApplicationMessageReceivedAsync += async e => {
            string topic = e.ApplicationMessage.Topic.Replace("/", "_");
            var data = MessageHandler.handleReceive(e);
            if (data is not null)
                await _db.SaveSensorDataAsync(topic, data);
        };


        await mqttClient.ConnectAsync(options, CancellationToken.None);

        var mqttSubscribeOptions = mqttFactory.CreateSubscribeOptionsBuilder()
            .WithTopicFilter(TOPIC)
            .Build();

        MqttClientSubscribeResult response = await mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);

        Console.WriteLine($"MQTT client subscribed to topic.");
        response.DumpToConsole();
        await Task.Delay(-1, stoppingToken);
    }
}


static class MessageHandler {
    public static SensorData? handleReceive(MqttApplicationMessageReceivedEventArgs e) {
        string jasonString = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
        if (jasonString is null)
            return null;
        try {
            SensorData? data = JsonSerializer.Deserialize<SensorData>(jasonString);
            return data;
        } catch (Exception) {
            return null;
        }

    }

    public static TObject DumpToConsole<TObject>(this TObject @object) {
        var output = "NULL";
        if (@object != null) {
            output = JsonSerializer.Serialize(@object, new JsonSerializerOptions {
                WriteIndented = true
            });
        }

        Console.WriteLine($"[{@object?.GetType().Name}]:\r\n{output}");
        return @object;
    }


}

