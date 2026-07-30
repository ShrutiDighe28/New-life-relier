using System;
using System.Collections.Generic;

namespace LifeRelier.Application.DTOs.Prescription;

public class PrescriptionMedicineDto
{
    public string Name { get; set; } = string.Empty;
    public string Strength { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
}

public class PrescriptionSaveDto
{
    public string DoctorName { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string Diagnosis { get; set; } = string.Empty;
    public int Confidence { get; set; }
    public string OriginalImageUri { get; set; } = string.Empty;
    public string OcrText { get; set; } = string.Empty;
    public string FollowUp { get; set; } = string.Empty;
    public string PrescriptionDate { get; set; } = string.Empty;
    public List<string> Warnings { get; set; } = new();
    public List<PrescriptionMedicineDto> Medicines { get; set; } = new();
}

public class PrescriptionDto
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
    public DateTime ScanDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<string> Warnings { get; set; } = new();
    public List<PrescriptionMedicineDto> Medicines { get; set; } = new();
}
