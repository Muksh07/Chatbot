using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Chatbotbackend : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public Chatbotbackend(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            var response = await GetGoogleGenerativeAIResponse(request.Message);
            return Ok(response); // Return the response as-is
        }

        private async Task<string> GetGoogleGenerativeAIResponse(string message)
        {
            var googleGenerativeAiServiceUrl = "http://localhost:4000/generate"; // The URL of your Node.js service

            try
            {
                var payload = new { prompt = message };
                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(googleGenerativeAiServiceUrl, content);
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                return responseString; // Return the raw JSON response
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Node.js service: {ex.Message}");
                return $"{{ \"error\": \"{ex.Message}\" }}"; // Return error JSON
            }
        }

        public class ChatRequest
        {
            public string? Message { get; set; }
        }
    }
}
