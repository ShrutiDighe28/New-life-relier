using System;
using System.Collections.Generic;

namespace LifeRelier.Domain.Entities;

public class Prescription
{
    public Guid Id { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string Diagnosis { get; set; } = string.Empty;
    public int Confidence { get; set; }
    public string OriginalImageUri { get; set; } = string.Empty;
    public string OcrText { get; set; } = string.Empty;
    public string FollowUp { get; set; } = string.Empty;
    public string PrescriptionDate { get; set; } = string.Empty;
    public DateTime ScanDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<string> Warnings { get; set; } = new();

    // Navigation property
    public List<PrescriptionMedicine> Medicines { get; set; } = new();
}
