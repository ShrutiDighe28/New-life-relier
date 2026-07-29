using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LifeRelier.Application.DTOs.Prescription;

namespace LifeRelier.Application.Interfaces;

public interface IPrescriptionService
{
    Task<PrescriptionDto> SavePrescriptionAsync(PrescriptionSaveDto dto);
    Task<List<PrescriptionDto>> GetPrescriptionHistoryAsync(string patientId);
    Task<PrescriptionDto?> GetPrescriptionByIdAsync(Guid id);
    Task<PrescriptionDto?> UpdatePrescriptionAsync(Guid id, PrescriptionSaveDto dto);
    Task<bool> DeletePrescriptionAsync(Guid id);
}
