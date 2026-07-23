using LifeRelier.Application.DTOs.AI;
using LifeRelier.Infrastructure.AI.Services;
using Xunit;

namespace LifeRelier.UnitTests;

public class GeminiServiceTests
{
    [Theory]
    [InlineData("I have severe chest pain spreading to my left arm")]
    [InlineData("I'm experiencing shortness of breath and trouble breathing")]
    [InlineData("My face is drooping and speech is slurred (stroke)")]
    [InlineData("Patient passed out and lost consciousness")]
    public void SafetyValidator_DetectsEmergencySymptoms(string message)
    {
        // Act
        var isEmergency = SafetyValidator.IsEmergencySymptom(message);

        // Assert
        Assert.True(isEmergency);
    }

    [Fact]
    public void SafetyValidator_AppliesEmergencyOverrideToResponse()
    {
        // Arrange
        var response = new ChatResponseDto
        {
            Success = true,
            Response = "Here is some health advice.",
            Emergency = false,
            Recommendations = ["Rest well"],
            FollowUpQuestions = ["How do you feel?"]
        };

        // Act
        SafetyValidator.ValidateAndApplyEmergencyOverride(response, "I have severe chest pain");

        // Assert
        Assert.True(response.Emergency);
        Assert.Contains(response.Recommendations, r => r.Contains("emergency", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void ResponseFormatter_FormatsValidJsonCorrectly()
    {
        // Arrange
        var jsonText = """
            {
              "response": "Drink plenty of water and rest.",
              "emergency": false,
              "recommendations": ["Drink 2L water daily", "Get 8 hours sleep"],
              "followUpQuestions": ["How long have you felt tired?"]
            }
            """;

        // Act
        var result = ResponseFormatter.FormatFromRawJson(jsonText, "I feel tired");

        // Assert
        Assert.True(result.Success);
        Assert.False(result.Emergency);
        Assert.Equal("Drink plenty of water and rest.", result.Response);
        Assert.Equal(2, result.Recommendations.Count);
        Assert.Single(result.FollowUpQuestions);
    }

    [Fact]
    public void ResponseFormatter_UnwrapsNestedJsonStringCorrectly()
    {
        // Arrange
        var nestedJsonText = """
            {
              "response": "{\n  \"response\": \"Headaches can occur due to dehydration.\",\n  \"emergency\": false,\n  \"recommendations\": [\"Drink water\", \"Rest\"],\n  \"followUpQuestions\": [\"How long have you had it?\"]\n}"
            }
            """;

        // Act
        var result = ResponseFormatter.FormatFromRawJson(nestedJsonText, "I have a headache");

        // Assert
        Assert.True(result.Success);
        Assert.False(result.Emergency);
        Assert.Equal("Headaches can occur due to dehydration.", result.Response);
        Assert.Equal(2, result.Recommendations.Count);
        Assert.Single(result.FollowUpQuestions);
        Assert.DoesNotContain("{", result.Response);
    }

    [Fact]
    public void ResponseFormatter_FallbackOnInvalidJson()
    {
        // Arrange
        var invalidJson = "This is plain text medical guidance";

        // Act
        var result = ResponseFormatter.FormatFromRawJson(invalidJson, "I have a mild cold");

        // Assert
        Assert.True(result.Success);
        Assert.False(result.Emergency);
        Assert.Equal("This is plain text medical guidance", result.Response);
        Assert.NotEmpty(result.Disclaimer);
    }

    [Fact]
    public void PromptBuilder_BuildsUserPromptCorrectly()
    {
        // Arrange
        var request = new ChatRequestDto
        {
            Message = "  Hello doctor  ",
            Language = "es"
        };

        // Act
        var prompt = PromptBuilder.BuildUserPrompt(request);
        var systemInstruction = PromptBuilder.BuildSystemInstruction("es");

        // Assert
        Assert.Equal("Hello doctor", prompt);
        Assert.Contains("PREFERRED LANGUAGE RULE", systemInstruction);
    }
}
