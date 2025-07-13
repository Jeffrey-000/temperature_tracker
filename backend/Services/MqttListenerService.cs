using Microsoft.Extensions.Hosting;
using MQTTnet;
using System.Text.Json;
using System.Text;
using MQTT.Database;
using MQTT.Models;


public class MqttListenerService : BackgroundService {
    private readonly string MQTT_SERVER = Environment.GetEnvironmentVariable("MQTT_SERVER");
    private readonly string TOPIC = Environment.GetEnvironmentVariable("TOPIC");
    private readonly PostgresService _db;

    public MqttListenerService(PostgresService db) => _db = db;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        var mqttFactory = new MqttClientFactory();
        using var mqttClient = mqttFactory.CreateMqttClient();

        var options = new MqttClientOptionsBuilder()
            .WithTcpServer(MQTT_SERVER, 1883)
            .Build();

        mqttClient.ApplicationMessageReceivedAsync += async e => {
            var data = MessageHandler.handleReceive(e);
            await _db.SaveSensorDataAsync(data);
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
    public static SensorData handleReceive(MqttApplicationMessageReceivedEventArgs e) {
        // Console.WriteLine("Received application message.");
        string jasonString = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
        // Console.WriteLine($"+ Topic = {e.ApplicationMessage.Topic}");
        // Console.WriteLine($"+ Payload = {jasonString}");

        // Console.WriteLine($"+ QoS = {e.ApplicationMessage.QualityOfServiceLevel}");
        // Console.WriteLine($"+ Retain = {e.ApplicationMessage.Retain}");
        SensorData data = JsonSerializer.Deserialize<SensorData>(jasonString);
        // Console.WriteLine(data.time);
        return data;
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

