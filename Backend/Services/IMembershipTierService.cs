using AdinsLibrary.DTOs;

namespace AdinsLibrary.Services
{
    public interface IMembershipTierService
    {
        Task<List<MembershipTierResponse>> GetAllAsync();
        Task<MembershipTierResponse?> GetByIdAsync(long id);
        Task<MembershipTierResponse> CreateAsync(MembershipTierRequest request);
        Task<MembershipTierResponse?> UpdateAsync(long id, MembershipTierRequest request);
        Task<MembershipTierResponse?> DeleteAsync(long id);
    }
}
