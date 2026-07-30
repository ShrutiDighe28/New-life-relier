using LifeRelier.Application.DTOs.Prescription;
using LifeRelier.Application.Interfaces;
using LifeRelier.Domain.Entities;
using LifeRelier.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LifeRelier.Infrastructure.Services;

public class PrescriptionService : IPrescriptionService
{
    private readonly LifeRelierDbContext _context;

    public PrescriptionService(LifeRelierDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<PrescriptionDto> SavePrescriptionAsync(PrescriptionSaveDto dto)
    {
        var prescription = new Prescription
        {
            Id = Guid.NewGuid(),
            DoctorName = dto.DoctorName,
            HospitalName = dto.HospitalName,
            PatientName = dto.PatientName,
            Diagnosis = dto.Diagnosis,
            Confidence = dto.Confidence,
            OriginalImageUri = dto.OriginalImageUri,
            OcrText = dto.OcrText,
            FollowUp = dto.FollowUp,
            PrescriptionDate = dto.PrescriptionDate,
            ScanDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Warnings = dto.Warnings,
            Medicines = dto.Medicines.Select(m => new PrescriptionMedicine
            {
                Id = Guid.NewGuid(),
                Name = m.Name,
                Strength = m.Strength,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                Duration = m.Duration,
                Instructions = m.Instructions
            }).ToList()
        };

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();

        return MapToDto(prescription);
    }

    public async Task<List<PrescriptionDto>> GetPrescriptionHistoryAsync(string patientId)
    {
        IQueryable<Prescription> query = _context.Prescriptions.Include(p => p.Medicines);

        // Flexible filter: if patientId is demo-patient or empty, retrieve all to ensure the UI lists items cleanly in demo mode.
        if (!string.IsNullOrWhiteSpace(patientId) && 
            !patientId.Equals("demo-patient", StringComparison.OrdinalIgnoreCase) && 
            !patientId.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(p => p.PatientName.Contains(patientId) || p.DoctorName.Contains(patientId));
        }

        var list = await query
            .OrderByDescending(p => p.ScanDate)
            .ToListAsync();

        return list.Select(MapToDto).ToList();
    }

    public async Task<PrescriptionDto?> GetPrescriptionByIdAsync(Guid id)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Medicines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (prescription == null) return null;

        return MapToDto(prescription);
    }

    public async Task<PrescriptionDto?> UpdatePrescriptionAsync(Guid id, PrescriptionSaveDto dto)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Medicines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (prescription == null) return null;

        prescription.DoctorName = dto.DoctorName;
        prescription.HospitalName = dto.HospitalName;
        prescription.PatientName = dto.PatientName;
        prescription.Diagnosis = dto.Diagnosis;
        prescription.Confidence = dto.Confidence;
        prescription.OriginalImageUri = dto.OriginalImageUri;
        prescription.OcrText = dto.OcrText;
        prescription.FollowUp = dto.FollowUp;
        prescription.PrescriptionDate = dto.PrescriptionDate;
        prescription.Warnings = dto.Warnings;
        prescription.UpdatedAt = DateTime.UtcNow;

        // Clear existing medicines and add new ones (cascade delete handles orphans)
        _context.PrescriptionMedicines.RemoveRange(prescription.Medicines);
        prescription.Medicines = dto.Medicines.Select(m => new PrescriptionMedicine
        {
            Id = Guid.NewGuid(),
            PrescriptionId = id,
            Name = m.Name,
            Strength = m.Strength,
            Dosage = m.Dosage,
            Frequency = m.Frequency,
            Duration = m.Duration,
            Instructions = m.Instructions
        }).ToList();

        await _context.SaveChangesAsync();

        return MapToDto(prescription);
    }

    public async Task<bool> DeletePrescriptionAsync(Guid id)
    {
        var prescription = await _context.Prescriptions.FindAsync(id);
        if (prescription == null) return false;

        _context.Prescriptions.Remove(prescription);
        await _context.SaveChangesAsync();
        return true;
    }

    private static PrescriptionDto MapToDto(Prescription p)
    {
        return new PrescriptionDto
        {
            Id = p.Id,
            DoctorName = p.DoctorName,
            HospitalName = p.HospitalName,
            PatientName = p.PatientName,
            Diagnosis = p.Diagnosis,
            Confidence = p.Confidence,
            OriginalImageUri = p.OriginalImageUri,
            OcrText = p.OcrText,
            FollowUp = p.FollowUp,
            PrescriptionDate = p.PrescriptionDate,
            ScanDate = p.ScanDate,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            Warnings = p.Warnings,
            Medicines = p.Medicines.Select(m => new PrescriptionMedicineDto
            {
                Name = m.Name,
                Strength = m.Strength,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                Duration = m.Duration,
                Instructions = m.Instructions
            }).ToList()
        };
    }
}
