using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CategoryDto dto);
    Task<CategoryDto?> UpdateCategoryAsync(int id, CategoryDto dto);
    Task<bool> DeleteCategoryAsync(int id);
}
