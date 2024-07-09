using System;
using System.Collections.Generic;
using System.Linq;
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
            var response = await GetHuggingFaceResponse(request.Message);
            return Ok(new { Response = response });
        }

        private async Task<string> GetHuggingFaceResponse(string message)
        {
            var huggingFaceApiUrl = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"; //meta-llama/Meta-Llama-3-8B-Instruct
            var apiKey = "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";

            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            var content = new StringContent($"{{\"inputs\":\"{message}\"}}", System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(huggingFaceApiUrl, content);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            return responseString;
        }   
    }
    public class ChatRequest
    {
        public string? Message { get; set; }
    }
}