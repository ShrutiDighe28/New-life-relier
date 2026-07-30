using System;
using System.Text.Json.Serialization;

namespace LifeRelier.Domain.Entities;

public class PrescriptionMedicine
{
    public Guid Id { get; set; }
    public Guid PrescriptionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Strength { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;

    // Navigation property
    [JsonIgnore]
    public Prescription? Prescription { get; set; }
}
