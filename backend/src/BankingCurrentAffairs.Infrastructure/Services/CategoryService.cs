using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BankingCurrentAffairs.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                NameEn = c.NameEn,
                NameHi = c.NameHi,
                Slug = c.Slug,
                DescriptionEn = c.DescriptionEn,
                DescriptionHi = c.DescriptionHi,
                Icon = c.Icon,
                DisplayOrder = c.DisplayOrder,
                ItemCount = c.Items.Count
            })
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var c = await _context.Categories
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (c == null) return null;

        return new CategoryDto
        {
            Id = c.Id,
            NameEn = c.NameEn,
            NameHi = c.NameHi,
            Slug = c.Slug,
            DescriptionEn = c.DescriptionEn,
            DescriptionHi = c.DescriptionHi,
            Icon = c.Icon,
            DisplayOrder = c.DisplayOrder,
            ItemCount = c.Items.Count
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryDto dto)
    {
        var entity = new Category
        {
            NameEn = dto.NameEn,
            NameHi = dto.NameHi,
            Slug = string.IsNullOrWhiteSpace(dto.Slug) ? dto.NameEn.ToLowerInvariant().Replace(" ", "-") : dto.Slug,
            DescriptionEn = dto.DescriptionEn,
            DescriptionHi = dto.DescriptionHi,
            Icon = dto.Icon,
            DisplayOrder = dto.DisplayOrder,
            IsActive = true
        };

        _context.Categories.Add(entity);
        await _context.SaveChangesAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, CategoryDto dto)
    {
        var entity = await _context.Categories.FindAsync(id);
        if (entity == null) return null;

        entity.NameEn = dto.NameEn;
        entity.NameHi = dto.NameHi;
        entity.Slug = dto.Slug;
        entity.DescriptionEn = dto.DescriptionEn;
        entity.DescriptionHi = dto.DescriptionHi;
        entity.Icon = dto.Icon;
        entity.DisplayOrder = dto.DisplayOrder;

        await _context.SaveChangesAsync();
        return dto;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var entity = await _context.Categories.FindAsync(id);
        if (entity == null) return false;

        entity.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();
        return true;
    }
}
