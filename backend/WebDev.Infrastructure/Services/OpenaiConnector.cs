using System;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using WebDev.API.Configuration;
using WebDev.Core.Interfaces;
using WebDev.Core.Models;

namespace WebDev.Infrastructure.Services;

public sealed class OpenaiConnector : IOpenaiConnector
{
    private const string _prompt = @"
You are a professional productivity assistant that generates a clear, concise weekly overview based on a user’s calendar for one specific week.

The user will provide:
	•	The week (dates or label, e.g. “Week of 3–9 March 2025”)
	•	A list of meetings, tasks, and other planned items for that week (any mix of work and personal)

⸻

Your job
	1.	Analyze the schedule for patterns: busy vs. light days, clusters of meetings, focus time, risks, and opportunities.
	2.	Produce a short, professional weekly overview that is easy to scan and visually clean.
	3.	Always use the exact markdown structure and formatting rules defined below.

⸻

Output format (must be followed exactly)

Your entire response MUST be valid markdown and follow exactly this template and headings.
Do not add or remove sections, and do not add any introductory or closing text.

# Weekly Overview – {{WEEK_LABEL}}

## 1. Snapshot
- Workload: {{one short phrase, e.g. 'Moderate with two very busy days'}}
- Main focus: {{one short phrase on the main themes of the week}}
- Key events: {{1 concise sentence highlighting the most important items}}

## 2. Top Priorities (max 5)
1. {{priority 1 – 1 short sentence, action-oriented}}
2. {{priority 2}}
3. {{priority 3}}
4. {{priority 4 (optional)}}
5. {{priority 5 (optional)}}

## 3. Day-by-Day View
**Monday – {{date}}**  
- {{0–4 bullets with the most relevant meetings/tasks and their time ranges}}
- {{include 1 short “focus tip” if useful}}

**Tuesday – {{date}}**  
- {{bullets as above}}

**Wednesday – {{date}}**  
- {{bullets as above}}

**Thursday – {{date}}**  
- {{bullets as above}}

**Friday – {{date}}**  
- {{bullets as above}}

**Weekend**  
- {{0–3 bullets on any notable plans or explicit suggestion to rest / recharge}}

## 4. Risks & Bottlenecks
- {{risk or bottleneck 1 – keep it specific and short}}
- {{risk or bottleneck 2 (optional)}}
- {{if none are obvious, write: 'None clearly visible from the schedule.''}}

## 5. Action Checklist
- [ ] {{simple preparatory action 1 (e.g. 'Block focus time on Thu morning')}}
- [ ] {{action 2}}
- [ ] {{action 3}}
- [ ] {{add more only if they are clearly useful}}


⸻

Style rules (always apply)
	•	Tone: professional, calm, supportive.
	•	Be concise: no long paragraphs; keep sentences short and to the point.
	•	No emojis, no slang, no exclamation marks.
	•	Do not repeat the raw schedule back; summarize and synthesize.
	•	If the schedule is sparse, still fill all sections, focusing on priorities and suggested use of open time.
	•	If information is missing (e.g. no weekend items), still keep the section and say something like “No specific plans noted.”

⸻

Input format

At the end of this prompt, the user will provide the context in this structure:

Week: {{WEEK_LABEL}}
Timezone: {{TIMEZONE (if provided)}}
Schedule:
{{list of meetings / tasks / events for the week, including dates, times, titles, and any notes}}

Use that schedule to produce the markdown output exactly as specified above.";


    private static readonly HttpClient _client = new HttpClient();
    private readonly OpenaiOptions _options;
    private readonly IEventService _eventService;
    public OpenaiConnector(IOptions<OpenaiOptions> options, IEventService eventService)
    {
        _eventService = eventService;

        _options = options.Value;
        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        }
    }

    public async Task<string> AskGPT(int userId)
    {
        if (string.IsNullOrWhiteSpace(_options.ConnectionLink))
        {
            throw new InvalidOperationException("OpenAI connection link is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("OpenAI API key is not configured.");
        }

        var start = DateTime.UtcNow.Date;
        var end = start.AddDays(7);
        var events = await _eventService.GetEventsByUserAndDateRangeAsync(userId, start, end);

        var scheduleSection = BuildScheduleSection(start, end, events);
        var prompt = $"{_prompt}\n\n{scheduleSection}";

        var model = string.IsNullOrWhiteSpace(_options.Model) ? "gpt-4o-mini" : _options.Model;
        var payload = JsonSerializer.Serialize(new
        {
            model,
            input = prompt
        });
        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await _client.PostAsync(_options.ConnectionLink, content);

        if (response.StatusCode == HttpStatusCode.TooManyRequests)
        {
            var detail = await response.Content.ReadAsStringAsync();
            var limitInfo = string.Join(
                "; ",
                new[]
                {
                    ReadHeader(response, "x-ratelimit-limit-requests"),
                    ReadHeader(response, "x-ratelimit-remaining-requests"),
                    ReadHeader(response, "x-ratelimit-reset-requests")
                }.Where(v => !string.IsNullOrWhiteSpace(v)));

            var message = string.IsNullOrWhiteSpace(limitInfo)
                ? $"OpenAI rate limit hit: {detail}"
                : $"OpenAI rate limit hit: {detail} ({limitInfo})";

            throw new HttpRequestException(message, null, response.StatusCode);
        }

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"OpenAI request failed ({(int)response.StatusCode}): {detail}", null, response.StatusCode);
        }

        return await response.Content.ReadAsStringAsync();
    }

    private static string BuildScheduleSection(DateTime start, DateTime end, IReadOnlyCollection<Event> events)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"Week: {start:yyyy-MM-dd} to {end:yyyy-MM-dd}");
        builder.AppendLine("Timezone: UTC");
        builder.AppendLine("Schedule:");

        if (events.Count == 0)
        {
            builder.AppendLine("No events scheduled.");
            return builder.ToString();
        }

        foreach (var evt in events.OrderBy(e => e.StartTime))
        {
            var description = string.IsNullOrWhiteSpace(evt.Description) ? string.Empty : $" - {evt.Description}";
            builder.AppendLine($"- {evt.StartTime:u} to {evt.EndTime:u} | {evt.Name}{description}");
        }

        return builder.ToString();
    }

    private static string ReadHeader(HttpResponseMessage response, string headerName) =>
        response.Headers.TryGetValues(headerName, out var values)
            ? $"{headerName}: {values.FirstOrDefault()}"
            : string.Empty;
}
